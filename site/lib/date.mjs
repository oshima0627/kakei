// build.mjs から切り出した純関数。build.mjs はトップレベルでビルドを実行するスクリプトなので、
// テストから import すると本体のビルドまで走ってしまう。日付計算だけをここに置き、
// build.mjs とテストの両方から安全に呼べるようにする。

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * エポックミリ秒（`ms`）を JST（UTC+9）の `YYYY-MM-DD` にする。
 *
 * `Date.prototype.toISOString()` は UTC の日付を返す。JST は UTC+9 なので、
 * それをそのまま使うと日本時間 00:00〜09:00 に実行したときだけ日付が前日になる。
 * `revisionAt <= BUILD_DATE` で期限切れを判定するガードにとっては、
 * 「改定日当日の朝9時前にビルドすると期限切れの記事が素通りする」窓になるため、
 * JST を明示的に足してから日付を切り出す。
 */
export function toJstDateString(ms) {
  return new Date(ms + JST_OFFSET_MS).toISOString().slice(0, 10);
}
