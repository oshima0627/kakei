# HANDOFF

最終更新: **2026-09-02**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況

**公開済み。記事は手元に5本、本番に4本。⚠️ 5本目（高額療養費）は書き上がっているが、まだデプロイしていない（下記）。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | `npm run deploy`（`site/` で実行。Cloudflare Workers Static Assets / Worker 名 `kakei-log`） |
| 記事 | 手元 **5本** / 本番 **4本**（`zeikin/fuyou-no-kabe` ／ `zeikin/furusato-nozei-jogen` ／ `kyoikuhi/koukou-mushouka` ／ `kyoikuhi/daigaku-mushouka` ／ **`zeikin/kougaku-ryouyouhi` 高額療養費＝本番未反映**） |
| sitemap | 手元ビルド **11URL** / 本番 **10URL**（どちらも実測） |
| カテゴリ | **2つ**（`zeikin` 税と社会保険 ／ `kyoikuhi` 教育費）。**2つになったのでカテゴリページは index 対象になり、sitemap にも載った** |
| 広告リンク | 0本。`affiliateEnabled` は `false` |
| 計測 | Cloudflare Web Analytics 稼働中（トークン `b6fa8119b49a44f5bde1f57e383bd689`） |
| Search Console | `sc-domain:nexeed-lab.com`。サイトマップ送信済み。**2026-09-02 に未登録の8URLへインデックス登録をリクエスト済み**（下記） |

## Search Console のインデックス登録リクエスト（2026-09-02・**送信済み**）

sitemap の10URLを1件ずつ URL 検査にかけた。**画面で確認した結果だけを書く。**

| URL | 検査したときの状態 | やったこと |
|---|---|---|
| `/` | **登録済み** | 不要 |
| `/zeikin/fuyou-no-kabe/` | **登録済み** | 不要 |
| `/kyoikuhi/daigaku-mushouka/` | 未登録（URL が Google に認識されていません） | **リクエスト送信** |
| `/zeikin/furusato-nozei-jogen/` | 未登録（同上） | **リクエスト送信** |
| `/kyoikuhi/koukou-mushouka/` | 未登録（同上） | **リクエスト送信** |
| `/zeikin/` | 未登録（同上） | **リクエスト送信** |
| `/kyoikuhi/` | 未登録（クロール済み - インデックス未登録） | **リクエスト送信** |
| `/about/` | 未登録（クロール済み - インデックス未登録） | **リクエスト送信** |
| `/privacy/` | 未登録（クロール済み - インデックス未登録） | **リクエスト送信** |
| `/sitemap/` | 未登録（クロール済み - インデックス未登録） | **リクエスト送信** |

**8件とも「インデックス登録をリクエスト済み」のダイアログを画面で確認した。**
1日の割り当て超過のエラーは1件も出ていない。プロパティは `sc-domain:nexeed-lab.com`
（uchina-map と共用のドメインプロパティ）。

⚠️ **リクエストは優先クロールキューに入れるだけで、登録を保証しない。**
別サイトでの実測では、送った10件は3日以内に全部「登録済み」になった（`kakei-affi` リポジトリの
`jissoku/index-request` の記事）。**このサイトで同じになるかは未検証。**

### 次に見ること（**2026-09-05 ごろ**）

送った8URLを URL 検査で1件ずつ見て、「登録済み」に変わった数を数える。
`/kyoikuhi/`・`/about/`・`/privacy/`・`/sitemap/` は既にクロール済みで未登録だったので、
**クロールされても登録されない**なら理由（重複・低品質判定など）を見る。

## ★ いちばん先にやること ― 5本目の記事をデプロイする

記事 `zeikin/kougaku-ryouyouhi`（高額療養費）は**書き上がってコミット済みだが、本番に出ていない。**
`npm run deploy` が Claude のセッション側（auto mode の分類器）でブロックされたため。**回避はしていない。**

```bash
cd "C:/Users/oshim/Documents/projects/kakei/site"
npm run deploy
```

