# 家計の制度ログ（kakei.nexeed-lab.com）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `moshimo-affiliate/site/` の静的サイト生成器を新リポジトリ `kakei` へ移植し、制度記事の「古い数字」を機械が検出する3つのビルドガードを足したうえで、1本目の記事を公開する。

**Architecture:** Markdown → `build.mjs`（依存は `marked` のみ）→ `dist/` → Cloudflare Workers Static Assets。記事の front matter に `sources` / `checkedAt` / `revisionAt` を持たせ、ビルド時に検査する。制度カードは ` ```seido ` フェンスで書き、カード内の数字が同じ記事の表と一致しなければビルドを落とす（既存 `assertCardNumbers` の再利用）。

**Tech Stack:** Node.js 24 / marked 15 / wrangler 4 / Cloudflare Workers Static Assets / テストは `node --test`（追加依存なし）

**Spec:** `moshimo-affiliate/docs/superpowers/specs/2026-08-31-kakei-site-design.md`

## Global Constraints

- **一次情報だけを根拠にする。** 公式サイトと公的機関（国税庁・厚生労働省・日本年金機構・協会けんぽ・こども家庭庁・文部科学省・JASSO・金融庁・e-Gov・各自治体）の記載のみ。**他人のブログ・まとめ記事・SEO記事は根拠にしない**
- **引用は必ず実際にページを取得して確認する。記憶から書かない**
- **数字を書いたら、出典URLと確認日を必ず添える**
- **`検証済み` と `未確認` を区別する。** 確かめていないものには `未確認` と明記する
- **扱わない領域**: おすすめ証券口座・銘柄選び・保険の推奨・ランキング（意見であり検証できない）
- **扱わない領域**: 育休・産休・出産手当金・傷病手当金（`ikunavi` の territory。共食いを避ける）
- **`affiliateEnabled` は `false` のまま。** リンクが0本で開示文言だけ出すのは事実に反する
- **ASPの管理画面が発行したURL以外を `links.json` に入れない。** URLの形を推測して組み立てない
- **記事が0本のカテゴリを `site.json` に置かない**（Task 2 で機械が検出するようにする）
- **日本語の太字は、開きの `**` の直後と閉じの `**` の直前に約物（「」。、）を置かない**（`assertNoRawEmphasis` が落とす）
- 改行コードは **LF** に統一する
- 新リポジトリのパス: `C:/Users/oshim/Documents/projects/kakei`
- 本番ドメイン: `kakei.nexeed-lab.com` / Worker 名: `kakei-log`

---

## File Structure

新リポジトリ `kakei/` の構成。責務は既存 `moshimo-affiliate` と同じ形にそろえる。

| パス | 責務 |
|---|---|
| `CLAUDE.md` | 記事のルール・事実の扱い・リンクの扱い（`moshimo-affiliate/CLAUDE.md` を家計向けに書き換えて移植） |
| `HANDOFF.md` | セッション間の引き継ぎ |
| `docs/superpowers/specs/2026-08-31-kakei-site-design.md` | 設計書（コピー） |
| `docs/superpowers/plans/2026-08-31-kakei-site.md` | 本計画（コピー） |
| `site/build.mjs` | 生成器。front matter 検査・ガード・HTML 生成・sitemap・robots |
| `site/templates/base.html` | ページの外枠 |
| `site/public/` | `styles.css` / `favicon.svg` / `img/` |
| `site/content/site.json` | サイト定義（カテゴリ・robots・計測トークン） |
| `site/content/links.json` | 広告リンクの台帳 |
| `site/content/articles/*.md` | 記事の**正**。ここ以外に下書きを置かない |
| `site/content/pages/*.md` | 固定ページ（about / privacy） |
| `site/test/guards.test.mjs` | ビルドガードのテスト。`node --test` |
| `site/test/fixtures/` | ガードを発火させる最小の content ディレクトリ群 |
| `site/wrangler.jsonc` | Cloudflare 設定。`routes` は `site.json` の `origin` と必ず同じ値 |
| `tools/og-card.js` | OG画像の描画コード。**Node では動かない。ブラウザのコンソールで実行する** |

### 実測済みの前提（2026-08-31 に scratchpad で実際に実行して確認）

```
記事0本・カテゴリ2 → built: 0 article(s), 2 page(s), 2 category page(s)   （EXIT=0。空カテゴリページが2枚出る＝薄いページ問題）
記事0本・カテゴリ0 → built: 0 article(s), 2 page(s), 0 category page(s)   （EXIT=0）
記事1本・カテゴリ1 → built: 1 article(s), 2 page(s), 1 category page(s)   （EXIT=0）
```

**したがって Task 1 は `categories: []` で開始できる。** 記事0本でもビルドは通る。
同時に、**記事0本のカテゴリを置くと空ページが実際に出る**ことも確認済みなので、Task 2 のガードには根拠がある。

---

## Task 1: 新リポジトリを作り、生成器を移植して 0記事でビルドを通す

**Files:**
- Create: `C:/Users/oshim/Documents/projects/kakei/`（git リポジトリ）
- Create: `kakei/site/build.mjs`（`moshimo-affiliate/site/build.mjs` のコピー）
- Create: `kakei/site/templates/base.html` / `kakei/site/public/**` / `kakei/tools/og-card.js`（コピー）
- Create: `kakei/site/package.json` / `kakei/site/wrangler.jsonc`（コピーして書き換え）
- Create: `kakei/site/content/site.json` / `kakei/site/content/links.json`（新規）
- Create: `kakei/site/content/pages/about.md` / `privacy.md`（新規）
- Create: `kakei/CLAUDE.md` / `kakei/HANDOFF.md` / `kakei/.gitignore`
- Copy: `moshimo-affiliate/docs/superpowers/specs/2026-08-31-kakei-site-design.md` → `kakei/docs/superpowers/specs/`
- Copy: `moshimo-affiliate/docs/superpowers/plans/2026-08-31-kakei-site.md` → `kakei/docs/superpowers/plans/`

**Interfaces:**
- Consumes: なし（最初のタスク）
- Produces: `kakei/site/` で `npm run build` が exit 0 を返す。以降の全タスクはこのディレクトリで作業する

- [ ] **Step 1: ディレクトリを作り、生成器をコピーする**

```bash
SRC="C:/Users/oshim/Documents/projects/moshimo-affiliate"
DST="C:/Users/oshim/Documents/projects/kakei"
mkdir -p "$DST/site/content/articles" "$DST/site/content/pages" "$DST/site/test/fixtures" "$DST/tools" "$DST/docs/superpowers/specs" "$DST/docs/superpowers/plans"
cp "$SRC/site/build.mjs" "$DST/site/build.mjs"
cp "$SRC/site/package.json" "$SRC/site/wrangler.jsonc" "$DST/site/"
cp -r "$SRC/site/templates" "$SRC/site/public" "$DST/site/"
cp "$SRC/tools/og-card.js" "$DST/tools/og-card.js"
cp "$SRC/docs/superpowers/specs/2026-08-31-kakei-site-design.md" "$DST/docs/superpowers/specs/"
cp "$SRC/docs/superpowers/plans/2026-08-31-kakei-site.md" "$DST/docs/superpowers/plans/"
ls -R "$DST" | head -40
```

- [ ] **Step 2: `.gitignore` を書く**

`kakei/.gitignore`:

```
node_modules/
dist/
.wrangler/
.superpowers/
site/test/.out/
```

- [ ] **Step 3: `package.json` を書き換える**

`kakei/site/package.json`（`name` / `description` を差し替え、`test` スクリプトを足す）:

```json
{
  "name": "kakei-log-site",
  "private": true,
  "type": "module",
  "description": "家計の制度ログ — 税・教育費・資産形成の制度を公式の原文で確かめる記事サイト（Cloudflare Workers Static Assets）",
  "scripts": {
    "build": "node build.mjs",
    "test": "node --test test/",
    "dev": "node build.mjs && wrangler dev",
    "deploy": "node build.mjs && wrangler deploy",
    "clean": "node -e \"import('node:fs').then(fs=>fs.rmSync('dist',{recursive:true,force:true}))\""
  },
  "devDependencies": {
    "marked": "^15.0.0",
    "wrangler": "^4.125.0"
  }
}
```

- [ ] **Step 4: `wrangler.jsonc` を書き換える**

`kakei/site/wrangler.jsonc` の `name` と `routes` だけを差し替える。**それ以外のコメントと設定はそのまま残す**（`not_found_handling` と `html_handling` は理由付きの設定なので触らない）。

```jsonc
  "name": "kakei-log",
```

```jsonc
  "routes": [
    { "pattern": "kakei.nexeed-lab.com", "custom_domain": true }
  ],
```

- [ ] **Step 5: `content/site.json` を書く**

`kakei/site/content/site.json`:

```json
{
  "name": "家計の制度ログ",
  "tagline": "お金の制度を、公式の原文で確かめて書く",
  "description": "税・社会保険・教育費・資産形成の制度を、国税庁や厚生労働省などの公式ページの文言で確認して書いているサイトです。金額・要件・期限を、出典URLと確認日つきで載せています。",
  "lang": "ja",

  "//origin": "本番の公開URL。canonical と sitemap がこの値を使う。wrangler.jsonc の routes と必ず同じ値にする。",
  "origin": "https://kakei.nexeed-lab.com",

  "//categories": "記事の front matter の category は、この slug のどれかでなければビルドが落ちる。⚠️ 記事が0本のカテゴリをここに置くとビルドが落ちる（assertNoEmptyCategories）。1本目が書けた時点で足す。最終形は zeikin / kyoikuhi / shisan の3つ。",
  "categories": [],

  "//nav": "ヘッダーとフッターのナビ。カテゴリは自動で先頭に入るので、ここには固定ページだけ書く。",
  "nav": [
    { "path": "/about/", "label": "運営者情報" },
    { "path": "/privacy/", "label": "プライバシーポリシー" },
    { "path": "/sitemap/", "label": "サイトマップ" }
  ],

  "//affiliateDisclosure": "フッターに常時出す開示。affiliateEnabled が true のときだけ出力される。",
  "affiliateDisclosure": "当サイトはアフィリエイトプログラムに参加しており、リンク経由の申し込みにより収入を得ることがあります。",

  "//prLabel": "景品表示法のステマ規制（2023-10-01 施行）向けの表記。ASP側の開示文言とは別物で、両方必要。",
  "prLabel": "この記事には広告（アフィリエイトリンク）が含まれます。",

  "//affiliateEnabled": "⚠️ ASPで実際にリンクを発行し content/links.json に入れるまで false のままにする。リンクが1本も無いのに『収入を得ています』と書くのは事実に反する。提携申請は記事が10本たまってから行う。",
  "affiliateEnabled": false,

  "//webAnalyticsToken": "Cloudflare Web Analytics のビーコントークン。クライアント側HTMLに出るので秘密情報ではない。⚠️ 未発行。ダッシュボードでのみ発行できる（APIには RUM スコープが無く Authentication error になる）。",
  "webAnalyticsToken": "",

  "//xHandle": "X（旧Twitter）のハンドル。@ は付けない。⚠️ 未開設。",
  "xHandle": "",

  "//defaultOgImage": "og:image の既定値。SNSのカードはSVGを受け付けないので必ずPNGにする。⚠️ 未作成（Task 7）。",
  "defaultOgImage": "/img/og/site.png",

  "//robots": "robots.txt のAIクローラ方針。allowAI に入れたものだけ明示的に許可する。",
  "robots": {
    "//allowAI": "許可すると何が返ってくるかで判断する。現状ゼロ（見返りのある提携が無い）。",
    "allowAI": [],
    "denyAI": [
      "Applebot-Extended",
      "Bytespider",
      "CCBot",
      "ClaudeBot",
      "Claude-User",
      "Google-Extended",
      "GPTBot",
      "meta-externalagent",
      "PetalBot",
      "Timpibot"
    ]
  }
}
```

- [ ] **Step 6: `content/links.json` を書く**

`kakei/site/content/links.json`（**キーは空で始める**。存在を確認していないプログラムのキーを置かない）:

```json
{
  "//": "広告リンクの台帳。本文の [[AF:キー]] がここを引く。",
  "//ルール1": "url に入れてよいのは、ASPの管理画面が発行したURLだけ。推測で組み立てたURLは絶対に入れない。",
  "//ルール2": "url が空のキーはリンクにならず、プレースホルダの <span> として出力される。提携前の案件を先に記事へ書いておける。",
  "//ルール3": "未登録のキーを本文で使うとビルドが落ちる。「リンクのつもりが素のテキスト」を防ぐため。",
  "//状態": "⚠️ 現在0件。金融ASPの案件（ふるさと納税・証券口座・保険相談）が存在するかは未確認。提携申請は記事が10本たまってから行う。"
}
```

- [ ] **Step 7: 固定ページを2枚書く**

`kakei/site/content/pages/about.md`:

```markdown
---
title: 運営者情報と、事実の確かめ方
description: 家計の制度ログの運営者と、記事の数字をどう確かめているかを書いています。
slug: about
published: 2026-09-01
updated: 2026-09-01
---

## このサイトについて

税・社会保険・教育費・資産形成の制度を、**公式ページの文言で確認して**書いています。

制度の金額や要件はほぼ毎年改定されます。ところがネットの解説記事の多くは、書かれた当時の数字のまま更新されずに残っています。**古い数字で計算すると、手取り額の見積もりがそのままずれます。**

そこでこのサイトでは、次のことを決めています。

- **根拠にするのは、公的機関が自分のサイトに書いている記載だけ。** 他人のブログやまとめ記事は根拠にしません
- **引用するときは、必ず実際にそのページを取得して原文を確認します。** 記憶では書きません
- **数字には、出典URLと確認日を必ず添えます**
- **確かめていないことは未確認と書きます。** 公式に書かれていないことを、書かれているように書きません
- **記事には次の改定予定日を持たせています。** その日を過ぎた記事があると、サイトのビルドが失敗するようにしてあります

## 運営者

Nexeed Lab（大島）。沖縄県島尻郡八重瀬町。ITエンジニア。

## 免責

記事の内容は、記載した確認日時点で公式ページに書かれていた内容です。**制度は改定されます。**
実際に手続きをする前に、必ず出典として挙げているページで最新の内容を確認してください。

税務・社会保険の個別の判断については、税務署・年金事務所・お住まいの自治体・専門家にご確認ください。
当サイトは特定の金融商品を推奨しません。

## 広告について

現在このサイトに広告リンクはありません。掲載を始めるときは、この項目とフッターに明記します。
```

`kakei/site/content/pages/privacy.md`:

```markdown
---
title: プライバシーポリシー
description: 家計の制度ログのプライバシーポリシーです。アクセス解析と広告の扱いについて書いています。
slug: privacy
published: 2026-09-01
updated: 2026-09-01
---

## アクセス解析

**現在、アクセス解析は導入していません。** 導入したときはこの項目に追記します。

## 広告

**現在、広告は掲載していません。** 掲載を始めるときはこの項目に追記し、記事にも表記を出します。

## お問い合わせ

内容の誤りを見つけた場合は、GitHub の [oshima0627](https://github.com/oshima0627) までご連絡ください。
```

- [ ] **Step 8: `CLAUDE.md` を書く**

`moshimo-affiliate/CLAUDE.md` を土台に、ASP 固有の記述を制度向けに差し替える。**「セッションの引き継ぎ」「検証」の節はそのまま残す。** 差し替えるのは「事実の扱い」と「記事を書くときの必須事項」の中身：

```markdown
## 事実の扱い（このサイトの生命線）

このサイトの売りは「**公式ページの文言をそのまま引く**」こと。売りが崩れたら存在意義が無い。

- **一次情報だけを根拠にする。** 根拠にしてよいのは、公的機関（国税庁・厚生労働省・日本年金機構・
  全国健康保険協会・こども家庭庁・文部科学省・JASSO・金融庁・e-Gov法令検索・各自治体）が
  自分のサイトに書いている記載だけ。**他人のブログ・まとめ記事・SEO記事は根拠にしない**
- **引用は必ず実際にページを取得して確認する。記憶から書かない**
- **数字を書いたら、出典URLと確認日を必ず添える**（front matter の `sources` と `checkedAt`）
- **`検証済み` と `未確認` を必ず区別する**
- **公式に書かれていないことを、書かれているように書かない。** 推論を載せるときは推論だと明示する

## 扱わないもの

- **おすすめ証券口座・銘柄選び・保険の推奨・ランキング。** 意見であり検証できず、
  「公式の原文を引く」という売りが効かない
- **育休・産休・出産手当金・傷病手当金。** 既存サイト `ikunavi`（育休ナビ）の territory。
  記事を書かず、リンクで送る

## 記事を書くときの必須事項

1. front matter に **`sources`（`|` 区切りの https URL）と `checkedAt`（YYYY-MM-DD）が必須**。無いとビルドが落ちる
2. **`revisionAt`（次の改定予定日）を過ぎた記事があるとビルドが落ちる。**
   対処は「出典を取得し直して本文を確認し、`checkedAt` と `revisionAt` を両方更新する」。
   **`revisionAt` だけを先に進めない**
3. **日本語の太字は、開きの `**` の直後と閉じの `**` の直前に約物（「」。、）を置かない**
4. **`seido` フェンスの数字は、同じ記事の表の行と一致していなければビルドが落ちる**
5. 原稿の正は **`site/content/articles/`**。別の場所に下書きを置かない
6. `category` は `site.json` の `categories` にある slug でなければビルドが落ちる。
   **記事が0本のカテゴリを `site.json` に置いてもビルドが落ちる**
```

- [ ] **Step 9: 改行コードを LF に統一し、依存を入れてビルドする**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
node -e "const fs=require('fs');for(const p of ['build.mjs','package.json','wrangler.jsonc','templates/base.html','public/styles.css']){fs.writeFileSync(p, fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'))}"
npm install --no-audit --no-fund
npm run build
```

Expected: `built: 0 article(s), 2 page(s), 0 category page(s)` と exit 0。
**この出力を実際に貼ること。** 出なければ次へ進まない。

- [ ] **Step 10: git を初期化してコミットする**

```bash
cd "C:/Users/oshim/Documents/projects/kakei"
git init -b main
git add -A
git commit -m "生成器を moshimo-affiliate から移植し、家計の制度ログとして初期化した"
gh repo create kakei --private --source=. --remote=origin --push
git log --oneline -1
```

---

## Task 2: テスト基盤と、空カテゴリガード

**Files:**
- Modify: `kakei/site/build.mjs`（11-18行付近、271行付近、302-303行付近）
- Create: `kakei/site/test/guards.test.mjs`
- Create: `kakei/site/test/fixtures/empty-category/site.json`, `links.json`, `articles/`, `pages/`

**Interfaces:**
- Consumes: Task 1 の `kakei/site/build.mjs`
- Produces:
  - 環境変数 `KAKEI_CONTENT`（content ディレクトリの上書き）と `KAKEI_DIST`（出力先の上書き）
  - `runBuild(fixture, env)` テストヘルパ → `{ code: number, stdout: string, stderr: string }`
  - `assertNoEmptyCategories(articles)` — Task 3・4 のガードもこの直後に並べる

- [ ] **Step 1: 失敗するテストを書く**

`kakei/site/test/guards.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const SITE = path.resolve(import.meta.dirname, '..');

/** fixture の content ディレクトリを使って build.mjs を1回走らせる。 */
export function runBuild(fixture, env = {}) {
  const content = path.join(SITE, 'test/fixtures', fixture);
  const dist = path.join(SITE, 'test/.out', fixture);
  fs.rmSync(dist, { recursive: true, force: true });
  const r = spawnSync(process.execPath, [path.join(SITE, 'build.mjs')], {
    cwd: SITE,
    encoding: 'utf8',
    env: { ...process.env, KAKEI_CONTENT: content, KAKEI_DIST: dist, ...env },
  });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

test('記事が0本のカテゴリが site.json にあるとビルドが落ちる', () => {
  const r = runBuild('empty-category');
  assert.notEqual(r.code, 0, 'ビルドは失敗しなければならない');
  assert.match(r.stderr, /記事が0本のカテゴリ/);
  assert.match(r.stderr, /zeikin/);
});
```

- [ ] **Step 2: fixture を作る**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
mkdir -p test/fixtures/empty-category/articles test/fixtures/empty-category/pages
cp content/links.json test/fixtures/empty-category/links.json
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('content/site.json','utf8'));
s.categories=[{slug:'zeikin',name:'税と社会保険'}];
fs.writeFileSync('test/fixtures/empty-category/site.json', JSON.stringify(s,null,2)+'\n');
"
```

- [ ] **Step 3: テストを走らせて、期待どおり失敗することを確認する**

Run: `cd "C:/Users/oshim/Documents/projects/kakei/site" && npm test`
Expected: **FAIL**。理由は2つのどちらか——(a) `KAKEI_CONTENT` がまだ実装されていないので fixture が読まれない、(b) ガードが無いのでビルドが exit 0 を返す。
**どちらで落ちたかを出力で確認してから次へ進む。**

- [ ] **Step 4: `build.mjs` に `KAKEI_CONTENT` / `KAKEI_DIST` を実装する**

11-18行付近を差し替える。**`templates/` と `public/` は常に `ROOT` から読む**（fixture 側に置かせない）:

```js
const ROOT = import.meta.dirname;
// テストから content と出力先を差し替えられるようにする。
// ⚠️ 本番のビルド・デプロイでは絶対に設定しない。
const CONTENT = process.env.KAKEI_CONTENT ? path.resolve(process.env.KAKEI_CONTENT) : path.join(ROOT, 'content');
const DIST = process.env.KAKEI_DIST ? path.resolve(process.env.KAKEI_DIST) : path.join(ROOT, 'dist');

const site = JSON.parse(fs.readFileSync(path.join(CONTENT, 'site.json'), 'utf8'));
const links = JSON.parse(fs.readFileSync(path.join(CONTENT, 'links.json'), 'utf8'));
const baseTpl = fs.readFileSync(path.join(ROOT, 'templates/base.html'), 'utf8');
```

271行付近の `readDocs` の中：

```js
  const full = path.join(CONTENT, dir);
```

302-303行付近：

```js
const articles = readDocs('articles');
const pages = readDocs('pages');
```

- [ ] **Step 5: 空カテゴリガードを実装する**

`assertCardNumbers` の直後（194行付近）に足す：

```js
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
```

`readDocs` を呼んでいる直後で呼ぶ：

```js
const articles = readDocs('articles');
const pages = readDocs('pages');
assertNoEmptyCategories(articles);
```

- [ ] **Step 6: テストが通ることを確認する**

Run: `cd "C:/Users/oshim/Documents/projects/kakei/site" && npm test`
Expected: PASS（1 test）

- [ ] **Step 7: 本番の content でもビルドが通ることを確認する**

Run: `cd "C:/Users/oshim/Documents/projects/kakei/site" && npm run build`
Expected: `built: 0 article(s), 2 page(s), 0 category page(s)` と exit 0
（`categories` が `[]` なので空カテゴリは無い）

- [ ] **Step 8: コミット**

```bash
cd "C:/Users/oshim/Documents/projects/kakei"
git add -A
git commit -m "テスト基盤（node --test）を足し、記事0本のカテゴリを検出するガードを実装した"
```

---

## Task 3: `sources` と `checkedAt` を必須にする

**Files:**
- Modify: `kakei/site/build.mjs`（`readDocs` と、ガード群）
- Modify: `kakei/site/test/guards.test.mjs`
- Create: `kakei/site/test/fixtures/no-sources/**`, `kakei/site/test/fixtures/bad-source-url/**`

**Interfaces:**
- Consumes: Task 2 の `runBuild(fixture, env)` と `KAKEI_CONTENT`
- Produces:
  - `readDocs(dir, extraRequired = [])` — 第2引数で追加の必須 front matter キーを渡す
  - `assertSources(meta, file)` — `meta.sources` / `meta.checkedAt` を検査する
  - 記事の front matter 規約: `sources` は `|` 区切りの `https://` URL、`checkedAt` は `YYYY-MM-DD`

- [ ] **Step 1: 失敗するテストを書く**

`kakei/site/test/guards.test.mjs` に追記：

```js
test('記事に sources が無いとビルドが落ちる', () => {
  const r = runBuild('no-sources');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /sources がありません/);
});

test('sources が https のURLでないとビルドが落ちる', () => {
  const r = runBuild('bad-source-url');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /https:\/\/ で始まるURL/);
});
```

- [ ] **Step 2: fixture を2つ作る**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
for f in no-sources bad-source-url; do
  mkdir -p "test/fixtures/$f/articles" "test/fixtures/$f/pages"
  cp content/links.json "test/fixtures/$f/links.json"
  node -e "
  const fs=require('fs');
  const s=JSON.parse(fs.readFileSync('content/site.json','utf8'));
  s.categories=[{slug:'zeikin',name:'税と社会保険'}];
  fs.writeFileSync('test/fixtures/$f/site.json', JSON.stringify(s,null,2)+'\n');
  "
done
```

`test/fixtures/no-sources/articles/a.md`（`sources` と `checkedAt` が無い）:

```markdown
---
title: sources が無い記事
description: ガードの検査用。
slug: zeikin/no-sources
category: zeikin
published: 2026-09-01
updated: 2026-09-01
---

## 見出し

本文。
```

`test/fixtures/bad-source-url/articles/a.md`（`sources` が https でない）:

```markdown
---
title: sources が https でない記事
description: ガードの検査用。
slug: zeikin/bad-source-url
category: zeikin
published: 2026-09-01
updated: 2026-09-01
sources: http://example.com/a
checkedAt: 2026-09-01
---

## 見出し

本文。
```

- [ ] **Step 3: テストを走らせて失敗を確認する**

Run: `npm test`
Expected: 新しい2件が FAIL（ビルドが exit 0 を返すため）

- [ ] **Step 4: `readDocs` に追加必須キーを渡せるようにする**

`readDocs` を差し替える（271行付近）：

```js
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
```

- [ ] **Step 5: `assertSources` を実装する**

`assertNoEmptyCategories` の直後に足す：

```js
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
```

- [ ] **Step 6: 記事にだけ適用する**

Task 2 の Step 5 で書いた3行を差し替える。**固定ページには適用しない**（about / privacy に出典は無い）：

```js
const articles = readDocs('articles', ['category', 'sources', 'checkedAt']);
const pages = readDocs('pages');
assertNoEmptyCategories(articles);
for (const a of articles) assertSources(a, a.file);
```

- [ ] **Step 7: テストが通ることを確認する**

Run: `npm test`
Expected: PASS（3 tests）

- [ ] **Step 8: 本番の content でビルドが通ることを確認してコミット**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site" && npm run build
cd .. && git add -A && git commit -m "記事の front matter に sources と checkedAt を必須にするガードを実装した"
```

---

## Task 4: `revisionAt` を過ぎた記事でビルドを落とす

**Files:**
- Modify: `kakei/site/build.mjs`
- Modify: `kakei/site/test/guards.test.mjs`
- Create: `kakei/site/test/fixtures/expired/**`

**Interfaces:**
- Consumes: Task 3 の `assertSources` と front matter 規約
- Produces:
  - `BUILD_DATE`（`YYYY-MM-DD` 文字列。`KAKEI_TODAY` で上書き可）と `CHECKED_WARN_DAYS`（180）
  - `assertNotExpired(meta, file)` / `warnIfStale(meta, file)`
  - front matter 規約に `revisionAt`（任意・`YYYY-MM-DD`）が加わる

- [ ] **Step 1: 失敗するテストを書く**

`kakei/site/test/guards.test.mjs` に追記：

```js
test('revisionAt を過ぎているとビルドが落ちる', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2027-01-02' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /revisionAt/);
  assert.match(r.stderr, /2027-01-01/);
});

test('revisionAt がまだ先ならビルドは通る', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2026-12-31' });
  assert.equal(r.code, 0, r.stderr);
});

test('checkedAt が古い記事は警告が出るが、ビルドは通る', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2026-12-31' });
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stderr + r.stdout, /最終確認から/);
});
```

- [ ] **Step 2: fixture を作る**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
mkdir -p test/fixtures/expired/articles test/fixtures/expired/pages
cp content/links.json test/fixtures/expired/links.json
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('content/site.json','utf8'));
s.categories=[{slug:'zeikin',name:'税と社会保険'}];
fs.writeFileSync('test/fixtures/expired/site.json', JSON.stringify(s,null,2)+'\n');
"
```

`test/fixtures/expired/articles/a.md`:

```markdown
---
title: 改定予定日を持つ記事
description: ガードの検査用。
slug: zeikin/expired
category: zeikin
published: 2026-01-01
updated: 2026-01-01
sources: https://www.nta.go.jp/example
checkedAt: 2026-01-01
revisionAt: 2027-01-01
---

