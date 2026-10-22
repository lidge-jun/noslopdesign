#!/usr/bin/env node
// sloplint must flag the known tells and pass a clean page; --kept must catch a dropped field.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LINT = join(ROOT, 'skills/noslop-frontend/scripts/sloplint.mjs');
const run = (...a) => { try { return { code: 0, out: execFileSync('node', [LINT, ...a], { encoding: 'utf8' }) }; } catch (e) { return { code: e.status, out: String(e.stdout) }; } };

test('slop fixture fails with floor and reflex findings', () => {
  const r = run(join(ROOT, 'tests/fixtures/slop.html'), '--json');
  assert.equal(r.code, 1);
  const ids = new Set(JSON.parse(r.out).findings.map((f) => f.rule));
  for (const id of ['NS-ZOOM', 'NS-PLACEHOLDER', 'NS-EMOJI-UI', 'NS-FOCUS-GONE', 'NS-PURPLE-GRADIENT', 'NS-GRADIENT-TEXT', 'NS-INTER-ONLY', 'NS-BUZZWORD', 'NS-VANITY-METRIC', 'NS-APHORISM', 'NS-GLOW', 'NS-SCROLL-CUE', 'NS-100VH', 'NS-TRANSITION-ALL']) assert.ok(ids.has(id), 'missing ' + id);
});

test('clean fixture passes', () => {
  const r = run(join(ROOT, 'tests/fixtures/clean.html'));
  assert.equal(r.code, 0, r.out);
});

test('a reflex rule with a stated reason is excused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sloplint-'));
  const f = join(dir, 'p.css');
  writeFileSync(f, '/* noslop-allow NS-GRADIENT-TEXT: brand wordmark is a licensed gradient lockup */\n.logo{background-clip:text}\n');
  assert.equal(run(f).code, 0);
});

test('--kept catches a field that a redesign dropped', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sloplint-'));
  const inv = join(dir, 'before.json');
  assert.equal(run(join(ROOT, 'tests/fixtures/clean.html'), '--inventory', inv).code, 0);
  const after = join(dir, 'after.html');
  writeFileSync(after, readFileSync(join(ROOT, 'tests/fixtures/clean.html'), 'utf8').replace('<input name="email" type="email">', ''));
  const r = run(after, '--kept', inv);
  assert.equal(r.code, 1);
  assert.match(r.out, /fields: email/);
});
