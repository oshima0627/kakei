# HANDOFF

## 現在の状況（Task 5 完了 ＋ ブランチ最終レビューの修正まで）

静的サイト生成器の移植とビルドガードの実装が終わっている。**記事はまだ0本。未デプロイ。**

移植元は `moshimo-affiliate`（姉妹サイト「寸法で選ぶ」）で、**移植した文言のうちサイト固有のものが
書き換えられずに残っていた事故を、このレビューで全部つぶした**（フッターの免責文が
「掲載している寸法・仕様はメーカー公式サイトの…」のまま全ページに出力されていた）。
`site/` と `dist/` に姉妹サイトの文言が残っていないことは grep で確認済み。

**検証済み**（実際に実行して出力を確認）:

```
$ cd site && npm test
… ℹ tests 23 / ℹ pass 23 / ℹ fail 0

$ cd site && npm run build
built: 0 article(s), 2 page(s), 0 category page(s)

注意: affiliateEnabled=false のため、リンク位置はプレースホルダで出力しています。
```

## 検証コマンド

```bash
cd site && npm run build   # 本番の content でビルド
cd site && npm test        # ガードの回帰テスト（test/guards.test.mjs）
```

**`build.mjs` を触ったら必ず両方を走らせる。** ガードは「落ちるべきものが落ちること」で
初めて意味を持つので、ビルドが通っただけでは検証にならない。

## ビルドガードの一覧（何を落とすか）

すべて `site/build.mjs`。回帰テストは `site/test/guards.test.mjs`（23 ケース）。

| ガード | 落とすもの |
|---|---|
| 環境変数ガード（ファイル先頭） | `KAKEI_TODAY` / `KAKEI_CONTENT` / `KAKEI_DIST` が `KAKEI_TEST=1` 無しで設定されている状態でのビルド。**`KAKEI_DIST` が残ったまま `npm run deploy` すると、ビルドは別ディレクトリへ書き、wrangler は古い `dist/` をそのままデプロイする**（`assets.directory` は `./dist` 固定）。ビルドもデプロイも成功して誰も気づかないので、コメントではなくコードで落とす |
| `KAKEI_TODAY` の書式 | 実在しない日付（`2026-13-40` など） |
| `readDocs` の必須キー | 記事の front matter に `title` / `description` / `slug` / `published` / `updated` / `category` / `sources` / `checkedAt` のどれかが無い |
| `assertNoEmptyCategories` | `site.json` に記事が0本のカテゴリが残っている（空のカテゴリページが sitemap に載る事故） |
| 未定義カテゴリ検査 | 記事の `category` が `site.json` の `categories` に無い |
| `assertSources` | `sources` が空 ／ `https://` で始まらない URL がある ／ `checkedAt` が実在しない日付 ／ **`checkedAt` がビルド日より未来**（未来日は経過日数の警告を永久に沈黙させる） |
| `assertNotExpired` | `revisionAt` を**書いてある**記事が、その日**以降**（`<=` なので改定日当日も落ちる）。`revisionAt:` と書いて値を空にしたものも落ちる（書式検査）。**キーごと書いていない記事は許す**（改定日が公表されていない制度があるため任意項目） |
| `assertCardNumbers` | `seido` カードの数値トークンが、同じ記事の表の行に無い。**突き合わせは数値トークンの集合**（文字列の部分一致だと、表が `123万円` のときカードの `12万円` も `1万円` も通ってしまう） |
| `renderSeidoCards` | `seido` フェンスに `制度` が無い ／ `根拠` が `https://` で始まらない ／ `確認日` が実在しない日付 ／ 数字が1つも無い |
| `assertNoRawEmphasis` | 解釈されずに残った `**`（日本語の約物と CommonMark の flanking ルール） |
| `resolveLinks` | `content/links.json` に無い `[[AF:キー]]` |
| `warnIfStale` | 落とさない。`checkedAt` から180日で警告のみ |

## このリポジトリの状態

- `site/content/articles/` は空（記事0本）
- `site/content/site.json` の `categories` は空配列。**これは意図した状態**（記事0本のカテゴリを置くとビルドが落ちる）
- `site/content/links.json` はキー0件（提携ASPが未確認のため）
- `affiliateEnabled` は `false`（リンクが1本も無いため）
- `webAnalyticsToken` / `xHandle` は未発行・未開設で空文字
- `defaultOgImage` は `moshimo-affiliate` からコピーした `public/img/og/site.png` **のまま**（Task 7 で差し替える）
- git は `main` ブランチ。**GitHub リモートは未設定**（外向きの操作なので本人の承認待ち。`git push` はまだできない）

