# HANDOFF

最終更新: **2026-09-16**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況

**公開済み。記事は手元17本（本番は push 後に17本になる想定）。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | **`main` への push で自動**（Cloudflare Workers Builds） |
| 記事 | 手元 **17本**（下の表） |
| カテゴリ | **5つ**（`zeikin` 6本 ／ `kyoikuhi` 5本 ／ `nenkin` 2本 ／ `shisan` 2本 ／ `sozoku` 2本） |
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
| `shisan/ideco-jougen` | iDeCoの掛金上限が2026年12月1日から変わる | **2026-12-01** ⚠️ |
| `nenkin/kuriage-kurisage` | 繰上げは取り消せず、繰下げでも増えない部分がある | なし |
| `shisan/taishoku-shotoku` | 退職所得控除は勤続20年で1年40万円→70万円 | なし |
| `sozoku/shoukibo-takuchi` | 330㎡・80％減は誰が相続しても使えるわけではない | なし |

## いま入れたもの（2026-09-16）

`zeikin/furusato-onestop` を新規追加。既存の `furusato-nozei-jogen` にあるワンストップ節の深掘り。

- 出典: 総務省（控除／流れ／制度改正2015-04-01／FAQ／概要）＋国税庁 No.1155 ＋申告特例申請書PDF
- 引用照合: `verify-quotes.py` で 21/21 一致
- 画像: `tools/article-images/svg/furusato-onestop.svg` ＋ `site/public/img/og/furusato-onestop.png`（1200×630）。Linux 上で `build.py` の1枚だけ書き出し（既存PNGは触っていない）。`article-images.pptx` への全スライド再生成は未実施（Windows＋Yu Gothic 想定の本番ビルドとはフォントが違うため）
- `build.py` に Linux 用 `soffice` フォールバックと `Noto Sans CJK JP` 切替を足した

### 検証

```
cd site && npm run build → built: 17 article(s), …
node --test test/guards.test.mjs → 38 pass / 0 fail
（`npm test` の glob は Node v20 だと展開されず失敗。Node >=22 か上記の直接指定で通る）
python tools/verify-quotes.py zeikin-furusato-onestop.md → 21/21
```

### 未確認（記事本文にも書いた）

- ワンストップ**申請書本体**の提出期限（変更届出書の翌年1月10日は確認済み）
- 自治体ごとの申請書様式・本人確認書類
