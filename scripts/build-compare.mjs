#!/usr/bin/env node
// Build docs/compare from staged test outputs.
//   node scripts/build-compare.mjs <staging-dir>
// staging-dir/<cond>-<slug>/ holds each run folder (cond: vanilla | taste | noslop).
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = process.argv[2];
const OUT = join(ROOT, 'docs/compare');
const LINT = join(ROOT, 'skills/noslop-frontend/scripts/sloplint.mjs');
const data = JSON.parse(readFileSync(join(STAGE, 'meta.json'), 'utf8'));
const CONDS = [
  { id: 'vanilla', name: 'No skill', note: 'Same model, same harness, no design skill loaded' },
  { id: 'taste', name: 'taste-skill', note: 'Leonxlnx/taste-skill, design-taste-frontend' },
  { id: 'noslop', name: 'noslopdesign', note: 'noslop-frontend v0.2.0' },
];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const keepSites = process.argv.includes('--keep-sites');
if (!keepSites) rmSync(join(OUT, 'sites'), { recursive: true, force: true });
mkdirSync(join(OUT, 'thumbs'), { recursive: true });
const rows = [];
for (const p of data.prompts) {
  const cells = [];
  for (const c of CONDS) {
    const src = join(STAGE, c.id + '-' + p.slug);
    const cell = { cond: c.id, ok: existsSync(join(src, 'index.html')) || existsSync(join(src, 'dist/index.html')) };
    cell.minutes = data.durations && data.durations[c.id] ? data.durations[c.id][p.slug] : null;
    if (cell.ok) {
      const siteRoot = existsSync(join(src, 'dist/index.html')) ? join(src, 'dist') : src;
      const dest = join(OUT, 'sites', c.id, p.slug);
      if (!keepSites) cpSync(siteRoot, dest, { recursive: true, filter: (f) => !/\/(node_modules|\.git|shots)(\/|$)/.test(f) });
      cell.href = 'sites/' + c.id + '/' + p.slug + '/';
      let lint = { failing: null, findings: [] };
      try { lint = JSON.parse(execFileSync('node', [LINT, dest, '--json'], { encoding: 'utf8' })); }
      catch (e) { try { lint = JSON.parse(e.stdout); } catch {} }
      cell.blocking = lint.failing;
      cell.rules = (lint.findings || []).filter((f) => f.tier !== 'finish' && !f.excused).map((f) => f.rule.replace('NS-', ''));
      cell.rules = [...new Set(cell.rules)].slice(0, 4);
      for (const w of [1440, 390]) {
        // Thumbnails come from scripts/compare-thumbs.cjs (above-the-fold renders of the published copy).
        const t = join(OUT, 'thumbs', c.id + '-' + p.slug + '-' + w + '.jpg');
        if (existsSync(t)) cell['thumb' + w] = 'thumbs/' + c.id + '-' + p.slug + '-' + w + '.jpg';
      }
    }
    cells.push(cell);
  }
  rows.push({ p, cells });
}

const cellHtml = (c, p) => {
  const cond = CONDS.find((x) => x.id === c.cond);
  if (!c.ok) return '<td class="cell missing"><p>Run did not produce a page.</p></td>';
  const score = c.blocking === 0 ? '<span class="clean">0 blocking</span>' : '<span class="dirty">' + c.blocking + ' blocking</span>';
  return '<td class="cell"><a class="shot" href="' + c.href + '" aria-label="Open the ' + esc(cond.name) + ' page for ' + esc(p.short) + '">' +
    (c.thumb1440 ? '<img loading="lazy" src="' + c.thumb1440 + '" alt="' + esc(cond.name) + ' result, desktop" width="720" height="550">' : '') +
    (c.thumb390 ? '<img class="m" loading="lazy" src="' + c.thumb390 + '" alt="' + esc(cond.name) + ' result, phone" width="120" height="460">' : '') +
    '</a><p class="lint">sloplint ' + score + (c.rules.length ? ' · <code>' + c.rules.map(esc).join('</code> <code>') + '</code>' : '') +
    (c.minutes != null ? '<br>built in ' + c.minutes + ' min' : '') + '</p></td>';
};

const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<title>Same prompt, three agents · noslopdesign</title>\n<meta name="description" content="Four well-known prompts, run with no skill, with taste-skill and with noslopdesign on the same model.">\n' +
  '<link rel="icon" href="../favicon.svg" type="image/svg+xml">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+KR:wght@400;500;700&family=IBM+Plex+Sans+Condensed:wght@600;700&display=swap" rel="stylesheet">\n' +
  '<link rel="stylesheet" href="../site.css">\n<link rel="stylesheet" href="compare.css">\n</head>\n<body>\n' +
  '<header class="bar"><a class="mark" href="../" aria-label="noslopdesign home">noslop<span>design</span></a><nav aria-label="Primary"><a href="../#how">How it works</a><a href="../#install">Install</a><a href="https://github.com/lidge-jun/noslopdesign">GitHub</a></nav></header>\n' +
  '<main class="cmp">\n<section class="cmp-head"><p class="kicker">' + esc(data.date) + ' · ' + esc(data.model) + ' · ' + esc(data.harness) + '</p>\n<h1>Same prompt, <em>three agents.</em></h1>\n' +
  '<p class="lede">Four well-known prompts, each run once in a fresh thread on the same machine, model and harness. Only the design skill changes. Click any page to open the real build.</p>\n' +
  '<p class="lede ko" lang="ko">같은 모델, 같은 하네스, 같은 머신. 스킬만 바꿔서 유명한 프롬프트 네 개를 한 번씩 돌렸습니다.</p>\n' +
  '<p class="method">sloplint ran afterwards on every result with the same rules; the noslopdesign runs also used it while building, the others did not. One run per cell: read it as a reference, not a benchmark.</p></section>\n' +
  '<div class="matrix" role="region" aria-label="Comparison table" tabindex="0"><table>\n<thead><tr><th scope="col">Prompt</th>' + CONDS.map((c) => '<th scope="col">' + esc(c.name) + '<span>' + esc(c.note) + '</span></th>').join('') + '</tr></thead>\n<tbody>\n' +
  rows.map((r) => '<tr><th scope="row"><p class="prompt"' + (r.p.lang ? ' lang="' + r.p.lang + '"' : '') + '>' + esc(r.p.text) + '</p></th>' + r.cells.map((c) => cellHtml(c, r.p)).join('') + '</tr>').join('\n') +
  '\n</tbody></table></div>\n</main>\n<footer class="foot"><p>Raw folders, prompts and logs: <a href="https://github.com/lidge-jun/noslopdesign/tree/main/docs/compare">docs/compare</a>. Pages are published as the agents left them.</p></footer>\n</body>\n</html>\n';
writeFileSync(join(OUT, 'index.html'), html);
console.log('compare built: ' + rows.length + ' prompts x ' + CONDS.length + ' conditions');