デプロイしたら、実URLで確認する（前回までと同じ手順）:

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download}
" https://kakei.nexeed-lab.com/zeikin/kougaku-ryouyouhi/
curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download}
" https://kakei.nexeed-lab.com/img/og/kougaku-ryouyouhi.png
curl -s https://kakei.nexeed-lab.com/sitemap.xml | grep -c "<loc>"   # 11 になるはず
```

そのあと Search Console で `/zeikin/kougaku-ryouyouhi/` のインデックス登録をリクエストする。

## 5本目の記事（2026-09-02・**手元では検証済み。本番は未反映**）

`zeikin/kougaku-ryouyouhi`「高額療養費の自己負担限度額は2026年8月から変わった ― 新設された「年間上限」を厚生労働省の原文で確かめる」。
**税と社会保険カテゴリの3本目。**

**記事の芯**: 高額療養費の上限額は **令和8年8月（2026年8月）診療分から改定済み**で、
月単位の限度額に加えて**年単位の「年間上限」が新設**された（年間＝8月から翌年7月）。
さらに **令和9年8月（2027年8月）に所得区分が細分化**され、70歳未満の区分は5→13になる。
**多数回該当の金額は据え置き。**ネット上の説明が食い違う原因は、この3時点のどれを指しているかの違い。

⚠️ **`revisionAt: 2027-08-01` を入れてある。**その日を過ぎるとビルドが落ちる（令和9年8月の改定に合わせた）。

### 資料の中で整合していない点を1つ見つけた（記事に書いた）

厚労省ページは年収200万円未満の多数回該当を「引き下げます（▲同25％）」と書いているが、
資料の表は **44,400円 → 34,500円**（約22.3％）。**25％が何に対する25％かは資料に書かれていない。**
44,400円の25％引きは33,300円で表の額と違う。記事では両方を並べ、確定させていない。

### 検証（実際の出力）

```
npm run build → built: 5 article(s), 2 page(s), 2 category page(s)
npm test      → ℹ tests 34 / ℹ pass 34 / ℹ fail 0
python tools/verify-quotes.py → 合計 121 行 / 一致 121 / 不一致 0（新記事は 14/14）
表の数値の突き合わせ → 123トークン中、原文に無いのは「2027」の2件だけ（令和9年の西暦読み替え）
手元 dist の sitemap → 11URL
本番 /zeikin/kougaku-ryouyouhi/ → 404（未デプロイであることの確認）
```

記事画像 `kougaku-ryouyouhi.png` は既存手順（`tools/article-images/build.py`）で作り、**PNG を目で見て**
文字の折り返しが崩れていないことを確認した。図版は積み上がった自己負担が年間上限の破線で水平になる階段。

⚠️ **世帯合算は扱っていない。**取得した厚労省の3資料に記述が無く、
一次情報を当てられなかったため。記事の「確認できなかったこと」にそう書いてある。

## ビルドガードのテストを1本足した（2026-09-02）

`kakei-affi`（旧 affi）の引き継ぎに「4つのビルドガードを kakei へ移植する価値がある」と残っていたので、
**両方の `build.mjs` を読んで突き合わせた。結果は移植不要。**4つとも kakei にあり、
`assertCardNumbers` は **kakei のほうが厳しい**（affi は `hay.includes(num)` の部分一致なので
表の `350` がカードの `35` を通してしまう。kakei は数値トークンの集合で完全一致を見る）。

ただし **`assertNoRawEmphasis` だけテストが無かった**ので足した。

| 足したもの | 中身 |
|---|---|
| `site/test/fixtures/raw-emphasis/` | `年収の壁は**「103万円」**だけではありません。`（約物に挟まれた太字） |
| `site/test/fixtures/raw-emphasis-ok/` | `**年収の壁は「103万円」だけではありません。**`（約物を強調の内側に入れた形） |
| `site/test/guards.test.mjs` | 上の2つで「落ちる／通る」を固定するテスト2件 |

**落ちる側だけでは「`**` があれば落ちる」ガードでもテストが通ってしまう**ので、通る側を並べてある。

### 検証（実際の出力）

```
落ちる側 → Error: a.md: 太字記法が解釈されずに残っています（CommonMark の flanking ルール）。
           該当箇所: <p>年収の壁は**「103万円」**だけではありません。</p>   exit=1
通る側   → built: 1 article(s) / <strong>年収の壁は「103万円」だけではありません。</strong>   exit=0
npm test → ℹ tests 34 / ℹ pass 34 / ℹ fail 0（32件から2件増）
npm run build → built: 4 article(s), 2 page(s), 2 category page(s)
```

**サイトの出力は変わっていないのでデプロイはしていない**（テストとフィクスチャだけの変更）。

## サイトレビューと、その修正（2026-09-02・**本番反映まで確認済み**）

全文は `docs/site-review-2026-09-01.md`（末尾に修正記録）。**指摘は全件直してデプロイ済み。**
Version ID `c02cbd2e-20bf-49e5-8ea8-4e3f3e2425a6`。本番と手元ビルドは**12ファイル差分0**。

**事実に反していた2件**:

1. **`/privacy/` が「アクセス解析は導入していません」と書いたまま、そのページ自身が
   Cloudflare Web Analytics のビーコンを読み込んでいた。**affi と同じ誤りの再発。
   → 実態に合わせて書き直し、**`assertAnalyticsClaims` でビルドが落ちるようにした**（テスト3件追加・32件全通過）
2. **ふるさと納税の記事の引用が原文と違っていた**（`(3)` / 原文は `(3)'`）。天井に当たった場合の話なので意味が変わる。
   → 直した。**引き継ぎの「37/37 一致」は誤りだった**（前回の照合が `&#39;` を戻していなかった）

そのほか: 原文の限定句の欠落（130万円の「半分未満」の例外・月額108,333円）、言い切りの限定（No.1177 は
給与収入188万円を併記している）、アイキャッチの alt、スキップリンク、サイドバー見出し、JSON-LD の author、
`site.json` の古いコメント。

