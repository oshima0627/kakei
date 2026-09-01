import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { toJstDateString } from '../lib/date.mjs';

const SITE = path.resolve(import.meta.dirname, '..');

/**
 * fixture の content ディレクトリを使って build.mjs を1回走らせる。
 *
 * KAKEI_TEST=1 が要る。これが無いと build.mjs は KAKEI_CONTENT / KAKEI_DIST /
 * KAKEI_TODAY を見つけた時点で落ちる（本番のビルド・デプロイで残っていると、
 * 古い dist/ がそのままデプロイされるため）。
 */
export function runBuild(fixture, env = {}) {
  const content = path.join(SITE, 'test/fixtures', fixture);
  const dist = path.join(SITE, 'test/.out', fixture);
  fs.rmSync(dist, { recursive: true, force: true });
  const r = spawnSync(process.execPath, [path.join(SITE, 'build.mjs')], {
    cwd: SITE,
    encoding: 'utf8',
    env: { ...process.env, KAKEI_TEST: '1', KAKEI_CONTENT: content, KAKEI_DIST: dist, ...env },
  });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

/** KAKEI_TEST を渡さずに build.mjs を走らせる（環境変数ガードそのものの検査用）。 */
function runBuildWithoutTestMode(env) {
  const e = { ...process.env, ...env };
  delete e.KAKEI_TEST;
  const r = spawnSync(process.execPath, [path.join(SITE, 'build.mjs')], {
    cwd: SITE,
    encoding: 'utf8',
    env: e,
  });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

test('記事が0本のカテゴリが site.json にあるとビルドが落ちる', () => {
  const r = runBuild('empty-category');
  assert.notEqual(r.code, 0, 'ビルドは失敗しなければならない');
  assert.match(r.stderr, /記事が0本のカテゴリ/);
  assert.match(r.stderr, /zeikin/);
});

test('記事に sources が無いとビルドが落ちる', () => {
  const r = runBuild('no-sources');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /sources がありません/);
});

test('sources が https のURLでないとビルドが落ちる', () => {
  const r = runBuild('bad-source-url');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /https:\/\/ で始まるURL/);
});

test('記事に eyecatch が無いとビルドが落ちる（記事画像の作り忘れ）', () => {
  const r = runBuild('no-eyecatch');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /eyecatch がありません/);
});

test('eyecatch の画像が public に無いとビルドが落ちる（パスの打ち間違い・作り忘れ）', () => {
  const r = runBuild('eyecatch-missing-file');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /public にありません/);
  assert.match(r.stderr, /dare-mo-tsukutte-inai\.png/);
});

test('og:image になる画像が PNG でないとビルドが落ちる（SNSのカードは SVG を受け付けない）', () => {
  const r = runBuild('eyecatch-not-png');
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /PNG ではありません/);
});

test('revisionAt を過ぎているとビルドが落ちる', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2027-01-02' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /revisionAt/);
  assert.match(r.stderr, /2027-01-01/);
});

test('revisionAt が改定日ちょうど（当日）でもビルドが落ちる', () => {
  // このガードの意味は `revisionAt <= BUILD_DATE` の `<=` 1文字に乗っている。
  // R5 でこの境界が一度壊れた実績があるので、境界そのものを固定する。
  const r = runBuild('expired', { KAKEI_TODAY: '2027-01-01' });
  assert.notEqual(r.code, 0, '改定日当日は「もう改定された」側として落とす');
  assert.match(r.stderr, /revisionAt/);
  assert.match(r.stderr, /2027-01-01/);
});

test('revisionAt がまだ先ならビルドは通る', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2026-12-31' });
  assert.equal(r.code, 0, r.stderr);
});

test('checkedAt が古い記事は警告が出るが、ビルドは通る', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2026-12-31' });
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stderr + r.stdout, /最終確認から/);
});

test('BUILD_DATE の既定値はUTCではなくJSTで日付を決める（UTCでは前日、JSTでは当日の時刻）', () => {
  // 2026-08-31T23:30:00Z は JST では 2026-09-01T08:30:00（+9時間）。
  // toISOString() をそのまま使う実装だと、ここが 2026-08-31 のままになる
  // （＝日本時間の朝、期限切れガードが素通りするバグの再現ケース）。
  const ms = Date.parse('2026-08-31T23:30:00Z');
  assert.equal(toJstDateString(ms), '2026-09-01');
});

