# HANDOFF

最終更新: **2026-10-06**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## いま入っているもの（2026-10-06・集客/収益の確認不要分）

- ふるさと上限の title/description を「早見表はない」系の否定形から変更（本文の主張・数字は変更なし）。
  title「ふるさと納税の限度額早見表｜上限を決める総務省の3本の式と確かめ先」。updated 2026-10-06。
- 本文内部リンクが0本だった13記事に1〜2本ずつ追加（実在URLのみ）。
- BreadcrumbList JSON-LD を記事・カテゴリに追加（`breadcrumbLd()`。見た目の `crumbs()` と同じ items）。JSON-LD は配列で出る。
- 広告方針: FP相談（fp-madoguchi / hoken-total-pro）は **遺族年金・退職所得の2記事のみ**。
  - `defaultAfBodyPool`: 教育費＝ガーデン学資のみ、iDeCo＝ファイナンシャルアカデミー＋MF、寡婦年金・学生納付特例・繰上げ繰下げ＝本文バナーなし（合う既存案件なし。左右レールは従来どおり弥生/MF）。
  - 寡婦年金の本文末「相談窓口の例」節と FP マーカーを削除。
  - `insertAdsBetweenH2s`: 直前の広告と同じキーは続けて出さない（1キーのプールで同じバナーが全H2間に並ぶのを防止）。教育費記事は上部の1枚だけになる。
- 新マーカー `[[AFHere:キー]]`（段落単独）: その位置に本文バナーを1枚。直後のH2間自動挿入は飛ばす。ふるさと上限の「総務省は金額で答えていない」節の直後に furusato-nippon を配置。
- 句点のあとで改行して書いた原稿（1文1行）が画面上つながっていたのを修正（`breakJapaneseSentences` が `。\n` も `<br>` にする）。
- テスト追加: AFHere 未登録キーで落ちる／BreadcrumbList が出る（`node --test test/guards.test.mjs` 40 pass）。
  ※ `npm test` は node20 で glob が展開されず失敗する。`node --test test/guards.test.mjs` を使う。

### 既存の照合不一致（今回の変更とは無関係・要保守）
- `kyoikuhi/koukou-mushouka`: 出典 mext 1342674.htm / 1344089.htm が 404（verify-quotes が例外で止まる）
- `shisan/taishoku-shotoku`: 引用1行不一致（国税庁「原則として確定申告は必要ありません」の文）
- `zeikin/jutaku-loan-koujo`: 引用3行不一致（タックスアンサー側の更新と思われる）

### 未実施
- 楽天ふるさと納税の「どこでもリンク」: もしも管理画面で発行されたタグが手元に無いため未登録
- GSC 日別推移・再クロール依頼（boxブラウザ作業）


## いま入っているもの（2026-10-06・扶養の壁を公式最新に書き直し）

- `zeikin/fuyou-no-kabe` を国税庁・厚労省・年金機構の最新公式に合わせて書き直し。
  - 本人所得税: 令和7年分=160万円、令和8年分から=178万円（No.1800）。103万円は令和6年分まで。
  - 配偶者・特定親族: 令和8年分は合計所得62万円起点（給与換算136万・197万）。
  - 106万の壁: 賃金要件は令和8年10月1日撤廃（制度変更ページ）。特設サイトはなお「撤廃予定」。減額特例を追記。seido から月額8.8万要件を外した。
  - `checkedAt: 2026-10-06` / `revisionAt: 2027-01-01`
- これにより revisionAt 超過で止まっていた本番ビルドが復旧。広告改善（bb72c00・見出し直下の横長バナー）も本 push で公開される。

## 現在の状況

**公開済み。記事は手元19本。制度ログのキューは空。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | **`main` への push で自動**（Cloudflare Workers Builds） |
| 記事 | 手元 **19本** |
| カテゴリ | **5つ**（`zeikin` 6本 ／ `kyoikuhi` 5本 ／ `nenkin` 4本 ／ `shisan` 2本 ／ `sozoku` 2本） |
| 広告リンク | `affiliateEnabled` は `true`。もしもで発行した8本が `links.json` にある |
| 計測 | Cloudflare Web Analytics 稼働中 |

### revisionAt が近い記事

| slug | revisionAt |
|---|---|
| `shisan/ideco-jougen` | **2026-12-01** |
| `zeikin/fuyou-no-kabe` | 2027-01-01 |
| ほか | 2027-04-01 以降 |

## 次にやること

- 制度ログの記事キューは空。次の題材は未定
- `revisionAt` 接近: `ideco-jougen`（2026-12-01）
- 公開・大幅更新後は Search Console で URL 検査→インデックス登録リクエスト（boxブラウザ）