### 引用照合は `tools/verify-quotes.py` で再実行できる（**捨てないこと**）

```bash
python tools/verify-quotes.py
```

**全記事 90行 / 90行 一致**（実測）。わざと `(3)'` を `(3)` に戻すと**不一致1件を検出して exit 1** することも確かめてある。
実体参照の復元・HTMLコメントの除去・Shift_JIS・PDF の扱いをコードに固定した。

⚠️ **照合できるのは「引用が原文にあるか」だけ。**引用の選び方が原文の趣旨を曲げていないか、
表が事実と合っているかは見ていない。今回の B1・C1 は、その**機械では見えない層**で見つかったもの。

⚠️ **`eyecatchAlt` はガードにしていない。**書かなければ `alt=""` になる（既存 fixture 12本を直す割に合わないと判断）。

## 4本目の記事（2026-09-02・**本番反映まで確認済み**）

`kyoikuhi/daigaku-mushouka`「「大学無償化」は誰の何が無償になるのか」。**教育費カテゴリの2本目**で、
高校無償化の記事と相互にリンクしている（`関連記事` は自動）。Version ID `7923b2a9-1e2c-4413-848b-72de99a7853c`。

**記事の芯**: 高等教育の修学支援新制度は**授業料等減免と給付型奨学金の2本立て**で、
**令和7年度に所得制限が外れたのは減免のほうだけ**。給付型奨学金には収入の基準が残っている
（リーフレットに「収入の基準を超える場合は、給付型奨学金の支給はありません。」とある）。

⚠️ **高校の記事とは事情が違う。**高校では文科省が「高校無償化」という言い方を退けているが、
**大学では文科省自身が「大学無償化」という語を使っている**。同じ書き出しにしないこと。

### 金額は PDF の座標から表を組み直して確定させた

上限額は HTML に無く PDF にしかなく、**素のテキスト抽出では列の対応が取れなかった**
（`35万円 46万円 80万円 91万円 54万円 70万円 28万円 26万円` が並ぶだけ）。
PyMuPDF の `get_text("words")` で **x座標つきで拾い、y座標で行に束ね直して**表を再構成した。
**列の取り違えは過去に実際に起きた誤り**なので、目視で対応づけない。

```bash
python tools/pdf-table.py <PDFのURL> <ページ番号> 3   # 行=y座標、列=x座標で出力
```

### 文科省の2資料で、年収の目安が食い違っている

| 支援の割合 | 周知用資料（2025-06-20） | 令和8年度版リーフレット（2026-02-06） |
|---|---|---|
| 満額 | ～約270万円 | ～約300万円 |
| 2/3 | ～約300万円 | ～約400万円 |
| 1/3 | ～約380万円 | ～約460万円 |
| 1/4 | ～約600万円 | ～約700万円 |

**理由はどちらの資料にも書かれていない。**記事では両方を並べ、理由は推論として明示したうえで確定させていない。

### 検証（実際の出力）

```
npm run build → built: 4 article(s), 2 page(s), 2 category page(s)
npm test      → ℹ tests 32 / ℹ pass 32 / ℹ fail 0
python tools/verify-quotes.py → 合計 107 行 / 一致 107 / 不一致 0
本番 /kyoikuhi/daigaku-mushouka/ → 200 text/html 27751
本番 /img/og/daigaku-mushouka.png → 200 image/png 55352
本番 /sitemap.xml → 10URL（9→10）
手元ビルドとの差分 → 0行
```

記事画像は既存の手順どおり `tools/article-images/` で作った。**1回目はサブタイトルが「新制／度」で折り返して
崩れていた**ので、文言を詰めて作り直している（**PNG を目で見る手順が実際に効いた**）。

## 今回やったこと（2026-09-01・実行して出力を見たものだけ）

### 1. 2本目の記事を書いた

`site/content/articles/zeikin-furusato-nozei-jogen.md`（約17KB）。
**ふるさと納税の「上限額」の正体は、総務省が載せている3本の計算式と、それぞれ別々に付いた上限**である、
という記事。総務省が「具体的な上限額の計算は、お住まいの市区町村の住民税を担当する部署にお問い合わせください」
と書いていることを引いて、**年収別の目安表を載せない理由**を原文で示してある。

引用元（すべて実際に取得した）: 総務省ふるさと納税ポータル 4ページ＋トピックス1ページ、
国税庁タックスアンサー No.1155 / No.1150 / No.1490。

### 2. 引用の照合を**機械的に**やった

記事中の引用行（`> ` で始まる行）37本を、**取得した原文のテキストと空白を除いて突き合わせ**た。

```
引用行 37 / 一致 37 / 不一致 0
```

照合スクリプトと取得した原文は**スクラッチパッドに置いたので残っていない**。
同じことをやり直す手順は下の「引用を照合する方法」に書いた。

