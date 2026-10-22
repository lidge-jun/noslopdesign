#!/usr/bin/env node
// Copy the upstream skill references from a CodexClaw checkout into skills/ and apply the rewrites in
// scripts/lib/rules.mjs. Repo-owned files (see ownedFor) are left alone.
//
//   node scripts/sync-from-codexclaw.mjs --source ../codexclaw
//   node scripts/sync-from-codexclaw.mjs --source ../codexclaw --check   # fail if a sync would change files
//
// Use a clean checkout of CodexClaw main as the source: upstream.json pins its HEAD commit, and CI
// fetches that commit from GitHub. The source defaults to $CODEXCLAW_DIR.
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { SKILL_MAP, ownedFor, EXCLUDED, TEXT_EXT, rewrite, findLeftovers, UPSTREAM_REPO } from './lib/rules.mjs';
import { walk } from './lib/walk.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const check = args.includes('--check');
const si = args.indexOf('--source');
const source = si >= 0 ? args[si + 1] : process.env.CODEXCLAW_DIR;
if (!source || !existsSync(join(source, 'plugins/codexclaw/skills'))) {
  console.error('usage: sync-from-codexclaw.mjs --source <codexclaw checkout> [--check]');
  process.exit(2);
}

// Pass 1: compute every target and every problem without touching the tree.
const writes = [];
const removes = [];
const changed = [];
const problems = [];

for (const entry of SKILL_MAP) {
  const src = join(source, entry.from);
  const dst = join(ROOT, entry.to);
  const owned = ownedFor(entry);
  const want = new Set();
  for (const rel of walk(src)) {
    if (owned.has(rel) || EXCLUDED.some((re) => re.test(rel))) continue;
    want.add(rel);
    const out = join(dst, rel);
    const raw = readFileSync(join(src, rel));
    const next = TEXT_EXT.test(rel) ? Buffer.from(rewrite(raw.toString('utf8'))) : raw;
    if (TEXT_EXT.test(rel)) for (const h of findLeftovers(next.toString('utf8'))) problems.push(`${entry.to}/${rel}:${h.line}: ${h.text}`);
    const cur = existsSync(out) ? readFileSync(out) : null;
    if (cur && cur.equals(next)) continue;
    changed.push(`${cur ? 'update' : 'add   '} ${entry.to}/${rel}`);
    writes.push([out, next]);
  }
  if (existsSync(dst)) for (const rel of walk(dst)) {
    if (owned.has(rel) || want.has(rel)) continue;
    changed.push(`remove ${entry.to}/${rel}`);
    removes.push(join(dst, rel));
  }
}

if (problems.length) {
  console.error('not ok - upstream text still points at CodexClaw internals (add a rewrite in scripts/lib/rules.mjs):');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

for (const c of changed) console.log(c);
if (check) {
  if (changed.length) { console.error(`not ok - ${changed.length} file(s) differ from upstream`); process.exit(1); }
  console.log('ok - skills match upstream');
  process.exit(0);
}

// Pass 2: apply.
for (const [out, buf] of writes) { mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, buf); }
for (const p of removes) unlinkSync(p);
for (const entry of SKILL_MAP) if (existsSync(join(ROOT, entry.to))) pruneEmpty(join(ROOT, entry.to));

function pruneEmpty(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) pruneEmpty(join(dir, e.name));
  if (readdirSync(dir).length === 0) rmdirSync(dir);
}

const commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const upstreamFile = join(ROOT, 'upstream.json');
const prev = existsSync(upstreamFile) ? JSON.parse(readFileSync(upstreamFile, 'utf8')) : {};
// Record the upstream commit only when content changed, so an unrelated CodexClaw commit opens no PR.
if (changed.length || !prev.commit) {
  const skills = SKILL_MAP.map(({ from, to }) => ({ from, to }));
  writeFileSync(upstreamFile, JSON.stringify({ repository: UPSTREAM_REPO, commit, skills }, null, 2) + '\n');
}
console.log(`ok - ${changed.length} file(s) changed, upstream ${commit.slice(0, 12)}`);
