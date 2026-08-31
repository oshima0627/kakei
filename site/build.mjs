// content/articles/*.md → dist/<slug>/index.html
// content/pages/*.md    → dist/<slug>/index.html（運営者情報などの固定ページ）
//
// 依存は marked のみ。フレームワークは入れていない。
// 実行: node build.mjs   （出力先 dist/ は .gitignore 済み）

import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { toJstDateString } from './lib/date.mjs';

const ROOT = import.meta.dirname;
// テストから content と出力先を差し替えられるようにする。
// ⚠️ 本番のビルド・デプロイでは絶対に設定しない。
const CONTENT = process.env.KAKEI_CONTENT ? path.resolve(process.env.KAKEI_CONTENT) : path.join(ROOT, 'content');
const DIST = process.env.KAKEI_DIST ? path.resolve(process.env.KAKEI_DIST) : path.join(ROOT, 'dist');

const site = JSON.parse(fs.readFileSync(path.join(CONTENT, 'site.json'), 'utf8'));

// 広告リンクの台帳。ASPが発行したURLだけをここに置く（本文には直書きさせない）。
const links = JSON.parse(fs.readFileSync(path.join(CONTENT, 'links.json'), 'utf8'));
const baseTpl = fs.readFileSync(path.join(ROOT, 'templates/base.html'), 'utf8');

const ORIGIN = site.origin.replace(/\/$/, '');
const catName = (slug) => site.categories.find((c) => c.slug === slug)?.name;

// ビルド日。テストから固定するために上書きできる。
// ⚠️ 本番のビルド・デプロイでは絶対に設定しない。設定すると期限切れガードが無効化される。
const BUILD_DATE = process.env.KAKEI_TODAY || toJstDateString(Date.now());
const CHECKED_WARN_DAYS = 180;

// ---------------------------------------------------------------- utilities

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 最小限の front matter パーサ。`key: value` の1行ペアだけを見る。 */
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new Error('front matter がありません');
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i < 0) throw new Error(`front matter の書式が不正: ${line}`);
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

const render = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ''));

/**
 * フッターの開示文言。affiliateEnabled=false のうちは出さない。
 * リンクが1本も無いのに「適格販売により収入を得ています」と書くのは事実に反するため。
 */
const disclosureHtml = site.affiliateEnabled
  ? `<p class="disclosure">${esc(site.affiliateDisclosure)}</p>`
  : '';

/**
 * Cloudflare Web Analytics のビーコン。ここで測るのは分母のセッション数だけで、
 * クリック数と注文数はアソシエイト・セントラルのレポートから取る。
 * トークンはHTMLに出る公開値で、秘密情報ではない。
 */
const analyticsHtml = site.webAnalyticsToken
  ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${site.webAnalyticsToken}"}'></script>`
  : '';

/**
 * 本文中の [[AF:キー]] を、content/links.json に登録した広告リンクに変換する。
 *
 * なぜ URL を記事本文に直書きさせないのか:
 *   - ASP が発行するリンクの URL は、こちらで組み立てられない。**発行されたものを貼るしかない。**
 *     本文に直書きすると、推測で作った URL が混ざっても誰も気づけない
 *   - 台帳に集約すれば、プログラム終了・URL変更のときに1か所直せば全記事が直る
 *   - **未登録のキーはビルドを落とす。**「リンクのつもりが素のテキストだった」は起きない
 *
 * 書き方:
 *   [[AF:moshimo]]                … links.json の label をそのまま出す
 *   [[AF:moshimo::無料で登録する]] … 表示文言だけ差し替える
 *
 * ⚠️ 区切りは `|` ではなく `::`。resolveLinks は Markdown → HTML の**後**に走るので、
 * 表の行に `|` を書くとセルの区切りとして先に解釈され、表が壊れる。
 *
 * affiliateEnabled が false の間、および url が空のキーは、リンクにせずプレースホルダを出す。
 * **存在しないリンクを出さないための安全弁**で、これがあるので提携前の案件も先に書いておける。
 */
