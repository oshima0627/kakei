import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

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
