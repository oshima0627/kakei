# HANDOFF

最終更新: **2026-09-07**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況

**公開済み。記事は手元・本番とも10本で一致している。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | **`main` への push で自動**（Cloudflare Workers Builds）。手動は `npm run deploy`（`site/` で実行。Worker 名 `kakei-log`） |
| 記事 | 手元 **10本** / 本番 **10本**（下の表。10本すべて本番反映済み） |
| カテゴリ | **2つ**（`zeikin` 税と社会保険 5本 ／ `kyoikuhi` 教育費 5本）。2つ以上あるのでカテゴリページは index 対象で、sitemap にも載る |
| sitemap | 手元ビルド **16URL** / 本番 **16URL**（どちらも実測） |
| 広告リンク | 0本。`affiliateEnabled` は `false` |
| 計測 | Cloudflare Web Analytics 稼働中（トークン `b6fa8119b49a44f5bde1f57e383bd689`） |
| Search Console | `sc-domain:nexeed-lab.com`。サイトマップ送信済み |

### 記事一覧

`revisionAt` は任意項目。**書いてある記事はその日以降ビルドが落ちる**（`assertNotExpired`）。

| slug | 記事の芯 | revisionAt |
|---|---|---|
| `zeikin/fuyou-no-kabe` | 103・106・130・150・160 は何の壁か | **2026-10-01** ⚠️ |
| `zeikin/furusato-nozei-jogen` | 上限額を決めているのは総務省の3本の計算式 | なし |
| `zeikin/kougaku-ryouyouhi` | 2026年8月から年単位の上限額が入った | なし |
| `zeikin/iryouhi-koujo` | 適用下限額は10万円とは限らない | なし |
| `zeikin/jutaku-loan-koujo` | 「年末残高の0.7％」だけでは決まらない | 2027-04-01 |
| `kyoikuhi/koukou-mushouka` | 「高校無償化」は制度の名前ではない | なし |
| `kyoikuhi/daigaku-mushouka` | 無償化されたのは授業料等減免だけ | なし |
| `kyoikuhi/jidouteate` | 3人いても「第3子」とは限らない | なし |
| `kyoikuhi/shogakukin-henkan` | 減額返還も猶予も返す総額が減らない | 2027-04-01 |
| `kyoikuhi/hoiku-mushouka` | **無料になるのは利用料だけ**（10本目・2026-09-07） | なし |

## 10本目の記事（2026-09-07・**本番反映まで確認済み**）

`kyoikuhi/hoiku-mushouka`「「幼児教育・保育の無償化」で無料になるのは利用料だけ ―
給食費・通園送迎費・行事費は残り、0歳から2歳児クラスは原則として対象外」。**教育費カテゴリの5本目。**

テーマは前回まで「判断待ち」だった。本人が3案から選んだもの。
外したままの候補は**国民年金の学生納付特例**と**遺族年金の2028年見直し**の2つ。

**記事の芯は3つ。**

1. **無料になるのは利用料だけ。** こども家庭庁が「通園送迎費、食材料費、行事費などについては、
   無償化の対象とはなりません」と書いている。国の資料はさらに踏み込んで、食材料費は
   「保護者が負担する考え方を維持」と方針として書いている
2. **0歳から2歳児クラスは原則として対象外。** 無料になるのは住民税非課税世帯だけ。
   国の資料は「０～２歳の保育の必要なこども（市町村民税非課税世帯に限る。）」と明記している
3. **施設の種類で、上限額も手続きも違う。** 認可の園は上限なし・手続き不要だが、
   幼稚園の預かり保育（月1.13万円）と認可外（月3.7万円）は上限があり、
   どちらも「保育の必要性の認定」が要る

拾った細かい差:

- **副食費の「第3子以降」の数え方が、認定の種類で違う**（教育認定は小学校第3学年修了前まで、
  保育認定は小学校就学前まで）。自治体向けFAQ にしか書かれていない
- **免除されるのは副食費だけで、主食費は対象外**
- 預かり保育の上限は月額だけでなく**日数でも頭を打つ**（利用日数×450円との小さいほう）
- 保育所は「3歳になった後の4月1日」から、幼稚園は「3歳になった日」から

`revisionAt` は**書いていない**。こども家庭庁が改定日を公表していないため（ふるさと納税と同じ扱い）。

### 図版は棒グラフにしていない

⚠️ **4つの区画は「費目」であって金額ではない。** 長さで量を語らせると、行事費が保育料と同じ額に
見えるか、逆に比率を発明することになる。**4列とも同じ大きさにして、表（マトリクス）に見える形**にした。
`svg/hoiku-mushouka.svg` の冒頭コメントに、その理由を書いてある。

