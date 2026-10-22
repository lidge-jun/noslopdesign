# Changelog

## 0.1.0

- First release: `noslop-frontend` and `noslop-uiux`, extracted from CodexClaw `cxc-dev-frontend` and `cxc-dev-uiux-design`.
- Standalone entry files: work sizes, rule classes and the verification gate are defined in `noslop-frontend/SKILL.md`.
- Install through `npx skills`, the Claude Code and Codex plugin marketplaces, or `./install.sh`.
- Weekly sync from CodexClaw with a fixed rewrite table, plus CI for frontmatter, links and leftover references.
- `iterative-design.md` is written for this repo instead of synced.
- Sync PRs run the check through `workflow_dispatch`; a blocked sync opens an issue and a clean run closes it.
- README lists the call syntax for each install path.