function resolveLinks(html) {
  return html.replace(/\[\[AF:([^\]]+)\]\]/g, (_, raw) => {
    const [key, label] = raw.split('::').map((x) => x.trim());
    if (!key) throw new Error(`[[AF:...]] のキーが空です: ${raw}`);
    const entry = links[key];
    if (!entry) {
      throw new Error(
        `[[AF:${key}]] が content/links.json にありません` +
          ' / 対処: content/links.json にキーを足す（url はまだ空でよい）',
      );
    }
    const text = label || entry.label;
    if (!text) throw new Error(`content/links.json の ${key} に label がありません`);
    if (!site.affiliateEnabled || !entry.url) {
      return `<span class="link-todo" title="広告リンク未設定（ASPで発行したURLを content/links.json に入れる）">${esc(text)}</span>`;
    }
    // rel: sponsored は Google 側の要請、nofollow は各ASPの規約側。noopener は target=_blank の安全対策。
    return `<a class="buy" href="${esc(entry.url)}" rel="nofollow sponsored noopener" target="_blank">${esc(text)}</a>`;
  });
}

/**
 * 強調記法が解釈されずに残っていないか検査する。
 * CommonMark の flanking ルールは約物（「」。、）を punctuation として扱うため、
 * 「**〜「深さ」**です」のように閉じ側が約物の直後にあると太字にならず ** が本文に出る。
 * 日本語では踏みやすいので、黙って公開されないようビルドを落とす。
 */
function assertNoRawEmphasis(html, file) {
  const m = html.match(/.{0,40}\*\*.{0,40}/);
  if (m) {
    throw new Error(
      `${file}: 太字記法が解釈されずに残っています（CommonMark の flanking ルール）。` +
        ` 該当箇所: ${m[0]}` +
        ' / 対処: 閉じの ** が約物（」。、）の直後に来ないよう、「です。」等を強調の内側に入れる',
    );
  }
}

/**
 * ```seido フェンスを制度カードに変換する。
 *
 * 制度 / 根拠 / 確認日 は必須。それ以外の行は数字の spec として扱い、
 * assertCardNumbers で同じ記事の表と突き合わせる。
 */