viewBox の高さは 380。最初 420 で作ったら**下に何も無い帯ができて図が上に寄った**ので詰めた。

### スライドが10枚になった（前回直したバグの答え合わせ）

前回 `embed_svg()` のスライド並び順を辞書順から数値順に直してある。
**10枚目ができて初めて発火するバグ**だったので、今回が実地の確認になった。

**既存9枚の PNG は git 上で1バイトも変わっていない。** ずれていれば全部変わる。

### 検証（実際の出力）

```
cd site && npm run build → built: 10 article(s), 2 page(s), 2 category page(s)
cd site && npm test      → ℹ tests 37 / ℹ pass 37 / ℹ fail 0
python tools/verify-quotes.py → 合計 291 行 / 一致 291 / 不一致 0（新記事は 33/33）
手元 dist の sitemap → 16URL（15→16）
既存9枚の PNG → git 上で1バイトも変わっていない
375px で実測 → body に横スクロールなし。表は .table-wrap 内で横スクロール
表の自然幅 → 637 / 754 / 371 / 745 / 1147px（既存の最大 1142px と同程度）

本番（main への push から自動ビルド。実測）:
200 text/html 39728  /kyoikuhi/hoiku-mushouka/
200 image/png 65255  /img/og/hoiku-mushouka.png
200 text/html 10668  /kyoikuhi/
sitemap.xml → 16URL（15→16）
canonical と og:image は実URLと一致
本番と手元ビルドの突き合わせ（記事・カテゴリ・トップ・sitemap）→ 差分0
本番の og 画像 → 手元とバイト一致（md5 a1bd930b）
```

⚠️ **本番を Python の `urllib` で叩くと 403 が返る**（既定の UA が弾かれる）。
`User-Agent` を付ければ通る。`curl` は素で通る。

⚠️ **`file://` で dist を開くと `/styles.css` が解決せず、CSS 無しの状態を測ってしまう。**
一度それで「横スクロールなし」と読み違えかけた。**必ず `python -m http.server` で配ってから測る。**

`.gnav` の「プライバシーポリシー」「サイトマップ」は 375px で右にはみ出すが、
**既存記事でも同じ**（サイト共通のヘッダで、この記事が持ち込んだものではない）。body は横スクロールしない。

## アイキャッチの作り方

```bash
python tools/article-images/build.py
```

1. `tools/article-images/svg/<slug>.svg` に図版を描く。**日本語は SVG に入れない**
2. `build.py` の `SLIDES` に1件足す（`svg` / `png` / `category` / `title` / `title_size` /
   `subtitle` / `legend` / `note` / `labels`）
3. 走らせると `article-images.pptx` にスライドが増え、`site/public/img/og/<slug>.png` が出る
4. 記事の front matter に `eyecatch` と **`eyecatchAlt`** を書く
5. **できた PNG を必ず目で見る**

### 図の中に日本語ラベルを置く仕組み

`CLAUDE.md` の「日本語は SVG に入れない」を守ると、図の要素に名前が付けられず、読者は
「図形 → 右下の凡例 → さらに小さい注記」と3往復しないと図を読めなかった（2026-09-04 の指摘）。
**PowerPoint のテキストボックスなら日本語を置ける**ので、図の上に重ねている。

```python
"labels": [
    {"at": (212, 345), "text": "(1) 所得税から", "size": 15},
    {"at": (212, 74), "text": "住民税所得割額の20％\n＝ここが天井", "size": 13, "color": WARN},
]
```

- `at` は **SVG の viewBox 座標**。図を描いた座標系のまま書ける
- `align` は `"left"`（既定）／`"right"`／`"center"`
- `width` で箱の幅（既定 `LABEL_BOX_W` = 1.9インチ）。超える文字数は折り返す
- ⚠️ **座標変換は x と y で別々の倍率をかけている。**図版は縦横比を保たずに枠へ引き伸ばされるため

関係する定数: `FIG_L / FIG_T / FIG_W / FIG_H`（図版の枠。画像とラベルの座標変換が必ず一致するよう
定数化してある。**片方だけ動かさない**）／ `svg_viewbox()` ／ `add_figure_labels()` ／
`WARN`（`--warn-line` #e7cd7a。黄色い破線を指すラベルの色）。

### 繰り返した失敗（同じことをしないため）