## 見出し

本文。
```

（`checkedAt: 2026-01-01` と `KAKEI_TODAY: 2026-12-31` の差は364日なので、180日の警告しきい値を超える）

- [ ] **Step 3: テストを走らせて失敗を確認する**

Run: `npm test`
Expected: 「revisionAt を過ぎているとビルドが落ちる」と「checkedAt が古い記事は警告が出る」が FAIL

- [ ] **Step 4: `BUILD_DATE` を定義する**

`const ORIGIN = ...` の直後（20行付近）に足す：

```js
// ビルド日。テストから固定するために上書きできる。
// ⚠️ 本番のビルド・デプロイでは絶対に設定しない。設定すると期限切れガードが無効化される。
const BUILD_DATE = process.env.KAKEI_TODAY || new Date().toISOString().slice(0, 10);
const CHECKED_WARN_DAYS = 180;
```

- [ ] **Step 5: `assertNotExpired` と `warnIfStale` を実装する**

`assertSources` の直後に足す：

```js
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
```

- [ ] **Step 6: 記事ごとに呼ぶ**

Task 3 の Step 6 で書いた `for` 行を差し替える：

```js
for (const a of articles) {
  assertSources(a, a.file);
  assertNotExpired(a, a.file);
  warnIfStale(a, a.file);
}
```

- [ ] **Step 7: テストが通ることを確認する**

Run: `npm test`
Expected: PASS（6 tests）

- [ ] **Step 8: 本番の content でビルドが通ることを確認してコミット**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site" && npm run build
cd .. && git add -A && git commit -m "改定予定日（revisionAt）を過ぎた記事でビルドを落とすガードを実装した"
```

