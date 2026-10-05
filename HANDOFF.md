# HANDOFF

最終更新: **2026-10-06**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

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