⚠️ **これで照合できるのは「引用が原文にあるか」だけ。**「引用の選び方が原文の趣旨を曲げていないか」
「表の内容が事実と合っているか」は見ていない。そこは `source-verifier` か人間の仕事。
**今回 `source-verifier` は起動していない。**

### 3. 記事画像を PowerPoint で作れるようにした

`tools/article-images/` を新設。**図版は手書きの SVG、レイアウトと日本語は PowerPoint** という分担。

```
tools/article-images/
  svg/fuyou-no-kabe.svg          図版（高さの違う5つの壁。白＝税／青＝社会保険）
  svg/furusato-nozei-jogen.svg   図版（3層に積んだ控除と、20％の天井）
  svg/brand-mark.svg             図版（favicon と同じ意匠。site.png 用）
  build.py                       SVG → PNG → .pptx 生成 → SVG 再埋め込み → 1200×630 PNG 書き出し
  article-images.pptx            生成物。**これを PowerPoint で開いて直せる**（3スライド）
  _work/                         中間ファイル（.gitignore 済み）
```

```bash
python tools/article-images/build.py
```

- **SVG は .pptx の中に SVG のまま入っている。** python-pptx は SVG を `add_picture` できないので、
  保存後の OOXML に PowerPoint 2016 以降の `asvg:svgBlip` 拡張を書き足している。
  PNG は代替画像として残る（`ppt/media/*.svg` と `*.png` の両方が入っていることを zip を開いて確認済み）
- 出力先は `site/public/img/og/` の `fuyou-no-kabe.png` / `furusato-nozei-jogen.png` /
  **`site.png`（サイト全体の既定 og:image）**。3枚とも PNG シグネチャと IHDR を読んで **1200×630** を確認済み
- 記事の front matter に `eyecatch:` を足した。`build.mjs` はこれを本文冒頭の図版・記事一覧のサムネイル・
  `og:image`・JSON-LD の `image` に使う（既存の実装。今回 `build.mjs` は触っていない）
- 日本語を SVG に入れていないのは、LibreOffice でのラスタライズをフォントに依存させないため。
  凡例・見出しはすべて PowerPoint のテキストボックス側にある

**前提**: LibreOffice（`C:\Program Files\LibreOffice\program\soffice.exe`）、python-pptx、PyMuPDF。
`soffice` は専用のユーザープロファイルを `-env:UserInstallation` で渡している（起動中の LibreOffice と衝突させないため）。

### 4. 画像の色をサイトの色に合わせた（**指摘を受けて直した**）

最初は favicon の緑（`#0f4c3a`）で作ったが、**画面のほう（ヘッダのカテゴリラベル・表のヘッダ・
サイドバー見出し・フッター）は紺（`--navy: #014172`）**で、並べると色が合っていなかった。
`styles.css` のカスタムプロパティを正として、**画像側を紺に寄せた**。

| 使いどころ | 色 | 出どころ |
|---|---|---|
| 画像の背景 | `#014172` | `--navy`（カテゴリラベル・表ヘッダ・フッターと同じ） |
| 図版のアクセント（社会保険の壁／住民税） | `#8ec5e8` | `--link`（`#0077c6`）を紺の上で読める明るさにしたもの |
| 注意（20％の天井の破線） | `#e7cd7a` | `--warn-line` |

**あわせて直したもの**:

- `site/public/favicon.svg` の緑 → `#014172`（タブのアイコンだけ緑が残るのを避けるため）
- `site/public/img/og/site.png` を PowerPoint 側で作り直した（もとは緑）
- **`tools/og-card.js` を削除した。** ブラウザのコンソールに貼って `site.png` を描く道具で、
  `tools/article-images/build.py` に置き換わったため。**2つの生成器が別の色を出す状態を残さない**

⚠️ **`--accent: #213555`（H2 の縦棒・制度カードの左罫）は画像に使っていない。**
画像で主役にしたのは `--navy` のほう。

### 5. 記事画像を**必ず作る**ようにした（本人の指示）

「これから作成する記事にも画像を作る」を、指示書だけでなく**ビルドガード**にした。

- `build.mjs` に `assertEyecatch` を追加し、`eyecatch` を記事の必須 front matter にした
- 落とすもの: `eyecatch` が無い ／ 指した画像が `site/public/` に無い ／ og:image になる画像が PNG でない
- 回帰テストを3件追加（**23 → 26 件**）。fixture は `no-eyecatch` / `eyecatch-missing-file` / `eyecatch-not-png`
- 既存 fixture 12本の記事にも `eyecatch` を足した
- `CLAUDE.md` に「記事画像の作り方」の手順（SVG を描く → `SLIDES` に足す → `build.py` → `eyecatch` を書く → **目で見る**）を書いた

**寸法（1200×630）は生成側の `build.py` が書き出す前に検査している**ので、ガードでは見ていない。

