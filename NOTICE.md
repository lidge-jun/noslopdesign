# noslopdesign licensing and provenance notice

Copyright (c) 2026 lidge-jun. SPDX-License-Identifier: MIT

The skill references come from [CodexClaw](https://github.com/lidge-jun/codexclaw) (MIT, same author),
where they ship as `cxc-dev-frontend` and `cxc-dev-uiux-design`. `upstream.json` records the commit.

## Adapted and synthesized material

Files that adapt outside material say so on a `Source:` or `Adapted from` line. The sources:

| Source | License | Where |
|---|---|---|
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), Copyright (c) 2026 Leonxlnx | MIT | `noslop-frontend/references/core/anti-slop.md`, `motion.md`, `asset-requirements.md`; `noslop-uiux/references/design-read.md`; link-ownership helpers in `install.sh`; plugin manifest layout |
| [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) (imagegen-frontend-web), Copyright (c) 2026 Leonxlnx | MIT | `noslop-frontend/references/core/asset-requirements.md` |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) detector catalog: rule patterns adapted, no verbatim text | Apache-2.0 | `noslop-frontend/references/core/anti-slop.md`, `a11y-patterns.md` |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (frontend-ui-engineering), Copyright (c) 2025 Addy Osmani | MIT | `noslop-uiux/references/anti-rationalization.md` |
| [Anthropic frontend-design skill](https://github.com/anthropics/skills), redesign-skill, Koomook | See each project | Ideas synthesized in `noslop-frontend/references/core/anti-slop.md` |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | MIT | Floor/Reflex/Finish gate tiers, the static lint and before/after inventory idea behind `noslop-frontend/scripts/sloplint.mjs`, mode names |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) commands | Apache-2.0 | Mode vocabulary (audit, polish, critique, bolder, quieter, harden) and the product-facts vs direction split in `noslop-uiux/references/design-md.md`; ideas only, no text |
| [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | MIT | Checklist topics in `noslop-frontend/references/core/interface-guidelines.md`, rewritten |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md), Google Stitch DESIGN.md | MIT | DESIGN.md convention in `noslop-uiux/references/design-md.md` |

`iterative-design.md`, `interface-guidelines.md`, `scripts/sloplint.mjs` and `design-md.md` are written for
this repo and are not synced from CodexClaw.

The MIT grants above require their copyright and permission notices to accompany substantial
portions; the MIT text is identical to [LICENSE](LICENSE) apart from the copyright line shown in the
table. This project license does not relicense third-party material.