function renderSeidoCards(body, file) {
  return body.replace(/^```seido\r?\n([\s\S]*?)^```[ \t]*$/gm, (_, block) => {
    const spec = [];
    let name = '';
    let source = '';
    let checked = '';
    let lead = '';
    for (const line of block.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const i = line.indexOf(':');
      if (i < 0) throw new Error(`${file}: seido の行に : がありません → ${line}`);
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (k === '制度') name = v;
      else if (k === '根拠') source = v;
      else if (k === '確認日') checked = v;
      else if (k === 'lead') lead = v;
      else spec.push([k, v]);
    }
    if (!name) throw new Error(`${file}: seido に 制度 がありません`);
    if (!source.startsWith('https://')) {
      throw new Error(`${file}: seido の 根拠 は https:// で始まる公式ページのURLにします → ${source}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checked)) {
      throw new Error(`${file}: seido の 確認日 は YYYY-MM-DD で書きます → ${checked}`);
    }
    if (!spec.length) throw new Error(`${file}: seido に数字が1つもありません（${name}）`);
    assertCardNumbers(name, spec, body, file);
    const dl = spec.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    return (
      `<aside class="pcard">` +
      (lead ? `<p class="pcard__lead">${esc(lead)}</p>` : '') +
      `<p class="pcard__name">${esc(name)}</p>` +
      `<dl class="pcard__spec">${dl}</dl>` +
      `<p class="pcard__note">出典: <a href="${esc(source)}" rel="nofollow noopener">${esc(source)}</a>` +
      `（${esc(checked)} 確認）。制度は改定されます。手続きの前に必ず出典ページで確認してください。</p>` +
      `</aside>\n`
    );
  });
}

/**
 * **カードの数字が、その記事の表と食い違っていないかを検査する。**
 *
 * 制度の金額・要件・上限は改定される。表だけ直してカードに古い数字が残る事故は、
 * 目視では見つからない。転記ミスはビルドで落とす。
 * 判定は「カードの数字（数値トークン）が、その制度名を含む表の行にすべて現れるか」。
 */
function assertCardNumbers(service, spec, body, file) {
  const rows = body
    .split(/\r?\n/)
    .filter((l) => l.trimStart().startsWith('|') && l.includes(service));
  if (!rows.length) {
    throw new Error(`${file}: カードのサービス「${service}」が、この記事のどの表にもありません`);
  }
  const hay = rows.join(' ').replace(/[\s,]/g, '');
  for (const [k, v] of spec) {
    for (const num of v.replace(/,/g, '').match(/\d+(?:\.\d+)?/g) || []) {
      if (!hay.includes(num)) {
        throw new Error(
          `${file}: カードの数字が表にありません → ${service} の「${k}: ${v}」の ${num}` +
            ' / 対処: 表の値と合わせるか、表のほうを直す',
        );
      }
    }
  }
}

/**
 * **記事が1本も無いカテゴリが site.json に残っていないかを検査する。**
 *
 * 空のカテゴリページが sitemap に載り、Google に薄いページとして拾われる。
 * 2026-08-31 に affi サイトで実際に起きた（記事0本の asp カテゴリが sitemap に載っていた）。
 * 目視では気づけないのでビルドで落とす。
 */
function assertNoEmptyCategories(articles) {
  const used = new Set(articles.map((a) => a.category));
  const empty = site.categories.filter((c) => !used.has(c.slug));
  if (empty.length) {
    throw new Error(
      `content/site.json に記事が0本のカテゴリがあります → ${empty.map((c) => c.slug).join(', ')}` +
        ' / 対処: 1本目が書けるまで site.json の categories から外す',
    );
  }
}

/**
 * **記事の数字に、出典URLと確認日が付いているかを検査する。**
 *
 * 制度の金額・要件は改定される。出典が書かれていない数字は、あとから
 * 「どこで確かめたのか」が復元できず、古いのか正しいのかを判定できなくなる。
 */
function assertSources(meta, file) {
  const urls = meta.sources.split('|').map((s) => s.trim()).filter(Boolean);
  if (!urls.length) {
    throw new Error(`${file}: sources が空です / 対処: 出典URLを | 区切りで並べる`);
  }
  for (const u of urls) {
    if (!u.startsWith('https://')) {
      throw new Error(
        `${file}: sources は https:// で始まるURLだけを | で区切って並べます → ${u}` +
          ' / 対処: 公的機関の公式ページのURLを入れる（まとめ記事は根拠にしない）',
      );
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.checkedAt)) {
    throw new Error(`${file}: checkedAt は YYYY-MM-DD で書きます → ${meta.checkedAt}`);
  }
}

/**
 * **改定予定日を過ぎた記事があると、ビルドを落とす。**
 *
 * 「確認日が古い」は主観だが、「改定日を過ぎた」は事実として判定できる。
 * 育休給付金の上限は毎年8月1日、扶養の壁は税制改正、児童手当は改正法の施行日——
 * 改定日が分かっている制度なら、機械が「この記事はもう嘘かもしれない」と言える。
 *
 * ⚠️ 対処は「出典を取得し直して本文を確認し、checkedAt と revisionAt を両方更新する」。
 * revisionAt だけを先に進めると、このガードは意味を失う。
 */
function assertNotExpired(meta, file) {
  if (!meta.revisionAt) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.revisionAt)) {
    throw new Error(`${file}: revisionAt は YYYY-MM-DD で書きます → ${meta.revisionAt}`);
  }
  if (meta.revisionAt <= BUILD_DATE) {
    throw new Error(
      `${file}: revisionAt（${meta.revisionAt}）を過ぎています。記事の数字が古い可能性があります` +
        ' / 対処: sources のページを取得し直して本文を確認し、checkedAt と revisionAt を両方更新する。' +
        'revisionAt だけを先に進めない',
    );
  }
}

