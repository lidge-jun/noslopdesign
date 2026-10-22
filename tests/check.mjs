#!/usr/bin/env node
// Every skill must load in Claude Code and Codex, every relative link must resolve, every synced
// reference must be reachable, versions must agree, and synced text must not point back at CodexClaw
// internals.
//
//   npm install && npm run check
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILL_MAP, ownedFor, findLeftovers, TEXT_EXT } from '../scripts/lib/rules.mjs';
import { walk } from '../scripts/lib/walk.mjs';

let YAML;
try { YAML = await import('yaml'); } catch {
  console.error('This check needs the "yaml" package: npm install');
  process.exit(2);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (where, msg) => errors.push(where + ': ' + msg);
const parse = (text, where) => {
  const doc = YAML.parseDocument(text, { strict: true, uniqueKeys: true });
  for (const e of [...doc.errors, ...doc.warnings]) fail(where, 'YAML ' + e.name + ': ' + e.message.split('\n')[0]);
  return doc.errors.length ? null : doc.toJS();
};
const readJSON = (rel) => {
  try { return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')); } catch (e) { fail(rel, 'invalid or missing JSON: ' + e.message); return null; }
};

// GitHub heading anchors.
const slug = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
const FENCE = /^\s*(```|~~~)/;
const anchorCache = new Map();
const anchors = (file) => {
  if (!anchorCache.has(file)) {
    const set = new Set();
    let fence = false;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (FENCE.test(line)) fence = !fence;
      const m = !fence && line.match(/^#{1,6}\s+(.*)$/);
      if (m) set.add(slug(m[1]));
    }
    anchorCache.set(file, set);
  }
  return anchorCache.get(file);
};

// Load every text file of every skill once.
const skills = SKILL_MAP.map((entry) => {
  const name = basename(entry.to);
  const base = join(ROOT, entry.to);
  const files = existsSync(base) ? walk(base).filter((rel) => TEXT_EXT.test(rel)).map((rel) => ({ rel, abs: join(base, rel), text: readFileSync(join(base, rel), 'utf8') })) : [];
  if (!files.length) fail(entry.to, 'skill folder is missing or empty');
  return { entry, name, base, files, owned: ownedFor(entry) };
});

const names = new Map();
for (const s of skills) {
  const where = 'skills/' + s.name + '/SKILL.md';
  const skillMd = s.files.find((f) => f.rel === 'SKILL.md');
  if (!skillMd) { fail(where, 'missing'); continue; }
  const m = skillMd.text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) fail(where, 'no frontmatter block at the top');
  const fm = m && parse(m[1], where);
  if (fm) {
    if (typeof fm.name !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name) || fm.name.length > 64) fail(where, 'name must be kebab-case (got ' + JSON.stringify(fm.name) + ')');
    if (fm.name !== s.name) fail(where, 'name "' + fm.name + '" must match its folder "' + s.name + '"');
    if (typeof fm.description !== 'string' || !fm.description.trim()) fail(where, 'description must be a non-empty string');
    else if (fm.description.length > 1024) fail(where, 'description is ' + fm.description.length + ' characters; agents allow 1024');
    if (names.has(fm.name)) fail(where, 'duplicate name "' + fm.name + '"'); else names.set(fm.name, where);
  }
  const openai = s.files.find((f) => f.rel === 'agents/openai.yaml');
  if (openai) parse(openai.text, 'skills/' + s.name + '/agents/openai.yaml');

  for (const f of s.files) {
    const at = 'skills/' + s.name + '/' + f.rel;
    for (const h of findLeftovers(f.text)) fail(at + ':' + h.line, 'internal reference left over: ' + h.text);
    if (!f.rel.endsWith('.md')) continue;
    let fence = false;
    f.text.split('\n').forEach((line, i) => {
      if (FENCE.test(line)) fence = !fence;
      if (fence) return;
      for (const lm of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        const target = lm[1];
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const [path, hash] = target.split('#');
        const dest = resolve(dirname(f.abs), decodeURI(path));
        if (!existsSync(dest)) { fail(at + ':' + (i + 1), 'broken link ' + target); continue; }
        if (hash && dest.endsWith('.md') && !anchors(dest).has(hash)) fail(at + ':' + (i + 1), 'missing anchor #' + hash + ' in ' + target);
      }
    });
  }
}

// Orphans: every reference document must be named somewhere. A basename that exists in both skills
// only counts from the other skill when the mention carries the skill path.
const baseCount = new Map();
for (const s of skills) for (const f of s.files) if (f.rel.startsWith('references/') && f.rel.endsWith('.md')) baseCount.set(basename(f.rel), (baseCount.get(basename(f.rel)) || 0) + 1);
for (const s of skills) for (const f of s.files) {
  if (!f.rel.startsWith('references/') || !f.rel.endsWith('.md')) continue;
  const b = basename(f.rel);
  const dup = baseCount.get(b) > 1;
  const named = skills.some((o) => o.files.some((g) => {
    if (g === f) return false;
    if (o === s) return g.text.includes(b);
    return g.text.includes(dup ? s.name + '/' + f.rel : b);
  }));
  if (!named) fail('skills/' + s.name + '/' + f.rel, 'orphan reference: nothing names ' + b);
}

// Manifests: valid JSON, skill paths exist, versions agree.
const pkg = readJSON('package.json');
const claude = readJSON('.claude-plugin/marketplace.json');
const codex = readJSON('.codex-plugin/plugin.json');
const agents = readJSON('.agents/plugins/marketplace.json');
for (const [rel, j] of [['.claude-plugin/marketplace.json', claude], ['.agents/plugins/marketplace.json', agents]]) {
  if (j) for (const plugin of j.plugins || []) for (const sp of [].concat(plugin.skills || [])) if (!existsSync(join(ROOT, sp, 'SKILL.md'))) fail(rel, 'lists ' + sp + ', which has no SKILL.md');
}
if (codex && !existsSync(join(ROOT, codex.skills || ''))) fail('.codex-plugin/plugin.json', 'skills path ' + codex.skills + ' does not exist');
const versions = {
  'package.json': pkg && pkg.version,
  '.claude-plugin/marketplace.json': claude && claude.plugins && claude.plugins[0] && claude.plugins[0].version,
  '.codex-plugin/plugin.json': codex && codex.version,
};
if (new Set(Object.values(versions)).size !== 1) fail('versions', 'must match: ' + JSON.stringify(versions));

if (errors.length) {
  console.error('not ok - ' + errors.length + ' problem(s):');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log('ok - ' + skills.length + ' skills load, links resolve, references reachable, versions agree, no internal references left');
