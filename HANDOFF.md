# HANDOFF

最終更新: **2026-09-16**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況

**公開済み。記事は手元19本（本番は push 後に19本になる想定）。制度ログのキューは空。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | **`main` への push で自動**（Cloudflare Workers Builds） |
| 記事 | 手元 **19本**（下の表） |
| カテゴリ | **5つ**（`zeikin` 6本 ／ `kyoikuhi` 5本 ／ `nenkin` 4本 ／ `shisan` 2本 ／ `sozoku` 2本） |
| 広告リンク | `affiliateEnabled` は `true`。もしもで発行した8本が `links.json` にある |
| 計測 | Cloudflare Web Analytics 稼働中 |

### 記事一覧

| slug | 記事の芯 | revisionAt |
|---|---|---|
| `zeikin/fuyou-no-kabe` | 103・106・130・150・160 は何の壁か | **2026-10-01** ⚠️ |
| `zeikin/furusato-nozei-jogen` | 上限額を決めているのは総務省の3本の計算式 | なし |
| `zeikin/furusato-onestop` | ワンストップの対象者・5団体・全額住民税・確定申告で無効・変更届1/10 | なし |
| `zeikin/kougaku-ryouyouhi` | 2026年8月から年単位の上限額が入った | なし |
| `zeikin/iryouhi-koujo` | 適用下限額は10万円とは限らない | なし |
| `zeikin/jutaku-loan-koujo` | 「年末残高の0.7％」だけでは決まらない | 2027-04-01 |
| `kyoikuhi/koukou-mushouka` | 「高校無償化」は制度の名前ではない | なし |
| `kyoikuhi/daigaku-mushouka` | 無償化されたのは授業料等減免だけ | なし |
| `kyoikuhi/jidouteate` | 3人いても「第3子」とは限らない | なし |
| `kyoikuhi/shogakukin-henkan` | 減額返還も猶予も返す総額が減らない | 2027-04-01 |
| `kyoikuhi/hoiku-mushouka` | 無料になるのは利用料だけ | なし |
| `sozoku/seimeihoken-hikazei` | 受取人が相続人でないと非課税枠を使えない | なし |
| `nenkin/izoku-nenkin` | 遺族基礎年金は子がいないと出ない | 2027-04-01 |
| `nenkin/kafu-nenkin` | 寡婦年金と死亡一時金は第1号独自給付。併給不可・選択 | **2028-04-01** |
| `nenkin/gakusei-nofu-tokurei` | 学生納付特例は資格期間に入り年金額に入らない。免除とは別制度 | なし |
| `shisan/ideco-jougen` | iDeCoの掛金上限が2026年12月1日から変わる | **2026-12-01** ⚠️ |
| `nenkin/kuriage-kurisage` | 繰上げは取り消せず、繰下げでも増えない部分がある | なし |
| `shisan/taishoku-shotoku` | 退職所得控除は勤続20年で1年40万円→70万円 | なし |
| `sozoku/shoukibo-takuchi` | 330㎡・80％減は誰が相続しても使えるわけではない | なし |

## いま入れたもの（2026-09-16・OG再設計）

SERPサムネ（約160–300px）で読めるよう、次の5枚の eyecatch/OG を再設計して `main` に反映。

| slug | 変更の要点 |
|---|---|
| `zeikin/fuyou-no-kabe` | 巨大数字壁（103/106/130/150/160）。棒下の詳細ラベルと凡例を削除。タイトル「年収の壁」＋「税と社保を分けて確認」。白＝税／青＝社保 |
| `zeikin/furusato-nozei-jogen` | 1本スタック＋黄の天井。(1)(2)(3)のみ大きく。脚注削除。タイトル「控除上限は3本の式」 |
| `zeikin/furusato-onestop` | 申告 vs ワンストップの二択。黄×バッジ1つ。5団体チップ。タイトル「ワンストップ特例」＋「申告すると無効」 |
| `nenkin/gakusei-nofu-tokurei` | 資格期間○／年金額×の2結論を拡大。微細凡例・3行比較を削除 |
| `nenkin/kafu-nenkin` | OR二択を拡大（寡婦年金 vs 死亡一時金）。上段空枠・細注を削除 |

実装: `tools/article-images/svg/*.svg` と `build.py` の `SLIDES` を更新。`build.py --only ...` で当該5枚だけ再書き出し（他PNG・`article-images.pptx` は未更新）。各記事の `eyecatchAlt` も新図に合わせて更新。160/300pxプレビューは `/workspace/kakei-img-research/out/`。

---

## いま入れたもの（2026-09-16）

`nenkin/gakusei-nofu-tokurei` を新規追加。キュー最後の1本。カテゴリは `nenkin`（機構の国民年金制度）。

- 出典: 日本年金機構（学生納付特例本体／学生向け案内／ケース12／追納／免除・納付猶予／申請可能期間／令和8年度版リーフレットPDF／追納FAQ）
- 引用照合: `verify-quotes.py` で 38/38 一致
- 画像: `tools/article-images/svg/gakusei-nofu-tokurei.svg` ＋ `site/public/img/og/gakusei-nofu-tokurei.png`（1200×630）。Linux 上で1枚だけ書き出し（既存PNGは触っていない）。`build.py` の `SLIDES` には追加済み（フル再生成は未実施）
- AF: なし（学生・国民年金の橋が弱く、`links.json` に合う案件なし）
- 内部リンク: `/nenkin/izoku-nenkin/`、`/nenkin/kafu-nenkin/`

### 検証

```
cd site && npm run build → built: 19 article(s), …
node --test test/guards.test.mjs → 38 pass / 0 fail
python tools/verify-quotes.py nenkin-gakusei-nofu-tokurei.md → 38/38
```

### 未確認（記事本文にも書いた）

- 所得基準の「社会保険料控除等」の項目一覧
- 対象校一覧の個別校・課程の掲載可否
- 令和8年度追納月額表の学生納付特例分だけの切り出し・検算
- マイナポータル電子申請の操作手順・アップロード形式の細部
- 退職（失業）を理由とする申請と特例免除の条文対応
- 追納後の個人シミュレーション（公式は約2万円／年の目安まで）

## 次にやること

- 制度ログの記事キューは空。次の題材は未定
- `revisionAt` 接近: `fuyou-no-kabe`（2026-10-01）、`ideco-jougen`（2026-12-01）