⚠️ **これ以降、画像の無い記事はビルドできない。** 下書きを content に置いたままにもできない。
邪魔になったら `readDocs('articles', [...])` から `eyecatch` を外すのが最小の戻し方。

### 6. サイドバー見出しが読めなかったのを直した（**指摘を受けて修正**）

「このサイトについて」の文字が紺の帯の上でほとんど読めなかった。原因は **CSS の詳細度**。

```
.widget__title { color: #fff; ... }        /* 0,1,0 */
.widget p      { color: var(--muted); }    /* 0,1,1 ← こちらが勝つ */
```

`.widget p` は**クラス＋要素**なので単一クラスより強く、`color: #fff` を後ろから潰していた。
ブラウザで実測した結果は **コントラスト 2.29:1**（AA は 4.5:1）。

同じ理由で `.post p` が `.pcard__note` `.share__title` `.toc__title` `.dates` `.pr-notice` の
**font-size と margin も全部潰していた**（例: `.pcard__note` は `.76rem` の指定なのに 17px で出ていた）。
`.related__title` に `!important` が付いていたのは、この罠を個別に回避した跡。

対処: `.post p` と `.widget p` を **`:not([class])`** に変えて、本文の段落だけに当てるようにした
（本文は markdown 由来でクラスを持たない）。`.widget__more` は `.widget p` から借りていた値を自前で持たせた。

ブラウザで実測した結果（`styles.css` をキャッシュ回避で読み直して計測）:

| | 修正前 | 修正後 | 指定値 |
|---|---|---|---|
| `.widget__title` のコントラスト | **2.29:1** | **10.50:1** | `#fff` on `--navy` |
| `.pcard__note` | 17px | 12.16px | `.76rem` |
| `.pcard__name` | 17px | 16.32px | `1.02rem` |
| `.share__title` | 17px | 13.12px | `.82rem` |
| `.toc__title` | 17px | 20.48px | `1.28rem` |
| `.dates` | 17px | 12.8px | `.8rem` |
| `.pr-notice` | 17px | 13.12px | `.82rem` |
| 本文の `p` | 17px | 17px（50個） | `1.0625rem` |

375px 幅で `scrollWidth === clientWidth`（375）＝横スクロールなしも確認。本番へデプロイして
`styles.css` に `:not([class])` が出ていることを curl で確認済み（Version ID `c39bb37b-8d21-4a73-bc99-e6fc04cf214b`）。

⚠️ **この罠は CSS を足すたびに再発しうる。** `.<ブロック> <要素>` の形で書くと、
そのブロックの中のクラス付き要素を全部上書きする。機械では止められないので `styles.css` にコメントを残した。

### 7. 3本目の記事を書いた（教育費カテゴリの1本目）

`site/content/articles/kyoikuhi-koukou-mushouka.md`（約16KB）。
**「高校無償化」という名前の制度は存在せず、文科省自身が「的確な表現としては…高等学校等就学支援金です」
と書いている**ところを起点に、授業料（就学支援金）と授業料以外（奨学給付金）の2本立てを原文で並べた記事。

姉妹サイトの territory を避けて教育費を選んだ（`nisa` は NISA、`ikunavi` / `childcare` / `maternity` /
`sickness` は育休・産休・傷病手当をすでに持っている。`my-data/04_projects/domains.md` で確認）。

出典は文科省のページ2枚と**PDF資料2本**。PDF は PyMuPDF で本文を抜いて照合した
（金額は HTML ページに無く、令和8年度の額は予算資料の PDF にしかない）。
⚠️ **文科省のウェブページに出ている奨学給付金の額は令和7年度までのもの**で、記事には令和8年度予算資料の
額を載せ、その旨を本文に明記した。

引用の機械照合: **引用行 41 / 一致 41 / 不一致 0**。

`site.json` に `kyoikuhi`（教育費）を足した。**カテゴリが2つになったので `showCategoryNav` が true になり、
カテゴリページが index 対象になって sitemap も 6URL → 9URL に増えた**（実測）。

記事画像 `koukou-mushouka.png` も同じ手順で作った。執筆中に `assertNoRawEmphasis` が3か所、
`assertEyecatch` は通過（front matter に書いてから画像を作ったため）。

### 8. 画像の数字を1つずつにした（**指摘を受けて修正**）

高校無償化の画像で、1つの箱に **457,200（私立）と 118,800（公立）を上下に並べていた**ため、
どちらが何の数字か画像だけでは分からなかった。**私立の額だけ**にして、凡例の注記を
「数字は私立高校の年額（円）」に変えた。

同じ観点でふるさと納税の画像も見直し、容器の底に置いていた **「2,000」を外した**
（自己負担2,000円の話は本文が持つ。図の底の線に数字を添えただけでは意味が伝わらない）。
注記は「破線＝住民税所得割額の20％の天井」にした。

扶養の壁の画像は1本の壁に数字1つで、凡例（白＝税／青＝社会保険）と単位（万円）が付いているので変更なし。

**画像に数字を置くときの決まり**（`CLAUDE.md` にも書いた）:

- **1つの図形に数字は1つ。** 2つ並べると、画像だけでは何の数字か分からなくなる
- 単位と、何の額なのかは**必ず凡例か注記で示す**。図の中に置いた数字を説明なしにしない

### 9. affi の広告ガードを2つ移植した（**affi リポジトリの削除前**）

`moshimo-affiliate`（affi.nexeed-lab.com・2026-09-01 閉鎖）を消すにあたり、**kakei に無かったガード2つを移した。**
kakei はいま `affiliateEnabled: false` だが、記事が10本たまったら提携申請する前提なので、
**広告を入れた瞬間に無防備になる場所**だった。

あわせて**固定ページの穴を塞いだ。** 記事は常時PR表記を出していたが、`pages/*.md` は
`[[AF:]]` を書いてもPR表記が出ない実装だった（affi では運営者情報に広告リンクを1本置くだけで
無表示の広告ページができていた）。

- `site/build.mjs`: `prNoticeHtml` をモジュール定数へ上げ、固定ページは本文に `[[AF:` があるときだけ出力する。
  記事・固定ページの両方で組み立て後のHTMLを `assertAdDisclosure` に通す
- `site/content/site.json`: `disclosureOnlyPhrases` を追加（原稿側で落とす言い回しの一覧）
- `site/test/guards.test.mjs`: **3ケース追加**（落ちること2つ＋出ること1つ）。
  fixture は `premature-disclosure` / `ad-no-pr-notice` / `page-af-link`
- `docs/moshimo-koshiki-kakunin-2026-08-31.md` を affi から移した
  （もしもアフィリエイトの公式条件を原文で確認した記録。**kakei が ASP に申請するときに効く一次情報**）

**わざと壊して落ちることを確認した**（実際の出力）:

```
$ KAKEI_TEST=1 KAKEI_CONTENT=test/fixtures/premature-disclosure node build.mjs
Error: about.md: affiliateEnabled=false（広告リンク0本）なのに「収入を得ています」と書かれています

$ KAKEI_TEST=1 KAKEI_CONTENT=test/fixtures/ad-no-pr-notice node build.mjs
Error: about.md: 広告リンクがあるのにPR表記がありません（ステマ規制）
```

⚠️ **`assertAdDisclosure` が発火するのは、`links.json` の台帳を迂回して生HTMLで `<a class="buy">` を
直書きした場合だけ。** 正規の `[[AF:]]` 経路ではPR表記が自動で付くので落ちない。**背理法の網であって、
日常的に落ちるガードではない。**


## 検証済みの事実（実際に画面に出した出力）

```
$ cd site && npm run build
built: 3 article(s), 2 page(s), 2 category page(s)
  /kyoikuhi/koukou-mushouka/  「高校無償化」は制度の名前ではない ― 高等学校等就学支援金を文科省の原文で確かめる
  /zeikin/furusato-nozei-jogen/  ふるさと納税の「上限額」は何で決まるのか ― 総務省の計算式を原文で確かめる
  /zeikin/fuyou-no-kabe/  扶養の壁（103万・106万・130万・150万・160万）を公式ページの原文で確かめる

$ cd site && npm test
ℹ tests 32 / ℹ pass 32 / ℹ fail 0
```

3本目のデプロイ後に本番を curl した実際の出力:

```
/kyoikuhi/koukou-mushouka/      200 text/html      30571
/kyoikuhi/                      200 text/html       5756
/zeikin/                        200 text/html       6664
/img/og/koukou-mushouka.png     200 image/png      61830
/sitemap.xml                    200 application/xml  969（9URL）
```

canonical と og:image はどちらも実URLと一致。Version ID `0d1350c8-8195-4b27-bf37-1c06058c1354`。
⚠️ デプロイ直後の1回目の curl は 404 を返した（アセットの伝播待ち）。3回叩き直して 200 を確認している。

ローカルの `dist` を `python -m http.server` で配って、ブラウザで実際に開いて確認した:

- 記事ページに**アイキャッチが表示される**（`naturalWidth/Height` が **1200×630**）
- `seido` カード **4枚**が出典URL・確認日つきで出る
- **375px 幅で `document.body.scrollWidth === document.body.clientWidth`（375）**＝横スクロールなし。
  幅の広い表は `.table-wrap`（`overflow-x: auto`）の中だけでスクロールする
- コンソールのエラーは **Cloudflare Web Analytics の CORS だけ**（localhost から叩いているため。本番では出ない）
- `og:image` が `https://kakei.nexeed-lab.com/img/og/furusato-nozei-jogen.png` になっている

### 本番（2026-09-01 デプロイ後に curl した実際の出力）

```
/                                 200 text/html        5995
/zeikin/furusato-nozei-jogen/     200 text/html       36398
/zeikin/fuyou-no-kabe/            200 text/html       38022
/img/og/furusato-nozei-jogen.png  200 image/png       58523
/img/og/fuyou-no-kabe.png         200 image/png       48593
/sitemap.xml                      200 application/xml   679
```

