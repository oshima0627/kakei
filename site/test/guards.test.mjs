import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { toJstDateString } from '../lib/date.mjs';

const SITE = path.resolve(import.meta.dirname, '..');

/** fixture の content ディレクトリを使って build.mjs を1回走らせる。 */
export function runBuild(fixture, env = {}) {
  const content = path.join(SITE, 'test/fixtures', fixture);
  const dist = path.join(SITE, 'test/.out', fixture);
  fs.rmSync(dist, { recursive: true, force: true });
  const r = spawnSync(process.execPath, [path.join(SITE, 'build.mjs')], {
    cwd: SITE,
    encoding: 'utf8',
    env: { ...process.env, KAKEI_CONTENT: content, KAKEI_DIST: dist, ...env },
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

test('revisionAt を過ぎているとビルドが落ちる', () => {
  const r = runBuild('expired', { KAKEI_TODAY: '2027-01-02' });
  assert.notEqual(r.code, 0);
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
  assert.match(r.stderr, /seido の 確認日 は YYYY-MM-DD で書きます/);
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
