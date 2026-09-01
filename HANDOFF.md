# HANDOFF

最終更新: **2026-09-01**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況（**公開済み**。Task 7 Step 4 まで完了）

記事1本で **2026-09-01 に公開した**。生成器・ガード・記事・本番がそろっている。

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/**（2026-09-01 に**公開済み**） |
| リポジトリ | **github.com/oshima0627/kakei（private）**。`main` が本番 |
| デプロイ | `npm run deploy`（`site/` で実行。Cloudflare Workers Static Assets / Worker 名 `kakei-log`） |
| 記事 | **1本**（`zeikin/fuyou-no-kabe` 扶養の壁） |
| カテゴリ | `zeikin`（税と社会保険）1つ |
| 広告リンク | 0本。`affiliateEnabled` は `false` |
| 計測 | **未設定。**`webAnalyticsToken` が空 |
| Search Console | **未送信** |

## ★ 残っているのは、ダッシュボードでしかできない2つ（本人の作業）

コマンドでは実行できない。**Claude 側からは触れない。**

### 1. Cloudflare Web Analytics を有効にする（Task 7 Step 5）

Analytics > Web Analytics で `kakei.nexeed-lab.com` を追加し、発行されたトークンを
`site/content/site.json` の `webAnalyticsToken` に入れて `npm run deploy` し直す。

**wrangler の OAuth トークンには RUM のスコープが無く、API では `Authentication error` になる**
（姉妹サイトで実測済み）。

そのあと、**ビーコンが実際に飛んでいることまで確認する**（タグが出ているだけでは足りない）。
本番ページのコンソールで:

```js
performance.getEntriesByType('resource').map(r => r.name).filter(n => n.includes('cloudflareinsights'))
```

`beacon.min.js` と `cdn-cgi/rum` の**両方**が出れば動いている。
2026-09-01 時点では**両方とも出ない**（トークンが空なのでタグ自体が出ていない）。

### 2. Search Console にサイトマップを送る（Task 7 Step 6）

`sc-domain:nexeed-lab.com` のドメインプロパティが全サブドメインをカバーしている。
`https://kakei.nexeed-lab.com/sitemap.xml` を送信し、URL検査でインデックス登録をリクエストする（1日10件まで）。

**⚠️ リクエストは順番待ちに入れるだけで、登録を保証しない。**

## 本番で確認したこと（2026-09-01・実際の出力）

```
/                              200 text/html 4824
/zeikin/fuyou-no-kabe/         200 text/html 37122
/robots.txt                    200 text/plain 616
/sitemap.xml                   200 application/xml 568
/img/og/site.png               200 image/png 74907
/nonexistent-page/             404 text/html 2621
/zeikin/fuyou-no-kabe (末尾/無) 307 -> https://kakei.nexeed-lab.com/zeikin/fuyou-no-kabe/
```

- 記事の canonical は `https://kakei.nexeed-lab.com/zeikin/fuyou-no-kabe/`、
  og:image は `https://kakei.nexeed-lab.com/img/og/site.png`（**どちらも実URLと一致**）
- 記事ページに `<meta name="robots">` は無い（index される）。カテゴリページは `noindex,follow`
- `sitemap.xml` は5URL（トップ・記事・about・privacy・sitemap）。カテゴリページは載っていない
- ブラウザで本番トップを開いてコンソールエラー0件、横スクロールなし

## ローカルで検証済み（実際に実行して出力を見たもの）

```
$ cd site && npm test
ℹ tests 23 / ℹ pass 23 / ℹ fail 0

$ cd site && npm run build
built: 1 article(s), 2 page(s), 1 category page(s)
  /zeikin/fuyou-no-kabe/  扶養の壁（103万・106万・130万・150万・160万）を公式ページの原文で確かめる
```

`npm run dev`（wrangler dev）でブラウザに実表示して確認した:

- 制度カード4枚が、**全部に出典URLと確認日が付いた形**で出力される
- 表3つが崩れない。未解釈の `**` は0件。コンソールエラーは0件（PC幅・375px とも）
- **375px で `document.body.scrollWidth === document.body.clientWidth`**（横スクロールなし）。
  幅の広い表は `div.table-wrap`（`overflow-x: auto`）の中だけでスクロールする
- カテゴリページは `noindex,follow` で、`sitemap.xml` にも載っていない（カテゴリ1個のときの仕様どおり）
OG画像（Task 7 Step 1）は**差し替え済み**。`site/public/img/og/site.png` は
PNG シグネチャ `89504e470d0a1a0a` / IHDR **1200×630** / 74,907 bytes（Node で実際に読んで確認）。
姉妹サイトのものはもう残っていない。

## 専門エージェント2本は**起動を確認した**（効果も実測できた）

`~/.claude/agents/` の `article-writer` と `source-verifier` は、このセッションで**実際に起動して動いた**。

そして **`source-verifier` は実際に不一致を3件見つけた**。書いた本人の自己申告では「全部確認した」だった記事に対して、
一次情報を取り直した結果:

1. 厚労省の引用から、原文冒頭の限定句（「毎年の被扶養者認定の時に」「人手不足による労働時間延長等に伴い」）が
   丸ごと落ちていた。読者は適用場面を誤解する
2. 配偶者特別控除の表で、本人900万円以下の列の最終行を「1万円」と書いていた（正しくは **3万円**。
   1万円は 950万円超1,000万円以下 の列の値）＝**列の取り違え**
3. まとめ表で、満額控除の区分の下限（「58万円超」）が落ちていた

**3件とも、ビルドガードでは検出できない種類の誤り**（引用の欠落・列の取り違え・区分の下限）。
`assertCardNumbers` は記事内の内部整合しか見ないので、表そのものが事実と違っていても通る。
**生成と検証を分けたことに実測の裏付けが付いた。** `source-verifier` から `Edit` / `Write` を外してあるのは
この設計の要点なので、足さないこと。

修正後に**修正部分だけ再照合**して全12細目が `一致` になっている。
⚠️ 再照合は修正部分のみ。初回に `一致` と判定した他30項目を取り直してはいない。

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

## ⚠️ 2026-10-01 にこの記事のビルドが落ちる（意図した挙動）

`zeikin-fuyou-no-kabe.md` の `revisionAt` は **2026-10-01**。
厚労省の適用拡大特設サイトが「2026年10月に賃金要件を撤廃予定」と書いているためで、
その日が来ると `assertNotExpired` がビルドを落とす。

**対処は「出典を取得し直して本文を確認し、`checkedAt` と `revisionAt` を両方更新する」。
`revisionAt` だけを先に進めない。**

なお、賃金要件の撤廃時期について厚労省のページは**2か所で書きぶりが違う**（特設サイトは
「2026年10月に撤廃予定」と言い切り、政策ページは「公布から3年以内で、全国の最低賃金が
1,016円以上となることを見極めて判断」）。記事は片方を選ばず両方そのまま並べてある。

## このリポジトリの状態

- `site/content/articles/` に記事1本
- `site/content/site.json` の `categories` は `zeikin` 1つ。**2つ目を足すまでカテゴリページは noindex**
- `site/content/links.json` はキー0件（提携ASPが未確認のため）
- `affiliateEnabled` は `false`（リンクが1本も無いため）
- `webAnalyticsToken` / `xHandle` は未発行・未開設で空文字
- `tools/og-card.js` は家計の制度ログ用に書き換え済み。**Node では動かない**（canvas を使うのでブラウザで実行する）

## 未確認（確かめていないもの。確かめたように書かないこと）

- **インデックスされたかどうか。** Search Console に何も送っていないので、登録は0本
- **アクセスの実数。** 計測トークンが未発行で、ビーコンは1本も飛んでいない
- ふるさと納税・証券口座・保険相談などの金融ASP案件が実在するか、提携できるか（`links.json` にコメントで明記済み）
- 記事本文で「未確認」と明示したもの: 住民税の壁の金額／令和8年分のパート収入の非課税ライン／
  特定扶養親族の年齢範囲（国税庁 No.1180 に記載が無い）／19〜23歳の被扶養者150万円の根拠省令・通知名／
  賃金要件が撤廃される正確な日
- `npm test` のスクリプトは `node --test "test/**/*.test.mjs"`（グロブは Node に展開させるため引用符で囲ってある）。
  **`node --test test/`（ディレクトリ指定）はこの環境で落ちる**（`MODULE_NOT_FOUND`。Node v24.1.0 / Windows 11）。
  グロブ指定で回避したが、**根本原因は未特定**