- ラベルが破線や図形に**重なる**。→ 線の端を縮めるか、ラベルを図の外の余白へ寄せる
- 注記が折り返して「（円）」だけ2行目に落ちる。→ 注記を自分で改行して2行に割る
- **図を描き直したら `eyecatchAlt` も直す。** ガードは中身の正しさを見ない
  （alt が古い図の説明のまま `npm run build` が通った実例がある）
- **1つの図形に数字は1つ。** 公立と私立の額を上下に並べて指摘を受けている
- ⚠️ **記事画像に自動テストは無い。** `build.py` を触ったら、**PNG を目で見る**か
  `git status` で既存 PNG が変わっていないことを確認する

## 自動デプロイ（2026-09-02 に設定・画面で確認済み）

**`main` に push すると Cloudflare が自分でビルドしてデプロイする**（Workers & Pages → kakei-log → Settings → Builds）。

| 項目 | 値 |
|---|---|
| Git repository | `oshima0627/kakei` |
| Root directory | `/site` |
| Build command | `npm ci && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |
| Builds for non-production branches | **オフ**（`claude/*` でビルドを回さない） |

⚠️ **ビルドは Cloudflare 側の Linux で走る。記事画像の生成は自動ビルドに含まれていない**
（LibreOffice に依存するので手元でしか動かない）。**PNG は必ずコミットすること。**

⚠️ **手動の `npm run deploy` も今も使える**が、**その内容は `main` と一致している必要がある。**
ずれると次の push で上書きされる。

⚠️ **本番と手元の突き合わせは改行コードを揃えてから行う。** 手元 `dist/` は CRLF、
Cloudflare の Linux ビルドは LF（記事1本で63バイト差が出る）。中身は同じ。
`diff` をプロセス置換で使うと誤検知したので、Python で `\r` を除いて比較する。

⚠️ **worktree には `site/node_modules` が無い。** 手元でビルドする前に `cd site && npm ci` が要る。

## ⚠️ 2026-10-01 に1本目のビルドが落ちる（意図した挙動）

`zeikin-fuyou-no-kabe.md` の `revisionAt` は **2026-10-01**。厚労省の適用拡大特設サイトが
「2026年10月に賃金要件を撤廃予定」と書いているためで、その日が来ると `assertNotExpired` が止める。

**あと1か月を切っている。自動デプロイを入れてあるので、その日以降は `main` への push が
毎回ビルド失敗になる。** 本番が壊れるわけではない（古い版が配信され続ける）が、
放置すると新しい記事も出せなくなる。

**対処は「出典を取得し直して本文を確認し、`checkedAt` と `revisionAt` を両方更新する」。
`revisionAt` だけを先に進めない。**

なお賃金要件の撤廃時期は厚労省の**2か所で書きぶりが違う**（特設サイトは「2026年10月に撤廃予定」、
政策ページは「公布から3年以内で、全国の最低賃金が1,016円以上となることを見極めて判断」）。
記事は片方を選ばず両方そのまま並べてある。

## Search Console

プロパティは `sc-domain:nexeed-lab.com`（uchina-map と共用のドメインプロパティ）。サイトマップ送信済み。

2026-09-02 に、未登録だった8URLへインデックス登録をリクエストした（画面でダイアログを確認済み）。
**その後どうなったかは未確認。**

⚠️ **リクエストは優先クロールキューに入れるだけで、登録を保証しない。**

**次にやること（本人のダッシュボード操作）**: 送った8URLの状態を URL 検査で見る。
加えて、その後に出た `/zeikin/jutaku-loan-koujo/`・`/kyoikuhi/shogakukin-henkan/`・
`/kyoikuhi/hoiku-mushouka/` の3本もリクエストする。

## 引用を照合する方法

```bash
python tools/verify-quotes.py               # 全記事
python tools/verify-quotes.py <記事名>.md   # 1本だけ
```

スクリプトが吸収しているつまずき:

1. **文字コード**: 総務省は Shift_JIS（`cp932`）、国税庁・文科省・こども家庭庁は UTF-8
2. **実体参照**: 総務省の式は `&times;` `&#39;` で書かれている
3. **HTMLコメント**: 国税庁 No.1180 の（注2）は `<!-- -->` の中にあり画面に出ていない
4. **画像の代替テキスト**: 総務省の式番号 `(1)(2)(3)(3)'` は画像。`alt` を本文に差し込む
5. **PDF**: 文科省・こども家庭庁の金額は HTML に無く PDF にしかない（PyMuPDF で抽出）

照合は**空白をすべて除いてから**部分一致で見る。だから PDF の途中改行や、HTML のタグ由来の
空白は問題にならない。**不一致が出たら原文を読み直して記事のほうを直す。原文に合わせる。逆はしない。**

⚠️ **照合できるのは「引用が原文にあるか」だけ。** 引用の選び方が原文の趣旨を曲げていないか、
表の内容が事実と合っているかは見ていない。そこは `source-verifier` か人間の仕事。

**金額が PDF にしかないときは、座標つきで表を組み直してから読む。**

```bash
python tools/pdf-table.py <PDFのURL> <ページ番号> 3
```

素のテキスト抽出は列の対応を保たないので、**数字だけが並んでどの区分か確定できない。**
**列の取り違えは実際に起きた誤り**なので、目視で対応づけない。

## 検証コマンド

```bash
cd site && npm run build   # 本番の content でビルド
cd site && npm test        # ガードの回帰テスト（test/guards.test.mjs）
```

**`build.mjs` を触ったら必ず両方を走らせる。** ガードは「落ちるべきものが落ちること」で
初めて意味を持つので、ビルドが通っただけでは検証にならない。

⚠️ `KAKEI_TODAY` / `KAKEI_CONTENT` / `KAKEI_DIST` は**テスト専用**。
これらが環境に残った状態で `npm run build` / `npm run deploy` を打つとビルドが落ちる（意図的な安全弁）。

⚠️ `npm test` は `node --test "test/**/*.test.mjs"`。**`node --test test/` はこの環境で落ちる**
（`MODULE_NOT_FOUND`。Node v24.1.0 / Windows 11）。根本原因は未特定。