---

## Task 5: `asp` フェンスを `seido` フェンスに置き換える

**Files:**
- Modify: `kakei/site/build.mjs`（`renderCards` を削除し `renderSeidoCards` を追加。呼び出し側も差し替え）
- Modify: `kakei/site/test/guards.test.mjs`
- Create: `kakei/site/test/fixtures/seido-mismatch/**`

**Interfaces:**
- Consumes: Task 4 までの `build.mjs`、既存の `assertCardNumbers(service, spec, body, file)`
- Produces:
  - `renderSeidoCards(body, file)` — ` ```seido ` フェンスを `<aside class="pcard">` に変換する
  - フェンスの規約: `制度` / `根拠`（https URL）/ `確認日`（YYYY-MM-DD）が必須、`lead` は任意、それ以外の行は数字の spec として扱う

- [ ] **Step 1: 失敗するテストを書く**

`kakei/site/test/guards.test.mjs` に追記：

```js
test('seido カードの数字が表と食い違うとビルドが落ちる', () => {
  const r = runBuild('seido-mismatch', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /カードの数字が表にありません/);
});
```

- [ ] **Step 2: fixture を作る**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
mkdir -p test/fixtures/seido-mismatch/articles test/fixtures/seido-mismatch/pages
cp content/links.json test/fixtures/seido-mismatch/links.json
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('content/site.json','utf8'));
s.categories=[{slug:'zeikin',name:'税と社会保険'}];
fs.writeFileSync('test/fixtures/seido-mismatch/site.json', JSON.stringify(s,null,2)+'\n');
"
```