## ガードをすり抜ける経路（塞がっていない。黙って残さないために書く）

レビューで数えた13経路のうち、塞がったのは 3・4・7・9・10・11・12。以下は**残っている**。
記事を書くときは人間か `source-verifier` が見るしかない。

| # | 名前 | 内容 |
|---|---|---|
| 1 | 素の本文数字 | `seido` フェンスに入れない数字は一切検査されない |
| 2 | 名寄せ不在 | `sources` は記事単位のリスト。**どの数字がどの URL 由来かを機械は知らない** |
| 5 | 表そのものが無検査 | `assertCardNumbers` が保証するのは**記事内の内部整合だけ**。表が事実と合っているかは誰も見ていない。**今回の不一致3件はすべてこの穴を通った** |
| 6 | `revisionAt` 省略 | 任意項目なので、書かなければ発火しない |
| 8 | `revisionAt` だけ前進 | `checkedAt` 据え置きで `revisionAt` を +1年 すれば通る。機械的な防御は無い |
| 13 | 固定ページ免除 | `pages/*.md` は `sources` / `checkedAt` が不要（`readDocs` の必須キーに入っていない） |

**`about.md` にはこれらを保証しているとは書いていない。** 実装が保証していないことを読者に約束しないこと。

## 次にやること

1. **上の2つ（Web Analytics のトークン発行・Search Console へのサイトマップ送信）を本人が行う**
2. 2本目の記事。**2つ目のカテゴリを足すまでカテゴリページは noindex のまま**なので、
   `zeikin` でもう1本書くか、`kyoikuhi` / `shisan` の1本目を書くかを決める