## ビルドガードの一覧（何を落とすか）

すべて `site/build.mjs`。回帰テストは `site/test/guards.test.mjs`（**37ケース**）。

| ガード | 落とすもの |
|---|---|
| 環境変数ガード（ファイル先頭） | `KAKEI_TODAY` / `KAKEI_CONTENT` / `KAKEI_DIST` が `KAKEI_TEST=1` 無しで設定されている状態でのビルド。**`KAKEI_DIST` が残ったまま `npm run deploy` すると、ビルドは別ディレクトリへ書き、wrangler は古い `dist/` をデプロイする**。両方成功して誰も気づかない |
| `KAKEI_TODAY` の書式 | 実在しない日付（`2026-13-40` など） |
| `readDocs` の必須キー | front matter に `title` / `description` / `slug` / `published` / `updated` / `category` / `sources` / `checkedAt` のどれかが無い |
| `assertNoEmptyCategories` | `site.json` に記事が0本のカテゴリが残っている |
| 未定義カテゴリ検査 | 記事の `category` が `site.json` の `categories` に無い |
| `assertSources` | `sources` が空 ／ `https://` で始まらない URL がある ／ `checkedAt` が実在しない日付 ／ `checkedAt` がビルド日より未来 |
| `assertNotExpired` | `revisionAt` を**書いてある**記事が、その日以降。キーごと書いていない記事は許す |
| `assertCardNumbers` | `seido` カードの数値トークンが、同じ記事の**その制度名を含む表の行**に無い |
| `assertEyecatch` | 記事に `eyecatch` が無い ／ 指した画像が `site/public/` に無い ／ og:image になる画像が PNG でない |
| `assertEyecatchAlt` | `eyecatchAlt` が空 ／ 記事タイトルと同じ文。⚠️ 見ているのは「書いたか」と「タイトルの丸写しか」だけで、**中身が伝わるかは判定していない** |
| `renderSeidoCards` | `seido` に `制度` が無い ／ `根拠` が `https://` で始まらない ／ `確認日` が実在しない日付 ／ 数字が1つも無い |
| `assertNoRawEmphasis` | 解釈されずに残った `**`（日本語の約物と CommonMark の flanking ルール） |
| `resolveLinks` | `content/links.json` に無い `[[AF:キー]]` |
| `assertAdDisclosure` | 出力HTMLに `class="buy"` があるのに `pr-notice` が無い（ステマ規制）。**links.json を迂回して生HTMLで広告リンクを直書きした場合の経路** |
| `assertAnalyticsClaims` | `webAnalyticsToken` が入っているのに原稿が「アクセス解析は導入していません」と書いている（逆も） |
| `assertNoPrematureDisclosure` | `affiliateEnabled=false`（リンク0本）なのに、原稿に `disclosureOnlyPhrases` の言い回しが書かれている |
| `warnIfStale` | 落とさない。`checkedAt` から180日で警告のみ |

## ガードをすり抜ける経路（塞がっていない。黙って残さないために書く）