`test/fixtures/seido-mismatch/articles/a.md`（表は 123 万円、カードは 103 万円で食い違わせる）:

````markdown
---
title: カードと表が食い違う記事
description: ガードの検査用。
slug: zeikin/seido-mismatch
category: zeikin
published: 2026-09-01
updated: 2026-09-01
sources: https://www.nta.go.jp/example
checkedAt: 2026-09-01
---

## 表

| 制度 | 金額 |
|---|---|
| 基礎控除の壁 | 123万円 |

```seido
制度: 基礎控除の壁
根拠: https://www.nta.go.jp/example
確認日: 2026-09-01
金額: 103万円
```
````

- [ ] **Step 3: テストを走らせて失敗を確認する**

Run: `npm test`
Expected: FAIL。`seido` フェンスがまだ実装されていないので、ビルドは exit 0 を返し、フェンスは素のコードブロックとして出力される

- [ ] **Step 4: `renderCards`（asp）を削除し、`renderSeidoCards` を実装する**

133-173行付近の `function renderCards(body, file) { ... }` を丸ごと次に差し替える。**`assertCardNumbers` は残す**（`renderSeidoCards` が使う）：

```js
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
```

- [ ] **Step 5: 呼び出し側を差し替える**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
grep -n "renderCards" build.mjs
```

見つかった呼び出しをすべて `renderSeidoCards(` にする。`grep -n "renderCards" build.mjs` が**何も返さなくなる**まで直す。

- [ ] **Step 6: `assertCardNumbers` のコメントを制度向けに直す**

174行付近の JSDoc を差し替える（`報酬率・最低支払額・振込手数料` は ASP の話で、もう当てはまらない）：

```js
/**
 * **カードの数字が、その記事の表と食い違っていないかを検査する。**
 *
 * 制度の金額・要件・上限は改定される。表だけ直してカードに古い数字が残る事故は、
 * 目視では見つからない。転記ミスはビルドで落とす。
 * 判定は「カードの数字（数値トークン）が、その制度名を含む表の行にすべて現れるか」。
 */
```

- [ ] **Step 7: テストが通ることを確認する**

Run: `npm test`
Expected: PASS（7 tests）

- [ ] **Step 8: 本番の content でビルドが通ることを確認してコミット**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site" && npm run build
cd .. && git add -A && git commit -m "asp フェンスを制度カード（seido フェンス）に置き換えた"
```

---

## Task 6: 1本目の記事を書く（`zeikin` カテゴリ）

**Files:**
- Create: `kakei/site/content/articles/zeikin-fuyou-no-kabe.md`
- Modify: `kakei/site/content/site.json`（`categories` に `zeikin` を足す）

**Interfaces:**
- Consumes: Task 3・4 の front matter 規約（`sources` / `checkedAt` / `revisionAt`）、Task 5 の ` ```seido ` フェンス
- Produces: `/zeikin/fuyou-no-kabe/` が `dist` に出力され、`zeikin` カテゴリページが1本の記事を持つ

**⚠️ このタスクは、これまでのタスクと性質が違う。** コードではなく事実を扱う。

- [ ] **Step 1: `article-writer` エージェントで下書きを書かせる**

`~/.claude/agents/article-writer.md` を使う。**2026-08-31 に作成済みだが、起動は未確認**（新セッションが必要）。使えない場合は同じ制約を明示して手で書く。

渡す指示：

> `kakei` リポジトリで「扶養の壁」の記事を1本書いてください。
> **必ず国税庁・厚生労働省の公式ページを実際に取得して**、そこに書かれている金額・要件・適用開始年を原文で確認してから書くこと。**記憶から書かない。**
> 103万／106万／130万／150万と言われている各ラインについて、(a) 何の壁なのか（所得税・社会保険・配偶者特別控除のどれか）、(b) 根拠となる公式ページのURL、(c) 現在の金額、(d) 直近の改正で変わったかどうか を明らかにする。
> **公式に書かれていないことは書かない。** 見つからなかったものは「公式ページでは確認できなかった」と本文に書く。
> front matter には `sources`（`|` 区切りの https URL）・`checkedAt`・`revisionAt`（次の改定予定日。分からなければ書かない）を入れる。
> `category: zeikin`、`slug: zeikin/fuyou-no-kabe`。

- [ ] **Step 2: `source-verifier` エージェントで照合させる**

`~/.claude/agents/source-verifier.md` を使う。**書いた本人に検証させない。**

渡す指示：

> `kakei/site/content/articles/zeikin-fuyou-no-kabe.md` の引用文・数字・条件を、front matter の `sources` に挙げられたページを実際に取得して照合してください。

**`不一致` か `根拠なし` が1件でもあれば、Step 1 に戻る。** 判定表をそのまま報告に貼ること。

- [ ] **Step 3: カテゴリを `site.json` に足す**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('content/site.json','utf8'));
s.categories=[{slug:'zeikin',name:'税と社会保険'}];
fs.writeFileSync('content/site.json', JSON.stringify(s,null,2)+'\n');
"
```

- [ ] **Step 4: ビルドとテストを両方通す**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
npm test
npm run build
```

Expected: テスト 7 件 PASS、ビルドは `built: 1 article(s), 2 page(s), 1 category page(s)` と記事のURL・タイトル。
**実際の出力を貼ること。**

**ここで `assertNoRawEmphasis` が落ちたら、それは想定内。** 開きの `**` の直後、閉じの `**` の直前から約物を外す。

- [ ] **Step 5: ブラウザで実際に表示して確認する**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site" && npm run dev
```

確認する項目（**見たことだけを報告する**）:
- 記事ページで、表・引用・制度カードが崩れずに出る
- 制度カードに出典URLと確認日が出ている
- コンソールエラーが0件（PC幅・モバイル幅とも）
- モバイル幅 375px で body の横スクロールが発生しない（`document.body.scrollWidth === document.body.clientWidth`）

- [ ] **Step 6: コミット**

```bash
cd "C:/Users/oshim/Documents/projects/kakei"
git add -A
git commit -m "1本目の記事（扶養の壁）を追加し、zeikin カテゴリを有効にした"
git push
```

---

## Task 7: デプロイして本番で確認する

**Files:**
- Create: `kakei/site/public/img/og/site.png`
- Modify: `kakei/site/content/site.json`（`webAnalyticsToken`）
- Modify: `kakei/HANDOFF.md`、`moshimo-affiliate/HANDOFF.md`

**Interfaces:**
- Consumes: Task 6 までの全て
- Produces: `https://kakei.nexeed-lab.com/` が 200 を返す

- [ ] **Step 1: OG画像を作る**

`kakei/tools/og-card.js` を**ブラウザのコンソールで**実行する。**Node では動かない**（canvas を使うため）。
サイト名を「家計の制度ログ」、タグラインを「お金の制度を、公式の原文で確かめて書く」に書き換えてから実行し、
書き出した PNG を `kakei/site/public/img/og/site.png` に置く。

- [ ] **Step 2: デプロイする**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
npx wrangler deploy
```

`kakei.nexeed-lab.com` をカスタムドメインとして紐付ける（DNSレコードと証書は Cloudflare 側で自動作成される）。

- [ ] **Step 3: 本番へ curl して確認する**

```bash
for u in / /zeikin/fuyou-no-kabe/ /robots.txt /sitemap.xml /img/og/site.png /nonexistent-page/; do
  printf '%-34s ' "$u"
  curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' "https://kakei.nexeed-lab.com$u"
done
printf '%-34s ' '/zeikin/fuyou-no-kabe (スラッシュ無)'
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "https://kakei.nexeed-lab.com/zeikin/fuyou-no-kabe"
```

Expected:
- `/` `/zeikin/fuyou-no-kabe/` → `200 text/html`
- `/robots.txt` → `200 text/plain`
- `/sitemap.xml` → `200 application/xml`
- `/img/og/site.png` → `200 image/png`（サイズが0でないこと）
- `/nonexistent-page/` → **404**
- 末尾スラッシュ無し → **307 → 末尾スラッシュ付き**

**実際の出力を貼ること。**

- [ ] **Step 4: canonical と og:image が実URLと一致していることを確認する**

```bash
curl -s "https://kakei.nexeed-lab.com/zeikin/fuyou-no-kabe/" | grep -o '<link rel="canonical"[^>]*>\|<meta property="og:image"[^>]*>'
```

Expected: canonical が `https://kakei.nexeed-lab.com/zeikin/fuyou-no-kabe/`、og:image が `https://kakei.nexeed-lab.com/img/og/site.png`

- [ ] **Step 5: Cloudflare Web Analytics を有効にする**

**ダッシュボードでのみ発行できる**（wrangler の OAuth トークンには RUM のスコープが無く、API では `Authentication error` になる）。
Analytics > Web analytics で `kakei.nexeed-lab.com` を追加し、発行されたトークンを `content/site.json` の `webAnalyticsToken` に入れて再デプロイする。

そのうえで、**ビーコンが実際に飛んでいることを確認する**（タグが出ているだけでは足りない）。ブラウザで本番ページを開き：

```js
performance.getEntriesByType('resource').map(r => r.name).filter(n => n.includes('cloudflareinsights'))
```

Expected: `beacon.min.js`（script）と `cdn-cgi/rum`（xmlhttprequest）の**両方**が出る

- [ ] **Step 6: Search Console にサイトマップを送る**

`sc-domain:nexeed-lab.com` のドメインプロパティが全サブドメインをカバーしている。
サイトマップ `https://kakei.nexeed-lab.com/sitemap.xml` を送信し、URL検査でインデックス登録をリクエストする（1日の上限は10件）。

**⚠️ リクエストは順番待ちに入れるだけで、登録を保証しない。** 送信した時点では全URLが「インデックス未登録」である。

- [ ] **Step 7: `kakei/HANDOFF.md` を書き直してコミット・push する**

**このファイルだけ読めば再開できる**状態にする。`検証済み` と `未確認` を必ず分けて書く。
特に「Step 3〜5 で実際に出力を見た結果」と「まだ見ていないもの（インデックスされたか・アクセスの実数）」を混ぜない。

```bash
cd "C:/Users/oshim/Documents/projects/kakei"
git add -A && git commit -m "本番へデプロイし、計測とインデックスの導線をつないだ" && git push
```

- [ ] **Step 8: `moshimo-affiliate/HANDOFF.md` を更新する**

「転換先は新リポジトリ `kakei`。そちらの `HANDOFF.md` を見ること」と書き、affi は凍結状態であることを残す。コミットして push する。

---

## 完了条件

1. `kakei/site` で `npm test` が 7 件 PASS する
2. `kakei/site` で `npm run build` が exit 0 で、記事1本・固定ページ2枚・カテゴリ1つを出力する
3. `https://kakei.nexeed-lab.com/` と記事URLが本番で 200 を返す
4. 記事の引用・数字が `source-verifier` の照合を通っている（`不一致` `根拠なし` が0件）
5. `kakei/HANDOFF.md` を読むだけで次のセッションが再開できる
