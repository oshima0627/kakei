# HANDOFF

最終更新: **2026-09-16**

**このファイルだけ読めば再開できる**状態を保つこと。古くなった記述は消して書き直す。履歴は git log にある。

---

## 現在の状況

**公開済み。記事は手元18本（本番は push 後に18本になる想定）。**

| | |
|---|---|
| サイト名 | 家計の制度ログ |
| 公開URL | **https://kakei.nexeed-lab.com/** |
| リポジトリ | github.com/oshima0627/kakei（private）。`main` が本番 |
| デプロイ | **`main` への push で自動**（Cloudflare Workers Builds） |
| 記事 | 手元 **18本**（下の表） |
| カテゴリ | **5つ**（`zeikin` 6本 ／ `kyoikuhi` 5本 ／ `nenkin` 3本 ／ `shisan` 2本 ／ `sozoku` 2本） |
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
| `shisan/ideco-jougen` | iDeCoの掛金上限が2026年12月1日から変わる | **2026-12-01** ⚠️ |
| `nenkin/kuriage-kurisage` | 繰上げは取り消せず、繰下げでも増えない部分がある | なし |
| `shisan/taishoku-shotoku` | 退職所得控除は勤続20年で1年40万円→70万円 | なし |
| `sozoku/shoukibo-takuchi` | 330㎡・80％減は誰が相続しても使えるわけではない | なし |

## いま入れたもの（2026-09-16）

`nenkin/kafu-nenkin` を新規追加。`izoku-nenkin` の未確認にあった「寡婦年金・死亡一時金」の深掘り。1本に両方。

- 出典: 日本年金機構（独自給付概要／寡婦年金／死亡一時金／手続2本）＋遺族年金ガイドPDF（令和8年度版）＋e-Gov 国民年金法
- 引用照合: `verify-quotes.py` で 22/22 一致
- 画像: `tools/article-images/svg/kafu-nenkin.svg` ＋ `site/public/img/og/kafu-nenkin.png`（1200×630）。Linux 上で `build.py` を1枚だけ書き出し（既存PNGは触っていない）
- AF: なし（橋が弱く、`fp-madoguchi` / `hoken-total-pro` は izoku 側に既出）
- 内部リンク: `/nenkin/izoku-nenkin/`

### 検証

```
cd site && npm run build → built: 18 article(s), …
node --test test/guards.test.mjs → 38 pass / 0 fail
python tools/verify-quotes.py nenkin-kafu-nenkin.md → 22/22
```

### 未確認（記事本文にも書いた）

- 寡婦年金の請求時効5年を、機構の寡婦年金ページがどう書いているか（法102条1項は確認）
- 寡婦年金と遺族基礎年金の併給可否の、機構による一文
- 寡婦年金額の円額早見表（4分の3の式のみ）
- 生計維持・生計同一の収入基準の詳細
- 令和10年4月以後の子と父または母がいる場合の死亡一時金運用細部
