# HANDOFF

## 現在の状況（Task 1 完了時点）

`moshimo-affiliate`（worktree `site-direction-5f2f4a`）の静的サイト生成器を、この `kakei` リポジトリへ移植した。
記事0本の状態でビルドが通ることを確認済み。

**検証済み**（実際に `cd site && npm run build` を実行して確認）:

```
> build
> node build.mjs

built: 0 article(s), 2 page(s), 0 category page(s)

注意: affiliateEnabled=false のため、リンク位置はプレースホルダで出力しています。
```
exit code 0。

`dist/` の生成物（about, privacy, 404, robots.txt, sitemap.xml, sitemap/index.html, favicon.svg, styles.css, img/og/site.png）を目視確認済み。canonical / og:url / sitemap の URL はすべて `content/site.json` の `origin`（`https://kakei.nexeed-lab.com`）と一致している。

## このリポジトリの状態

- `site/content/articles/` は空（記事0本）
- `site/content/site.json` の `categories` は空配列（カテゴリ0件の記事も0本のカテゴリも置いていない — 空カテゴリがあるとビルドが落ちる仕様）
- `site/content/links.json` はキー0件（提携ASPが未確認のため）
- `site.json` の `affiliateEnabled` は `false`（リンクが1本も無いため）
- `webAnalyticsToken` / `xHandle` は未発行・未開設で空文字
- `defaultOgImage` は `moshimo-affiliate` からコピーした `public/img/og/site.png` をそのまま使っている。**このサイト専用のOGカードは未作成**（Task 7 で作る想定）
- git リポジトリは `git init -b main` 済み、コミット1本のみ。**リモート（GitHub）は未作成**（Ruling R2 により Task 1 の範囲外。作成とpushは本人の承認を得てから行う）

## 未確認・判断待ち

- ふるさと納税・証券口座・保険相談などの金融ASP案件が実在するか、提携できるかは未確認（`links.json` にコメントで明記済み）
- GitHub リポジトリ `kakei` の作成・push は判断待ち（本人の承認が必要）

## 次のタスク

Task 2 以降で `build.mjs` にビルドガード（`sources`/`checkedAt` 必須、`revisionAt` 期限切れ検知、`seido` フェンスと表の数字一致チェック、`assertNoEmptyCategories` など）を追加していく。