/** 最終確認から日数が経った記事を警告する（落とさない）。 */
function warnIfStale(meta, file) {
  const days = Math.round((Date.parse(BUILD_DATE) - Date.parse(meta.checkedAt)) / 86400000);
  if (days >= CHECKED_WARN_DAYS) {
    console.warn(`注意: ${file} は最終確認から ${days} 日経過しています（checkedAt: ${meta.checkedAt}）`);
  }
}

/** 表は横スクロールできる箱に入れる（スマホで本文が横に伸びるのを防ぐ）。 */
const wrapTables = (html) =>
  html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');

/** 本文中の画像を figure にして、alt をキャプションとして見せる。 */
const wrapFigures = (html) =>
  html.replace(
    /<p>(<img src="([^"]+)" alt="([^"]*)"[^>]*>)<\/p>/g,
    (_, img, src, alt) =>
      `<figure class="fig"><img src="${src}" alt="${alt}" loading="lazy" decoding="async">` +
      (alt ? `<figcaption>${alt}</figcaption>` : '') +
      '</figure>',
  );

/** h2 / h3 に id を振り、目次の材料を集める。marked v15 は id を付けないので採番する。 */
function addHeadingIds(html) {
  const headings = [];
  let n = 0;
  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, lvl, inner) => {
    n += 1;
    headings.push({ level: Number(lvl), id: `s${n}`, text: inner.replace(/<[^>]+>/g, '').trim() });
    return `<h${lvl} id="s${n}">${inner}</h${lvl}>`;
  });
  return { html: out, headings };
}

/** 目次。h2 を親、h3 を子にした入れ子リストにする。 */
function tocList(headings) {
  const parts = ['<ol>'];
  let subOpen = false;
  for (const h of headings) {
    if (h.level === 2) {
      if (subOpen) { parts.push('</ol></li>'); subOpen = false; }
      parts.push(`<li><a href="#${h.id}">${esc(h.text)}</a></li>`);
    } else {
      if (!subOpen) {
        parts.push(parts.pop().replace(/<\/li>$/, ''), '<ol>');
        subOpen = true;
      }
      parts.push(`<li><a href="#${h.id}">${esc(h.text)}</a></li>`);
    }
  }
  if (subOpen) parts.push('</ol></li>');
  parts.push('</ol>');
  return parts.join('');
}

/** 見出しが少ない記事に目次を出しても邪魔なだけなので出さない。 */
const hasToc = (headings) => headings.filter((h) => h.level === 2).length >= 3;

/** SNSシェア。JS を使わず、各サービスの共有URLへのリンクだけを置く。 */
function shareButtons(title, url) {
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  const items = [
    ['X', `https://x.com/intent/tweet?text=${t}&url=${u}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['はてブ', `https://b.hatena.ne.jp/entry/panel/?url=${u}&title=${t}`],
    ['LINE', `https://social-plugins.line.me/lineit/share?url=${u}`],
  ];
  return `<div class="share"><p class="share__title">この記事をシェア</p><ul>${items
    .map(([label, href]) => `<li><a href="${href}" target="_blank" rel="noopener nofollow">${label}</a></li>`)
    .join('')}</ul></div>`;
}

function writeFile(rel, contents) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}

function readDocs(dir, extraRequired = []) {
  const full = path.join(CONTENT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(full, file), 'utf8'));
      for (const key of ['title', 'description', 'slug', 'published', 'updated', ...extraRequired]) {
        if (!meta[key]) throw new Error(`${file}: front matter に ${key} がありません`);
      }
      const slug = meta.slug.replace(/^\/|\/$/g, '');
      return { ...meta, file, slug, body, url: `${ORIGIN}/${slug}/` };
    });
}