- 記事の canonical は `https://kakei.nexeed-lab.com/zeikin/furusato-nozei-jogen/`、
  og:image は同じホストの `/img/og/furusato-nozei-jogen.png`（**どちらも実URLと一致**）
- `sitemap.xml` は **6URL**（トップ・記事2本・about・privacy・sitemap）。カテゴリページは載っていない
- 画像を紺に直したあと**もう一度デプロイして取り直した**。本番の3枚とも 200 / `image/png`
  （`site.png` 38,079 / `fuyou-no-kabe.png` 49,441 / `furusato-nozei-jogen.png` 59,365 バイト＝手元と同じ）。
  `favicon.svg` も 200 で、中身が `fill="#014172"` になっていることを確認した
- デプロイ: Version ID `b41c0609-9f1b-4902-b265-65c31a10971c`（色を直したあとの版）

**ビルドガードが実際に落ちたことも確認した。** 執筆中に `assertNoRawEmphasis` が
「`**…です。**` の閉じの `**` が句点の直後」を4か所で検出してビルドを止めた。直して通した。

## 未検証（確かめていない。確かめたように書かないこと）

- **`article-images.pptx` を PowerPoint で開いていない。** SVG が入っていることは zip を開いて確認したが、
  **PowerPoint が実際にベクタとして表示・編集できるかは未確認**。LibreOffice 経由の PDF 書き出しは通っている
- **インデックスされたかどうか。** 1本目も 2026-09-01 時点で「検出 - インデックス未登録」
- **アクセスの実数。** ビーコンは飛んでいるが、ダッシュボードの数字は見ていない
- **記事を増やせば順位が付く、という前提。** 姉妹サイト `ikunavi` では育休・産休系クエリ約30件が
  すべて83〜105位でクリック0（本文量が原因と診断）。**裏付けは無い**
- 金融ASP案件が実在するか・提携できるか（`links.json` にコメントで明記済み）
- 記事本文で「未確認」と明示したもの:
  - 1本目: 住民税の壁の金額／令和8年分のパート収入の非課税ライン／特定扶養親族の年齢範囲／
    19〜23歳の被扶養者150万円の根拠省令・通知名／賃金要件が撤廃される正確な日
  - 4本目（大学無償化）: 2つの文科省資料で年収の目安が違う理由／多子世帯の減免上限額が
    住民税非課税世帯の上限額と同じか（リーフレットの当該表が画像で本文取得できない）／
    令和8年度に上限額そのものが改定されたか（大学の額は2資料で一致）／収入の基準の計算方法
  - 2本目: 年収別の控除上限額の目安表／住民税所得割額と人的控除差調整額の求め方／
    返礼品の調達費用割合とポイント付与の規制（告示の原文を取得していない）／
    ワンストップ特例の**申請書そのもの**の提出期限（引いたのは変更届出書の1月10日）

## ⚠️ 2026-10-01 に1本目のビルドが落ちる（意図した挙動）

`zeikin-fuyou-no-kabe.md` の `revisionAt` は **2026-10-01**。厚労省の適用拡大特設サイトが
「2026年10月に賃金要件を撤廃予定」と書いているためで、その日が来ると `assertNotExpired` が止める。

**対処は「出典を取得し直して本文を確認し、`checkedAt` と `revisionAt` を両方更新する」。
`revisionAt` だけを先に進めない。**

なお賃金要件の撤廃時期は厚労省の**2か所で書きぶりが違う**（特設サイトは「2026年10月に撤廃予定」、
政策ページは「公布から3年以内で、全国の最低賃金が1,016円以上となることを見極めて判断」）。
記事は片方を選ばず両方そのまま並べてある。

2本目（ふるさと納税）は `revisionAt` を**書いていない**。改定日が公表されていないため（任意項目）。

## 引用を照合する方法（今回やったやり方）

1. 出典ページを `curl` で取得する。**総務省は Shift_JIS**（`cp932`）、国税庁は UTF-8
2. `<img>` の `alt` を本文に差し込んでからタグを落とす。
   **総務省の「税金の控除について」は式の番号 `(1)(2)(3)(3)'` が画像**なので、これをやらないと引用が欠ける
3. 記事の `> ` 行を取り出し、**空白をすべて除いてから**原文テキストに部分一致するか見る
4. 1本でも不一致が出たら、原文を読み直して記事のほうを直す。**原文に合わせる。逆はしない**

## 検証コマンド

```bash
cd site && npm run build   # 本番の content でビルド
cd site && npm test        # ガードの回帰テスト（test/guards.test.mjs）
```

**`build.mjs` を触ったら必ず両方を走らせる。** ガードは「落ちるべきものが落ちること」で
初めて意味を持つので、ビルドが通っただけでは検証にならない。

## ビルドガードの一覧（何を落とすか）

すべて `site/build.mjs`。回帰テストは `site/test/guards.test.mjs`（32ケース）。