test('BUILD_DATE の既定値はUTCとJSTが同じ日になる時刻でも正しい', () => {
  // 2026-09-01T05:00:00Z は JST では 2026-09-01T14:00:00。UTC の日付も 2026-09-01 で一致する。
  const ms = Date.parse('2026-09-01T05:00:00Z');
  assert.equal(toJstDateString(ms), '2026-09-01');
});

test('seido カードの数字が表と食い違うとビルドが落ちる', () => {
  const r = runBuild('seido-mismatch', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /カードの数字が表にありません/);
});

test('seido フェンスに 制度 が無いとビルドが落ちる', () => {
  const r = runBuild('seido-missing-name', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /seido に 制度 がありません/);
});

test('seido フェンスの 根拠 が https で始まらないとビルドが落ちる', () => {
  const r = runBuild('seido-bad-source', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /seido の 根拠 は https:\/\/ で始まる公式ページのURLにします/);
});

test('seido フェンスの 確認日 が YYYY-MM-DD でないとビルドが落ちる', () => {
  const r = runBuild('seido-bad-date', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /seido の 確認日 は実在する日付を YYYY-MM-DD で書きます/);
});

test('正しい seido フェンスは、出典URL・確認日・制度名・数字を含むカードとして出力される', () => {
  const r = runBuild('seido-ok', { KAKEI_TODAY: '2026-09-01' });
  assert.equal(r.code, 0, r.stderr);
  const html = fs.readFileSync(
    path.join(SITE, 'test/.out/seido-ok/zeikin/seido-ok/index.html'),
    'utf8',
  );
  assert.match(html, /<a href="https:\/\/www\.nta\.go\.jp\/example"[^>]*>https:\/\/www\.nta\.go\.jp\/example<\/a>/);
  assert.match(html, /2026-09-01 確認/);
  assert.match(html, /基礎控除の壁/);
  assert.match(html, /123万円/);
});

test('カードの数字が桁落ちしていてもビルドが落ちる（123万円 の表に 12万円 のカード）', () => {
  // 文字列の部分一致で突き合わせていたときは、これが通ってしまっていた。
  // 桁落ち・桁増しは制度記事でいちばん起きやすい転記ミスで、このガードの主戦場。
  const r = runBuild('seido-digit-drop', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /カードの数字が表にありません/);
  assert.match(r.stderr, /12万円/);
});

test('checkedAt が実在しない日付だとビルドが落ちる', () => {
  const r = runBuild('checked-bad-date', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /checkedAt は実在する日付を YYYY-MM-DD で書きます/);
  assert.match(r.stderr, /2026-13-40/);
});

test('checkedAt がビルド日より未来だとビルドが落ちる', () => {
  // 未来日は warnIfStale を永久に沈黙させる。陳腐化のシグナルはこれしか無い。
  const r = runBuild('checked-future', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /より未来です/);
  assert.match(r.stderr, /2099-01-01/);
});

test('revisionAt が空文字だとビルドが落ちる（キーを書いていないのとは別扱い）', () => {
  const r = runBuild('revision-empty', { KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /revisionAt は実在する日付を YYYY-MM-DD で書きます/);
});

test('revisionAt を書いていない記事はビルドが通る（任意項目）', () => {
  const r = runBuild('seido-ok', { KAKEI_TODAY: '2026-09-01' });
  assert.equal(r.code, 0, r.stderr);
});

test('KAKEI_TEST 無しで KAKEI_TODAY を渡すとビルドが落ちる', () => {
  const r = runBuildWithoutTestMode({ KAKEI_TODAY: '2026-09-01' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /KAKEI_TODAY が設定されています/);
});

test('KAKEI_TEST 無しで KAKEI_DIST を渡すとビルドが落ちる（古い dist を本番へ出す経路）', () => {
  const r = runBuildWithoutTestMode({ KAKEI_DIST: path.join(SITE, 'test/.out/should-not-exist') });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /KAKEI_DIST が設定されています/);
  assert.equal(fs.existsSync(path.join(SITE, 'test/.out/should-not-exist')), false, '落ちる前に書き出してはいけない');
});

test('KAKEI_TEST 無しで KAKEI_CONTENT を渡すとビルドが落ちる（fixture がデプロイされる経路）', () => {
  const r = runBuildWithoutTestMode({ KAKEI_CONTENT: path.join(SITE, 'test/fixtures/seido-ok') });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /KAKEI_CONTENT が設定されています/);
});

test('KAKEI_TODAY が実在しない日付だとビルドが落ちる', () => {
  const r = runBuild('seido-ok', { KAKEI_TODAY: '2026-13-40' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /KAKEI_TODAY は実在する日付を YYYY-MM-DD で指定します/);
});
