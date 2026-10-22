// Shared rules for syncing skill references from CodexClaw and checking the result.
// CodexClaw is the upstream: its dev-frontend and dev-uiux-design skills are copied here with a
// fixed set of rewrites, so a sync is mechanical and repeatable. Files listed as owned (the SKILL.md
// entry files, agents/openai.yaml and any per-skill extras) are written for this repo and never
// overwritten.

export const UPSTREAM_REPO = 'https://github.com/lidge-jun/codexclaw';

export const SKILL_MAP = [
  {
    from: 'plugins/codexclaw/skills/dev-frontend',
    to: 'skills/noslop-frontend',
    owned: ['references/core/iterative-design.md', 'references/core/interface-guidelines.md', 'scripts/sloplint.mjs'],
  },
  { from: 'plugins/codexclaw/skills/dev-uiux-design', to: 'skills/noslop-uiux', owned: ['references/design-md.md'] },
];

// Paths (relative to a skill folder) that every skill owns.
export const OWNED = ['SKILL.md', 'agents/openai.yaml'];

export const ownedFor = (entry) => new Set([...OWNED, ...(entry.owned || [])]);

// Upstream files that are not shipped here.
export const EXCLUDED = [/(^|\/)\.DS_Store$/, /^scripts\/shadcn-components\.tar\.gz$/];

export const TEXT_EXT = /\.(md|mdx|sh|ya?ml|json|txt|mjs|js|ts|tsx|css|html)$/;

const OWNER_NOUN = {
  backend: 'the backend contract',
  testing: 'the test plan',
  security: 'the security review',
  devops: 'the release checklist',
};