## 次にやること

### Task 6: 1本目の記事を書く

1. `site/content/articles/` に記事を1本置く（`category: zeikin`）
2. **`site/content/site.json` の `categories` に `zeikin` を足す。**
   足し忘れると「未定義のカテゴリ」でビルドが落ちるので、忘れても検出はされる
3. `npm run build` と `npm test` を両方通す

⚠️ **カテゴリが1個の間、カテゴリページ（`/zeikin/`）は `noindex,follow` になり、`sitemap.xml` にも載らない。**
`build.mjs` の `showCategoryNav = site.categories.length >= 2` がそう作ってある
（カテゴリが1つだとカテゴリページとトップページの中身がほぼ同じになり、重複コンテンツとして
競合するため）。姉妹サイトから引き継いだ意図的な挙動。**Search Console にカテゴリページが
出てこなくても不具合ではない。** 2つ目のカテゴリを足した時点で自動的に index される。

### Task 7: デプロイ

- **`site/public/img/og/site.png` は姉妹サイトのままなので、必ず差し替える。**
  SNSのカードはSVGを受け付けないのでPNGにする（1200×630）
- サイト名をハードコードしている箇所は `site/public/favicon.svg` の `aria-label` と
  `site/public/styles.css` の1行目コメントの2つだけ（静的ファイルなので `site.json` から引けない）。
  サイト名を変えるときはここも直す

## 未確認・判断待ち

- **GitHub リポジトリ `kakei` の作成・push は判断待ち**（本人の承認が必要な外向きの操作）
- ふるさと納税・証券口座・保険相談などの金融ASP案件が実在するか、提携できるかは未確認
  （`links.json` にコメントで明記済み）
- `npm test` のスクリプトは `node --test "test/**/*.test.mjs"`（グロブは Node に展開させるため引用符で囲ってある）。
  **`node --test test/`（ディレクトリ指定）はこの環境で落ちる。** 2026-09-01 に再現を確認:

  ```
  Error: Cannot find module 'C:\Users\oshim\Documents\projects\kakei\site\test'
      at Module._resolveFilename (node:internal/modules/cjs/loader:1405:15)
    code: 'MODULE_NOT_FOUND'
  ```

  ディレクトリを走査せず、`test` をエントリーポイントとして実行しようとしている。
  グロブ指定に変えて回避したが、**根本原因は未特定**（Node v24.1.0 / npm 11.3.0 / Windows 11）

## ガードをすり抜ける経路（塞がっていない。黙って残さないために書く）

今回のレビューで数えた13経路のうち、**塞がったのは 3・4・7・9・10・11・12。**
以下は**残っている**。記事を書くときは人間が見るしかない。

| # | 名前 | 内容 |
|---|---|---|
| 1 | 素の本文数字 | `seido` フェンスに入れない数字は一切検査されない |
| 2 | 名寄せ不在 | `sources` は記事単位のリスト。**どの数字がどの URL 由来かを機械は知らない** |
| 5 | 表そのものが無検査 | `assertCardNumbers` が保証するのは**記事内の内部整合だけ**。表が事実と合っているかは誰も見ていない |
| 6 | `revisionAt` 省略 | 任意項目なので、書かなければ発火しない |
| 8 | `revisionAt` だけ前進 | `checkedAt` 据え置きで `revisionAt` を +1年 すれば通る。機械的な防御は無い（`CLAUDE.md` に「revisionAt だけを先に進めない」と書いてあるだけ） |
| 13 | 固定ページ免除 | `pages/*.md` は `sources` / `checkedAt` が不要（`readDocs` の必須キーに入っていない） |

**`about.md` にはこれらを保証しているとは書いていない。** 実装が保証していないことを
読者に約束しないこと（一度、`revisionAt` が任意項目なのに「記事には次の改定予定日を
持たせています」と書いていて、レビューで指摘された）。

## 据え置きにした軽微な指摘（直していない）

- fixture の `articles/` `pages/` が空ディレクトリだと git に載らない
- `assertSources` の URL 検査が `startsWith('https://')` だけ（ドメインを見ていない）
- 正常系テストが `<aside class="pcard">` タグとエスケープを検証していない
- `site.json` の `origin` と `wrangler.jsonc` の `routes` の一致を機械が見ていない