// ---------------------------------------------------------------- build

// dist ごと削除せず中身だけ消す。wrangler dev が監視している間、
// Windows ではディレクトリ自体の削除が EPERM で失敗する。
fs.mkdirSync(DIST, { recursive: true });
for (const entry of fs.readdirSync(DIST)) {
  try {
    fs.rmSync(path.join(DIST, entry), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch (err) {
    console.warn(`clean: dist/${entry} を削除できませんでした（${err.code}）。上書きで続行します。`);
  }
}

marked.setOptions({ gfm: true, breaks: false });

const articles = readDocs('articles', ['category', 'sources', 'checkedAt']);
const pages = readDocs('pages');
assertNoEmptyCategories(articles);
for (const a of articles) {
  assertSources(a, a.file);
  assertNotExpired(a, a.file);
  warnIfStale(a, a.file);
}

for (const a of articles) {
  if (!a.category) throw new Error(`${a.file}: front matter に category がありません`);
  if (!catName(a.category)) throw new Error(`${a.file}: 未定義のカテゴリ「${a.category}」（site.json の categories に追加してください）`);
}

const byRecent = [...articles].sort((a, b) => (a.updated < b.updated ? 1 : -1));

// ---- 共通パーツ

/**
 * カテゴリが1つしかない間は、ナビにもサイドバーにもカテゴリを出さない。
 *
 * 「寸法で選ぶ」の中に「クーラーボックス」しか無い状態では、カテゴリ名はサイト名と
 * ほぼ同義で情報量がゼロになる。2つ目のカテゴリを site.json に足した時点で自動的に出る。
 */
const showCategoryNav = site.categories.length >= 2;

const navHtml = [
  ...(showCategoryNav ? site.categories.map((c) => ({ path: `/${c.slug}/`, label: c.name })) : []),
  ...site.nav,
]
  .map((n) => `<a href="${n.path}">${esc(n.label)}</a>`)
  .join('');

function widget(title, inner) {
  return `<div class="widget"><p class="widget__title">${esc(title)}</p>${inner}</div>`;
}

function postListHtml(list, cls = '') {
  if (!list.length) return '<p>まだありません。</p>';
  return `<ul class="${cls}">${list
    .map(
      (a) =>
        `<li><a href="/${a.slug}/">${esc(a.title)}</a><time datetime="${esc(a.updated)}">${esc(a.updated)}</time></li>`,
    )
    .join('')}</ul>`;
}

const categoryWidget = showCategoryNav
  ? widget(
      'カテゴリー',
      `<ul>${site.categories
        .map((c) => {
          const n = articles.filter((a) => a.category === c.slug).length;
          return `<li><a href="/${c.slug}/">${esc(c.name)}</a><time>${n}記事</time></li>`;
        })
        .join('')}</ul>`,
    )
  : '';

const aboutWidget = widget('このサイトについて', `<p>${esc(site.description)}</p><p class="widget__more"><a href="/about/">運営者情報と数値の作り方 →</a></p>`);

/**
 * フッターの X へのリンク。site.json の xHandle を空にすると出力しない。
 * 外部リンクなので rel="me" を付けて、サイトとアカウントが同一運営であることを示す。
 */
const snsHtml = site.xHandle
  ? `<p class="sns"><a href="https://x.com/${encodeURIComponent(site.xHandle)}" rel="me noopener" target="_blank">X @${esc(site.xHandle)}</a></p>`
  : '';

const common = {
  lang: site.lang,
  siteName: esc(site.name),
  tagline: esc(site.tagline),
  nav: navHtml,
  robots: '',
  disclosure: disclosureHtml,
  sns: snsHtml,
  analytics: analyticsHtml,
  ogImage: ORIGIN + site.defaultOgImage,
};

function crumbs(items) {
  const parts = items.map((it, i) =>
    i === items.length - 1 ? `<span>${esc(it.label)}</span>` : `<a href="${it.path}">${esc(it.label)}</a>`,
  );
  return `<nav class="crumbs" aria-label="パンくずリスト">${parts.join(' › ')}</nav>`;
}

// ---- 記事ページ

for (const a of articles) {
  const parsed = addHeadingIds(wrapFigures(wrapTables(marked.parse(renderSeidoCards(a.body, a.file)))));
  assertNoRawEmphasis(parsed.html, a.file);
  const html = resolveLinks(parsed.html);
  const cname = catName(a.category);

  // 関連記事は同じカテゴリを優先し、足りない分だけ他カテゴリで埋める。
  // カテゴリが2件以上になると、そうしないと無関係な記事が並ぶ。
  const others = byRecent.filter((x) => x.slug !== a.slug);
  const related = [
    ...others.filter((x) => x.category === a.category),
    ...others.filter((x) => x.category !== a.category),
  ].slice(0, 5);

  const prNotice = site.affiliateEnabled
    ? `<p class="pr-notice">${esc(site.prLabel)}</p>`
    : `<p class="pr-notice pr-notice--pending">現在このページに広告リンクはありません（ASPと提携する前の状態です）。</p>`;

  const eyecatch = a.eyecatch
    ? `<p class="eyecatch"><img src="${a.eyecatch}" alt="${esc(a.title)}" width="1200" height="630" decoding="async"></p>`
    : '';

  writeFile(
    `${a.slug}/index.html`,
    render(baseTpl, {
      ...common,
      title: `${esc(a.title)} | ${esc(site.name)}`,
      description: esc(a.description),
      canonical: a.url,
      ogType: 'article',
      // og:image は PNG（front matter の ogImage）を優先する。
      // 本文の図版（eyecatch）は SVG のままでよいが、SNS のカードは SVG を受け付けない。
      ogImage: ORIGIN + (a.ogImage || a.eyecatch || site.defaultOgImage),
      jsonLd: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        description: a.description,
        image: ORIGIN + (a.ogImage || a.eyecatch || site.defaultOgImage),
        datePublished: a.published,
        dateModified: a.updated,
        articleSection: cname,
        inLanguage: site.lang,
        mainEntityOfPage: { '@type': 'WebPage', '@id': a.url },
        publisher: { '@type': 'Organization', name: site.name },
      }),
      breadcrumb: crumbs([
        { path: '/', label: 'ホーム' },
        { path: `/${a.category}/`, label: cname },
        { label: a.title },
      ]),
      sidebar:
        (hasToc(parsed.headings) ? widget('目次', `<div class="toc toc--side">${tocList(parsed.headings)}</div>`) : '') +
        aboutWidget +
        widget('新着記事', postListHtml(byRecent.slice(0, 5))) +
        categoryWidget,
      content:
        `<article class="post">` +
        `<p class="cat-label"><a href="/${a.category}/">${esc(cname)}</a></p>` +
        `<h1>${esc(a.title)}</h1>` +
        `<p class="dates"><time datetime="${esc(a.published)}">公開 ${esc(a.published)}</time>${
          a.updated !== a.published ? ` ／ <time datetime="${esc(a.updated)}">更新 ${esc(a.updated)}</time>` : ''
        }</p>` +
        eyecatch +
        prNotice +
        (hasToc(parsed.headings) ? `<nav class="toc"><p class="toc__title">目次</p>${tocList(parsed.headings)}</nav>` : '') +
        html +
        shareButtons(a.title, a.url) +
        // 記事が1本しかないうちは「関連記事」の枠だけ出しても意味がないので省く
        (related.length
          ? `<section class="related"><h2 class="related__title">関連記事</h2>${postListHtml(related, 'related__list')}</section>`
          : '') +
        `</article>`,
      year: String(new Date(a.updated).getFullYear()),
    }),
  );
}