3. 記事が10本たまったら ASP の提携申請（`CLAUDE.md` の方針）

⚠️ **記事を1本で公開したこと自体の効果はまだ測れていない。**
姉妹サイト `ikunavi` では、育休・産休系クエリ約30件がすべて83〜105位でクリック0という実測がある
（原因は本文量と診断されている）。**記事を増やせば取れる、という前提には裏付けが無い。**

## 触ってはいけないところ

- **`source-verifier` に `Edit` / `Write` を足さない。**外してあるのが設計の要点。
  今回、生成と検証を分けたことで実際に不一致が3件出た
- **エージェントを本数だけ増やさない。** 2本で始めて、実測で効果が示されたときだけ足す
- **ASPが発行していないURLをリンクにしない。** URLの形を推測して組み立てない
- **`affiliateEnabled` を、リンクが0本のまま `true` にしない**
- **他人のまとめ記事を根拠にしない。**それらが食い違っているから、このサイトを作っている
- **記事が0本のカテゴリを `site.json` に置かない**
- `assertCardNumbers` と `assertNoRawEmphasis` のガードを外さない
- `site.json` の `origin` と `wrangler.jsonc` の `routes` は**必ず同じ値**にする

## 据え置きにした軽微な指摘（直していない）

- fixture の `articles/` `pages/` が空ディレクトリだと git に載らない
- `assertSources` の URL 検査が `startsWith('https://')` だけ（ドメインを見ていない）
- 正常系テストが `<aside class="pcard">` タグとエスケープを検証していない
- `site.json` の `origin` と `wrangler.jsonc` の `routes` の一致を機械が見ていない
