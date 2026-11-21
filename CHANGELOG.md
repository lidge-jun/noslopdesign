# Changelog

## 0.3.0

- One skill: `noslop-design` merges `noslop-frontend` and `noslop-uiux` (upstream CodexClaw merged `cxc-dev-frontend` and `cxc-dev-uiux-design` into `cxc-dev-design`). The old names stay as redirects.
- Modes: direction, copy, build, audit. References now live under `references/direction`, `references/build`, `references/copy` and `references/stacks`.
- New: copy module (fact sheet, registers including a Korean marketing register tested with blind A/B, tells as caps), slop consensus 2026 (stacking rule, cross-source tells, second-order default palettes), neutral controls and no one-sided accent bars, centered short heroes with a counterweight rule for left alignment, Baseline 2026 platform features, agent action UX.
- New lint: `scripts/ui-lint.mjs` and `scripts/copy-lint.mjs` (zero dependencies, optional `--render`), alongside `sloplint.mjs`.

## 0.2.0

- `scripts/sloplint.mjs`: dependency-free static lint with Floor/Reflex/Finish tiers, `noslop-allow` excuses, and `--inventory`/`--kept` for redesigns.
- Modes for `noslop-frontend`: build, redesign, polish, audit, critique, bolder, quieter, harden.
- `noslop-uiux` writes the locked direction to `DESIGN.md` and reads it first on later runs.
- New reference: interface guidelines for focus, feedback, content and motion details.
- Ideas adapted from Hallmark, impeccable, Vercel Web Interface Guidelines and awesome-design-md; see NOTICE.md.

## 0.1.0

- First release: `noslop-frontend` and `noslop-uiux`, extracted from CodexClaw `cxc-dev-frontend` and `cxc-dev-uiux-design`.
- Standalone entry files: work sizes, rule classes and the verification gate are defined in `noslop-frontend/SKILL.md`.
- Install through `npx skills`, the Claude Code and Codex plugin marketplaces, or `./install.sh`.
- Weekly sync from CodexClaw with a fixed rewrite table, plus CI for frontmatter, links and leftover references.
- `iterative-design.md` is written for this repo instead of synced.
- Sync PRs run the check through `workflow_dispatch`; a blocked sync opens an issue and a clean run closes it.
- README lists the call syntax for each install path.
