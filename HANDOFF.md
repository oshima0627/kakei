# HANDOFF

最終更新: **2026-10-28**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況

**公開済み。記事は 23 本。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | **`main` への push で自動**（Cloudflare Workers Builds）。約1〜2分 |
| 記事 | **23 本**（`zeikin` 8 ／ `kyoikuhi` 5 ／ `nenkin` 4 ／ `shisan` 4 ／ `sozoku` 2） |
| 広告 | `affiliateEnabled` は `true`。もしも（media 687816）で発行した11本が `links.json` にある。寸法帳(689246)・ドッグフード(7748)・Amazon(170)は使わない |
| 計測 | Cloudflare Web Analytics 稼働中 |

## 2026-10-28 に入れたもの

- 新記事: `zeikin/furusato-kakutei-shinkoku`、`shisan/ideco-nenmatsu-chosei`（どちらも写真アイキャッチ）。
- 改稿（URL・title・slug は据え置き）:
  - `shisan/ideco-jougen`: **第3号被保険者の12月以降の上限は引き上げなしで23,000円**（以前の記事は62,000円と誤記していた。訂正済み）。
  - `shisan/taishoku-shotoku`: 引用の不一致を解消。iDeCo一時金と退職金を別の年に受け取る場合の重複期間（4年／9年／19年）を追加。
  - `zeikin/jutaku-loan-koujo`: 国税庁No.1211-1が令和8年4月1日現在に更新されたので、出典と文面を差し替え。
  - `kyoikuhi/koukou-mushouka`: 404だった出典を文科省の現行ページ・PDFに差し替え。奨学給付金の令和8年度給付額を作り直し。
- 本文の内部リンクを追加（被リンク0の5記事と新2記事へ）。広告ゼロだった3記事（学生納付特例・寡婦年金・繰上げ繰下げ）に本文広告を1本ずつ。
- 実施内容・GSC基準値・今後4週の記事計画・外部リンク文面案（未公開）は `/workspace/kakei-research/growth-actions-2026-10-28.md`（リポジトリ外）。

## 守ること（要点。詳細は CLAUDE.md）

- **title の変更は 2026-11-10 まで凍結**（commit 80ee5a7）。description も事実の誤りが無い限り変えない。新記事の title/description は自由。
- 数字・日付・条件は一次資料（国税庁・厚労省・総務省・文科省・国交省・財務省・iDeCo公式など）を取得し直して確認する。引用は `tools/verify-quotes.py` と一致させる。
- FP相談リンク（fp-madoguchi・hoken-total-pro）は **遺族年金と退職所得の2記事のみ**。「相談窓口の例」と書き、比較・おすすめにしない。
- 本文の改行は句点（。！？）の直後だけ。読点では切らない。`breakJapaneseSentences` が自動で `<br>` にする。
- 広告は ASP 発行のものだけ。1記事 4〜5本が目安。h1より上には出さない。レールは縦長のみ。

## 公開前の確認

```
cd site && node --test test/guards.test.mjs    # 41 pass（`npm test` は node20 で glob が展開されず失敗する）
node build.mjs
cd .. && python3 tools/verify-quotes.py <ファイル名>.md   # 例: zeikin-jutaku-loan-koujo.md
git checkout tools/__pycache__                  # verify-quotes が pyc を書き換えるため、commit に入れない
git push origin main
```

- `revisionAt` は **ビルド日より後**でないとビルドが落ちる（落ちると本番デプロイが止まる）。直近の期日は下の表。
- 環境によっては `git push` の認証ヘルパー（`/usr/bin/gh`）が無い。その場合は `git -c credential.helper='!/home/box/.local/bin/gh auth git-credential' push origin main` を指定する。コミットの author が未設定なら `-c user.name=oshima0627 -c user.email=oshima0627@users.noreply.github.com` を付ける。

### revisionAt が近い記事

| slug | revisionAt |
|---|---|
| `shisan/ideco-jougen`、`shisan/ideco-kaisei-tetsuzuki`、`shisan/ideco-nenmatsu-chosei` | **2026-12-01**（iDeCo上限改正の施行日） |
| `shisan/taishoku-shotoku`、`zeikin/fuyou-no-kabe`、`zeikin/iryouhi-koujo` | 2027-01-01 |
| `zeikin/furusato-kakutei-shinkoku` | 2027-02-01 |
| ほか | 2027-04-01 以降 |

## 既存の照合不一致（今回の変更とは無関係・要保守）

- `zeikin/iryouhi-koujo`: 引用3行不一致（セルフメディケーション税制の文2行・医療費控除の明細書の文1行。国税庁側の文言変更と思われる）
- `kyoikuhi/daigaku-mushouka`: 引用5行不一致

## 次にやること

- 公開・大幅更新した URL は Search Console の URL 検査でインデックス登録をリクエストする（新2本＋改稿4本）。
- 4週間後（目安 2026-11-25）に GSC を同じ窓で取り直し、基準値と比べる。
- 記事計画（相続・教育費の8本）は上記 growth-actions に候補と一次資料URLがある。着手前に一次資料を取得し直す。
- `revisionAt` 接近: iDeCo 3本（2026-12-01）。施行後に実際の運用を一次資料で確認して更新する。
- 楽天ふるさと納税の「どこでもリンク」は、もしも管理画面で発行されたタグが手元に無いため未登録。