// Ordered rewrites. Specific sentences first, then links, then bare names.
export const REWRITES = [
  [
    'using the available capability selected by `../../../dev/references/browser-routing.md` and `dev-testing` §4.7',
    "using whatever browser tool is available (Playwright, Chrome DevTools or the agent's built-in browser)",
  ],
  [
    'QA protocol and verification proof execution are owned by `cxc-dev-testing`.',
    "QA protocol and verification proof execution belong to the project's test workflow.",
  ],
  ['../../../dev-uiux-design/SKILL.md', '../../../noslop-uiux/SKILL.md'],
  ['../../dev-frontend/', '../../noslop-frontend/'],
  ['../../dev-uiux-design/', '../../noslop-uiux/'],
  ['cxc-dev-uiux-design', 'noslop-uiux'],
  ['cxc-dev-frontend', 'noslop-frontend'],
  [/`(?:cxc-)?dev-(backend|testing|security|devops)(?:\/[^`]*)?`(?: §[\d.]+)?/g, (_, k) => OWNER_NOUN[k]],
  [/\bdev-uiux-design\b/g, 'noslop-uiux'],
  [/\bdev-frontend\b/g, 'noslop-frontend'],
  [/\bC-phase verification\b/g, 'final verification'],
  [/\bC-phase\b/g, 'final check'],
  // The upstream "dev" skill defined rule classes and production scope; noslop-frontend/SKILL.md does now.
  ['Inherit `dev` TypeScript strict-compatibility rules.', "Follow the repo's TypeScript strictness settings."],
  [/`dev` §0\.2/g, 'the Rule classes in `noslop-frontend/SKILL.md`'],
  [/`dev` §0\.4/g, 'see Production in `noslop-frontend/SKILL.md`'],
  ['identical in `dev` and ', 'identical in '],
  ['`dev` owns universal process, evidence, and safety rules.', "The agent's base workflow owns universal process, evidence, and safety rules."],
  ['`dev` =', 'base workflow ='],
  // Section numbers that pointed at an older, longer SKILL.md.
  ['`noslop-frontend/SKILL.md` §10 (Zod + react-hook-form)', '`noslop-frontend/references/stacks/react.md` (React Hook Form + Zod)'],
  ['noslop-frontend §12 Design System Detection', 'Design System Detection in `noslop-frontend/references/core/platform-runtime.md`'],
  ['Design System Detection in `noslop-frontend/SKILL.md` Section 12 wins.', 'Design System Detection in `platform-runtime.md` wins.'],
  ['aligned with `SKILL.md` §12.', 'aligned with Design System Detection in `references/core/platform-runtime.md`.'],
  ['noslop-frontend §14 (Pre-Flight Checklist)', 'the pre-flight checklist (`noslop-frontend/references/core/preflight-full.md`)'],
  ['Companion to `noslop-frontend/SKILL.md` §14.', 'Companion to the pre-flight gate in `noslop-frontend/SKILL.md`.'],
  // The legacy shadcn tarball is not shipped, so its README section goes too.
  [/^### `shadcn-components\.tar\.gz`[\s\S]*?(?=^## )/m, ''],
  // Concepts that only other CodexClaw skills define.
  ['; the document grammar (hairlines, type hierarchy, one accent, data charts) is `dev-visualizer` REPORT-DESIGN-01.', '; use a document grammar of hairlines, type hierarchy, one accent and data charts instead.'],
  ['(per search skill)', '(with a current web search)'],
  ['DEFAULT — ponytail discipline applied to UX', 'DEFAULT — minimum-choice discipline applied to UX'],
  ['existence the ponytail way, in order', 'existence, in order'],
  // Section pointers into the old, longer SKILL.md and the CodexClaw dev skill, written without backticks.
  ['Optional for ≤5-line patches — see dev §0.1 Patch Fast-Path.', 'Optional for ≤5-line patches (work sizes C0/C1 in `noslop-frontend/SKILL.md`).'],
  ['Rule classes (dev §0.2)', 'Rule classes (`noslop-frontend/SKILL.md`)'],
  [/\(SKILL §(5|7|8|12|13)\)/g, (_, n) => ({ 5: '(`anti-slop-enforcement.md` §5)', 7: '(`a11y-patterns.md` Focus Management)', 8: '(`platform-runtime.md` §8)', 12: '(`platform-runtime.md` §12)', 13: '(`platform-runtime.md` §13)' })[n]],
  ['The compact flow in SKILL.md §1', 'The compact flow in `intent-discovery.md`'],
  ['The composite kit behind SKILL.md §1 UX-DEFAULT-ISM-01', 'The composite kit behind `intent-discovery.md` UX-DEFAULT-ISM-01'],
  // Codex-only tool names and CodexClaw-only rule IDs.
  ['3. **Inspect**: `view_image` every candidate.', "3. **Inspect**: open every candidate in the agent's image viewer."],
  [/`view_image`/g, "the agent's image viewer"],
  [' (FAMILY-SLOP-01)', ''],
  ['; load it with `ima2 skill front ref asset-requirements` when ima2 is available.', '.'],
  // Star counts go stale.
  [/ \(\d+k stars(?:, [^)]*)?\)/g, ''],
];

export function rewrite(text) {
  let out = text;
  for (const [from, to] of REWRITES) {
    out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to);
  }
  return out;
}

// Anything matching these after a sync means an upstream change introduced a new internal
// reference; add a rewrite above instead of editing the copied file.
export const LEFTOVERS = [
  /\.\.\/dev\//,
  /\bcxc-/,
  /\bdev-[a-z]+(?:-[a-z]+)*\b/,
  /\bPABCD\b/i,
  /\bC-phase\b/,
  /codexclaw/i,
  /`dev`/,
  /\bponytail\b/,
  /per search skill/,
  /\bdev §/,
  /\bSKILL(?:\.md)? §\d/,
  /`view_image`/,
  /\bima2 skill\b/,
];

// Provenance lines may name the upstream project.
const ALLOWED_LINE = /^(Source:|Adapted from)/;

export function findLeftovers(text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    if (ALLOWED_LINE.test(line.trim())) return;
    for (const re of LEFTOVERS) if (re.test(line)) { hits.push({ line: i + 1, text: line.trim().slice(0, 160) }); break; }
  });
  return hits;
}