記事を書くときは人間か `source-verifier` が見るしかない。

| # | 名前 | 内容 |
|---|---|---|
| 1 | 素の本文数字 | `seido` フェンスに入れない数字は一切検査されない |
| 2 | 名寄せ不在 | `sources` は記事単位のリスト。**どの数字がどの URL 由来かを機械は知らない** |
| 5 | 表そのものが無検査 | `assertCardNumbers` が保証するのは**記事内の内部整合だけ**。表が事実と合っているかは誰も見ていない |
| 6 | `revisionAt` 省略 | 任意項目なので、書かなければ発火しない |
| 8 | `revisionAt` だけ前進 | `checkedAt` 据え置きで `revisionAt` を +1年 すれば通る |
| 13 | 固定ページ免除 | `pages/*.md` は `sources` / `checkedAt` が不要 |

**`about.md` にはこれらを保証しているとは書いていない。** 実装が保証していないことを読者に約束しない。

## 未検証（確かめていない。確かめたように書かないこと）

- **`article-images.pptx` を PowerPoint で開いていない。** SVG が入っていることは zip を開いて
  確認したが、**PowerPoint が実際にベクタとして表示・編集できるかは未確認**。
  LibreOffice 経由の PDF 書き出しは通っている
- **インデックスされたかどうか。** 2026-09-02 のリクエスト後を見ていない
- **アクセスの実数。** ビーコンは飛んでいるが、ダッシュボードの数字は見ていない
- **記事を増やせば順位が付く、という前提。** 姉妹サイト `ikunavi` では育休・産休系クエリ約30件が
  すべて83〜105位でクリック0（本文量が原因と診断）。**裏付けは無い**
- 金融ASP案件が実在するか・提携できるか（`links.json` にコメントで明記済み）
- 記事本文で「未確認」と明示したものは、各記事の「確認できなかったこと」節にある

## 触ってはいけないところ

- **`source-verifier` に `Edit` / `Write` を足さない。** 外してあるのが設計の要点
- **エージェントを本数だけ増やさない。** 2本で始めて、実測で効果が示されたときだけ足す
- **ASPが発行していないURLをリンクにしない。** URLの形を推測して組み立てない
- **`affiliateEnabled` を、リンクが0本のまま `true` にしない**
- **他人のまとめ記事を根拠にしない。** それらが食い違っているから、このサイトを作っている
- **記事が0本のカテゴリを `site.json` に置かない**
- `assertCardNumbers` / `assertNoRawEmphasis` / `assertAdDisclosure` / `assertNoPrematureDisclosure`
  のガードを外さない
- `site.json` の `origin` と `wrangler.jsonc` の `routes` は**必ず同じ値**にする
- **記事画像の PNG を手で描き換えない。** 正は `tools/article-images/`（SVG と .pptx）
- **画像の色を `styles.css` と別々に決めない。** 色を変えるときは `--navy` / `--link` /
  `--warn-line` と `build.py` の定数を必ず一緒に動かす

## 据え置きにした軽微な指摘（直していない）

- fixture の `articles/` `pages/` が空ディレクトリだと git に載らない
- `assertSources` の URL 検査が `startsWith('https://')` だけ（ドメインを見ていない）
- 正常系テストが `<aside class="pcard">` タグとエスケープを検証していない
- `site.json` の `origin` と `wrangler.jsonc` の `routes` の一致を機械が見ていない

## 次にやること

1. **⚠️ 2026-10-01 に1本目（`zeikin-fuyou-no-kabe.md`）の `revisionAt` が切れて、
   `main` への push でビルドが落ちる。** あと1か月を切っている。**最優先。**
   対処は「出典を取り直して本文を確認し、`checkedAt` と `revisionAt` を両方更新する」
2. **記事が10本たまったので、ASP の提携申請ができる**（`CLAUDE.md` の方針）。
   提携できたら `links.json` にリンクを入れ、そのあとで `affiliateEnabled` を `true` にする。
   **リンクが0本のまま先にフラグを立てない**
3. **Search Console のインデックス登録リクエスト**（本人のダッシュボード操作）。上の節のとおり
4. **11本目の記事。**テーマは**判断待ち**。調べて外した候補が2つ残っている
   （国民年金保険料の免除・学生納付特例 ／ 遺族年金の2028年見直し）。
   ⚠️ **`shisan` は姉妹サイト `nisa` が NISA を持っている。**territory が重ならない題材にすること。
   育休・産休・出産手当金・傷病手当金は `ikunavi` の territory なので書かない