| ガード | 落とすもの |
|---|---|
| 環境変数ガード（ファイル先頭） | `KAKEI_TODAY` / `KAKEI_CONTENT` / `KAKEI_DIST` が `KAKEI_TEST=1` 無しで設定されている状態でのビルド。**`KAKEI_DIST` が残ったまま `npm run deploy` すると、ビルドは別ディレクトリへ書き、wrangler は古い `dist/` をデプロイする**（`assets.directory` は `./dist` 固定）。両方成功して誰も気づかない |
| `KAKEI_TODAY` の書式 | 実在しない日付（`2026-13-40` など） |
| `readDocs` の必須キー | front matter に `title` / `description` / `slug` / `published` / `updated` / `category` / `sources` / `checkedAt` のどれかが無い |
| `assertNoEmptyCategories` | `site.json` に記事が0本のカテゴリが残っている |
| 未定義カテゴリ検査 | 記事の `category` が `site.json` の `categories` に無い |
| `assertSources` | `sources` が空 ／ `https://` で始まらない URL がある ／ `checkedAt` が実在しない日付 ／ `checkedAt` がビルド日より未来 |
| `assertNotExpired` | `revisionAt` を**書いてある**記事が、その日以降。キーごと書いていない記事は許す |
| `assertCardNumbers` | `seido` カードの数値トークンが、同じ記事の表の行に無い |
| `assertEyecatch` | 記事に `eyecatch` が無い ／ 指した画像が `site/public/` に無い ／ og:image になる画像が PNG でない。**記事画像の作り忘れとパスの打ち間違いを止める** |
| `renderSeidoCards` | `seido` に `制度` が無い ／ `根拠` が `https://` で始まらない ／ `確認日` が実在しない日付 ／ 数字が1つも無い |
| `assertNoRawEmphasis` | 解釈されずに残った `**`（日本語の約物と CommonMark の flanking ルール） |
| `resolveLinks` | `content/links.json` に無い `[[AF:キー]]` |
| `assertAdDisclosure` | 出力HTMLに `class="buy"` があるのに `pr-notice` が無い（ステマ規制）。**links.json を迂回して生HTMLで広告リンクを直書きした場合の経路** |
| `assertAnalyticsClaims` | `webAnalyticsToken` が入っているのに原稿が「アクセス解析は導入していません」と書いている（逆も）。**2026-09-01 のレビューで実際に起きていた。affi でも同じ誤りが起きている** |
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

## 次にやること

1. **Search Console のインデックス登録リクエスト**（上の★。本人のダッシュボード操作）
2. **5本目の記事。**`zeikin` を厚くするか、3つ目のカテゴリ `shisan` の1本目を書くかを決める。
   ⚠️ **`shisan` は姉妹サイト `nisa` が NISA を持っている。**territory が重ならない題材にすること
3. 記事が10本たまったら ASP の提携申請（`CLAUDE.md` の方針）

⚠️ **2026-10-01 に1本目のビルドが落ちる**（下の節）。記事を増やす前でも後でも、その日までに対応が要る。

## 触ってはいけないところ

- **`source-verifier` に `Edit` / `Write` を足さない。** 外してあるのが設計の要点
- **エージェントを本数だけ増やさない。** 2本で始めて、実測で効果が示されたときだけ足す
- **ASPが発行していないURLをリンクにしない。** URLの形を推測して組み立てない
- **`affiliateEnabled` を、リンクが0本のまま `true` にしない**
- **他人のまとめ記事を根拠にしない。** それらが食い違っているから、このサイトを作っている
- **記事が0本のカテゴリを `site.json` に置かない**
- `assertCardNumbers` と `assertNoRawEmphasis` のガードを外さない。`assertAdDisclosure` と `assertNoPrematureDisclosure`（affi から移植した広告まわり）も同じ
- `site.json` の `origin` と `wrangler.jsonc` の `routes` は**必ず同じ値**にする
- **記事画像の PNG を手で描き換えない。** 正は `tools/article-images/`（SVG と .pptx）。
  PNG は `build.py` の出力
- **画像の色を `styles.css` と別々に決めない。** 画面と画像で色が食い違った実例があるので、
  色を変えるときは `--navy` / `--link` / `--warn-line` と `build.py` の定数を必ず一緒に動かす

## 据え置きにした軽微な指摘（直していない）

- fixture の `articles/` `pages/` が空ディレクトリだと git に載らない
- `assertSources` の URL 検査が `startsWith('https://')` だけ（ドメインを見ていない）
- 正常系テストが `<aside class="pcard">` タグとエスケープを検証していない
- `site.json` の `origin` と `wrangler.jsonc` の `routes` の一致を機械が見ていない
- `npm test` は `node --test "test/**/*.test.mjs"`。**`node --test test/` はこの環境で落ちる**
  （`MODULE_NOT_FOUND`。Node v24.1.0 / Windows 11）。根本原因は未特定