// ---- 固定ページ

for (const p of pages) {
  const parsed = addHeadingIds(wrapFigures(wrapTables(marked.parse(p.body))));
  assertNoRawEmphasis(parsed.html, p.file);

  writeFile(
    `${p.slug}/index.html`,
    render(baseTpl, {
      ...common,
      title: `${esc(p.title)} | ${esc(site.name)}`,
      description: esc(p.description),
      canonical: p.url,
      ogType: 'website',
      jsonLd: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: p.title,
        description: p.description,
        url: p.url,
        inLanguage: site.lang,
      }),
      breadcrumb: crumbs([{ path: '/', label: 'ホーム' }, { label: p.title }]),
      sidebar: aboutWidget + widget('新着記事', postListHtml(byRecent.slice(0, 5))) + categoryWidget,
      content: `<article class="post"><h1>${esc(p.title)}</h1><p class="dates"><time datetime="${esc(p.updated)}">更新 ${esc(p.updated)}</time></p>${resolveLinks(parsed.html)}</article>`,
      year: String(new Date(p.updated).getFullYear()),
    }),
  );
}

// ---- カテゴリーページ

for (const c of site.categories) {
  const list = byRecent.filter((a) => a.category === c.slug);
  const url = `${ORIGIN}/${c.slug}/`;
  writeFile(
    `${c.slug}/index.html`,
    render(baseTpl, {
      ...common,
      title: `${esc(c.name)}の記事一覧 | ${esc(site.name)}`,
      description: `${c.name}について、メーカー公式の寸法から計算して比べた記事の一覧です。`,
      canonical: url,
      ogType: 'website',
      jsonLd: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${c.name}の記事一覧`,
        url,
        inLanguage: site.lang,
      }),
      breadcrumb: crumbs([{ path: '/', label: 'ホーム' }, { label: c.name }]),
      // カテゴリが1つの間、このページはトップページと中身がほぼ同じになる。
      // 重複コンテンツとして competing させたくないので noindex にしておく
      // （follow なので記事へのリンクはたどられる）。2つ目のカテゴリができたら自動で index される。
      robots: showCategoryNav ? '' : '<meta name="robots" content="noindex,follow">',
      sidebar: aboutWidget + widget('新着記事', postListHtml(byRecent.slice(0, 5))) + categoryWidget,
      content:
        `<h1>${esc(c.name)}の記事一覧</h1>` +
        `<p class="lead">${esc(c.name)}について、メーカー公式の寸法から計算して比べた記事です。</p>` +
        articleCards(list),
      year: String(new Date().getFullYear()),
    }),
  );
}

// ---- 記事カード（トップ・カテゴリー共通）

function articleCards(list) {
  if (!list.length) return '<p>記事はまだありません。</p>';
  return `<ul class="article-list">${list
    .map(
      (a) =>
        `<li><a class="article-list__link" href="/${a.slug}/">` +
        (a.eyecatch ? `<img class="article-list__thumb" src="${a.eyecatch}" alt="" width="1200" height="630" loading="lazy" decoding="async">` : '') +
        `<span class="article-list__body">` +
        `<span class="article-list__cat">${esc(catName(a.category))}</span>` +
        `<span class="article-list__title">${esc(a.title)}</span>` +
        `<span class="article-list__desc">${esc(a.description)}</span>` +
        `<time datetime="${esc(a.updated)}">${esc(a.updated)}</time>` +
        `</span></a></li>`,
    )
    .join('')}</ul>`;
}

// ---- トップページ

writeFile(
  'index.html',
  render(baseTpl, {
    ...common,
    title: `${esc(site.name)} — ${esc(site.tagline)}`,
    description: esc(site.description),
    canonical: `${ORIGIN}/`,
    ogType: 'website',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      description: site.description,
      url: `${ORIGIN}/`,
      inLanguage: site.lang,
    }),
    breadcrumb: '',
    sidebar: aboutWidget + categoryWidget,
    content: `<h1>${esc(site.name)}</h1><p class="lead">${esc(site.description)}</p>${articleCards(byRecent)}`,
    year: String(new Date().getFullYear()),
  }),
);

// ---- サイトマップ（HTML）

writeFile(
  'sitemap/index.html',
  render(baseTpl, {
    ...common,
    title: `サイトマップ | ${esc(site.name)}`,
    description: '「寸法で選ぶ」の全ページ一覧です。',
    canonical: `${ORIGIN}/sitemap/`,
    ogType: 'website',
    jsonLd: '',
    breadcrumb: crumbs([{ path: '/', label: 'ホーム' }, { label: 'サイトマップ' }]),
    sidebar: aboutWidget + categoryWidget,
    content:
      '<article class="post"><h1>サイトマップ</h1>' +
      site.categories
        .map(
          (c) =>
            `<h2>${esc(c.name)}</h2>` +
            postListHtml(byRecent.filter((a) => a.category === c.slug)),
        )
        .join('') +
      '<h2>このサイトについて</h2><ul>' +
      site.nav.map((n) => `<li><a href="${n.path}">${esc(n.label)}</a></li>`).join('') +
      '</ul></article>',
    year: String(new Date().getFullYear()),
  }),
);

// ---- 404

writeFile(
  '404.html',
  render(baseTpl, {
    ...common,
    title: `ページが見つかりません | ${esc(site.name)}`,
    description: 'お探しのページは見つかりませんでした。',
    canonical: '',
    ogType: 'website',
    jsonLd: '',
    breadcrumb: '',
    sidebar: '',
    content: '<h1>ページが見つかりません</h1><p><a href="/">トップへ戻る</a></p><p><a href="/sitemap/">サイトマップから探す</a></p>',
    year: String(new Date().getFullYear()),
  }),
);

// ---- sitemap.xml / robots.txt

const urls = [
  { loc: `${ORIGIN}/`, lastmod: byRecent[0]?.updated },
  // noindex のカテゴリページは sitemap に載せない
  ...(showCategoryNav ? site.categories.map((c) => ({ loc: `${ORIGIN}/${c.slug}/`, lastmod: byRecent[0]?.updated })) : []),
  ...byRecent.map((a) => ({ loc: a.url, lastmod: a.updated })),
  ...pages.map((p) => ({ loc: p.url, lastmod: p.updated })),
  { loc: `${ORIGIN}/sitemap/`, lastmod: byRecent[0]?.updated },
];

writeFile(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`,
);

// robots.txt
//
// 2026-08-24 に Cloudflare の「Managed robots.txt」をオフにしたので、
// ここで出力するものが本番の robots.txt そのものになる
// （以前は Cloudflare が管理ブロックをこの上に差し込んでいた）。
//
// 何を許可するかは content/site.json の robots で決める。判断の基準は
// 「そのクローラを許可すると何が返ってくるか」で、理由は site.json のコメントに書く。
const robotsLines = [
  '# AI学習クローラは既定で拒否。allowAI に入れたものだけ許可している。',
  '# 理由は content/site.json の robots.allowAI のコメントを参照。',
  '',
  ...site.robots.allowAI.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
  ...site.robots.denyAI.flatMap((ua) => [`User-agent: ${ua}`, 'Disallow: /', '']),
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${ORIGIN}/sitemap.xml`,
  '',
];

writeFile('robots.txt', robotsLines.join('\n'));

// ---- 静的ファイル

copyDir(path.join(ROOT, 'public'), DIST);

console.log(`built: ${articles.length} article(s), ${pages.length} page(s), ${site.categories.length} category page(s)`);
for (const a of articles) console.log(`  /${a.slug}/  ${a.title}`);
if (!site.affiliateEnabled) console.log('\n注意: affiliateEnabled=false のため、リンク位置はプレースホルダで出力しています。');
