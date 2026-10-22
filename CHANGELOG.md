# Changelog

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
