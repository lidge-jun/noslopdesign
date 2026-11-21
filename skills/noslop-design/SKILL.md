---
name: noslop-design
description: >-
  noslopdesign: decide the direction, write the copy, build and audit web pages and app screens so
  they do not look AI-made. Use for SaaS homepages, landing pages, product pages, dashboards, admin
  and CRUD screens, mobile layouts, design systems, UX states, logos and UI bug fixes (HTML/CSS,
  React, Next.js, Svelte, Astro, Tailwind, React Native/Expo). Includes static and rendered lint.
  Triggers: make it look good, redesign, landing page, dashboard, responsive, anti-slop, AI-looking
  UI, copywriting, 깔끔하게, 모던하게, 홈페이지 만들어줘, 랜딩페이지, 대시보드, 반응형, 디자인 수정, 카피.
---

# noslop-design

One skill for interface work: direction, copy, build and audit. It merged noslop-frontend and
noslop-uiux; both names remain as redirects.

| Mode | Use when | Start with |
|---|---|---|
| **Direction** | Vague brief ("깔끔하게", "Linear처럼"), new or brand-visible surface, design system, IA, UX states, logo | [Intent discovery](references/direction/intent-discovery.md), then [Design Read](references/direction/design-read.md) |
| **Copy** | Any visible words: headline, CTA, microcopy, errors, empty states | [Copy process](references/copy/copy-process.md) |
| **Build** | HTML/CSS/components, responsive, motion, accessibility, framework code | [Routing defaults](references/build/routing-defaults.md), [anti-slop](references/build/anti-slop.md), [aesthetics](references/build/aesthetics.md) |
| **Audit** | Review an existing UI, pre-ship check, "why does this look AI-made" | [Visual audit loop](references/build/visual-audit-loop.md), [slop consensus](references/build/slop-consensus-2026.md), lint below |

Handoffs: [direction roles](references/direction/role-boundaries.md), [build roles](references/build/role-boundaries.md).
A narrow build task does not reopen direction; an open-ended visual brief never skips it.

If the project has a `DESIGN.md`, read it first and treat it as the brief. Once a direction is
locked, write or update it per the [DESIGN.md protocol](references/direction/design-md.md).

## Defaults that come with this skill

- Neutral controls, color only in data and focus (FE-COLOR-RESTRAINT-01 in [color system](references/build/color-system.md)).
- No one-sided accent bars on cards, callouts, pills or nav (FE-SIDE-ACCENT-01 in [anti-slop](references/build/anti-slop.md)).
- Short heroes centered; a left-aligned hero needs a counterweight (FE-HERO-ALIGN-01 in [layout discipline](references/build/layout-discipline.md)).
- Korean marketing copy register in [copy registers](references/copy/copy-registers.md).

## Lint

No dependencies; `--render` uses playwright-core when installed and otherwise prints NOT_RUN.

```
node <skill>/scripts/ui-lint.mjs <file-or-dir> [--render]
node <skill>/scripts/copy-lint.mjs <file-or-dir>
node <skill>/scripts/sloplint.mjs <file-or-dir>
```

Fix every FAIL; fix or justify every WARN. An unrun check is reported as not run, never as passed.
Details: [scripts README](scripts/README.md).

## Work size

| Size | Signals | Depth |
|---|---|---|
| C0 | Text or copy only, no behavior change | Edit and re-read |
| C1 | One file, local visual or behavior fix | Focused fix, check the changed screen |
| C2 | A conventional screen: form, table, list, detail, settings | Follow repo conventions, cover every state, smoke-test the flow |
| C3 | New or redesigned surface, shared components, broad visual change | Direction first, full references, multi-width browser check |
| C4 | Auth, payments, deletion, permissions or release-critical UI | C3 plus negative paths and explicit sign-off |

Production means deployed to real users beyond the author.

## Rule classes

- STRICT: violation blocks completion (accessibility baseline, state coverage, truthful verification).
- DEFAULT: follow unless a stated, documented reason warrants deviation.
- HEURISTIC: judgment guide; deviation needs no rationale.
- STYLE_SAMPLE: an illustration to draw from, never a universal requirement.
- ESCALATE: stop and ask the user.

## References

| Condition | Reference |
|---|---|
| User-facing decision points | [Lazy-user gate](references/direction/lazy-user-gate.md) |
| Existing product audit | [Experience audit](references/direction/experience-audit.md), [universal principles](references/direction/universal-principles.md) |
| Concept generation, assets, icons | [Concept procedure](references/direction/concept-exploration.md), [asset handoff](references/direction/asset-handoff.md), [icon strategy](references/direction/icon-strategy.md) |
| Agents that act for the user | [Agent action UX](references/direction/agent-action-ux.md) |
| Styles, products, palettes, states, IA, branding, Korean UI | [Direction topic index](references/direction/topic-index.md) |
| Copy registers and tells | [Registers](references/copy/copy-registers.md), [tells](references/copy/copy-tells.md) |
| C2 list/detail/form screens | [CRUD UI](references/build/crud-ui.md) |
| Marketing/visual surfaces or C3+ | [Build topic index](references/build/topic-index.md) |
| Framework implementation | [Stack index](references/stack-index.md) |
| Components, dials, intake | [Design intake](references/build/design-intake.md) |
| Typography, color, layout, assets, icons | [Implementation](references/build/implementation.md) |
| Platform features with Baseline status | [Platform 2026](references/build/platform-2026.md) |
| Performance, accessibility, forms, state, errors | [Platform and runtime](references/build/platform-runtime.md), [WCAG 2.2 AA](references/build/wcag22-aa.md) |
| Interaction and rendering details on C2+ screens | [Interface guidelines](references/build/interface-guidelines.md) |
| API consumption, security UI | [Backend contracts](references/build/backend-contracts.md) |
| Any render or executable artifact; production C2+ | [Render grounding](references/build/render-grounding.md), [full pre-flight](references/build/preflight-full.md) |

## Build routing

| Decision | Options | Why |
|---|---|---|
| Product surface | landing, app, dashboard, AI tool, public service, education, game, creative | Density, type scale, assets |
| Locale | Korean-first, global/i18n, English-only | CJK type, copy, formats |
| Density | campaign, consumer app, productivity, SaaS, ops, finance, developer console | No landing composition in tools |
| Asset need | none, screenshot, product photo, diagram, chart, illustration, soft 3D, game asset | No asset-free gradient UI |
| Soft 3D/character | not allowed, subtle, primary | No generic mascot slop |
| Motion | static, feedback-only, expressive, cinematic | No cinematic motion in utilities |

## UX State Contract (UX-STATE-01)

For onboarding, empty, loading, error or progressive disclosure, answer the state's meaning before styling ([UX states](references/direction/ux-states.md)).
- Onboarding teaches the first meaningful action, not the whole product.
- Empty explains why the state exists and names the next action.
- Loading: skeleton for known structure, spinner/progress for short unknown waits, no fake completion.
- Error exposes retry, recovery or escalation; never a dead end.
- Progressive disclosure names what stays hidden, why, and where it becomes available.

## IA Chooser (UX-IA-01)

| Work shape | Default IA |
|---|---|
| Dense desktop repeated work | Sidebar + command palette |
| Medium sectioned work | Tabs or segmented control |
| Mobile-primary consumer flow | Bottom nav, sheet, thumb-zone actions |
| Wizard/auth/setup | Stepper or stacked linear flow |

Responsive details: [responsive nav](references/direction/responsive-nav.md).

## Visual Concept Exploration (UX-CONCEPT-GEN-01, DEFAULT)

Before implementing a C2+ expressive or brand-visible surface, read the [concept procedure](references/direction/concept-exploration.md).

## Done means checked (STRICT)

| Claim | Requires | Not enough |
|---|---|---|
| It looks right | Screenshots at mobile, tablet and desktop widths, read and compared to the brief | The code alone |
| It works | The changed flow exercised in a browser, including loading, empty and error states | A passing build |
| Builds | Build or typecheck exit 0 | Lint alone |
| Bug fixed | The original symptom no longer reproduces | The edit alone |
| Accessible | Keyboard pass plus axe-core or equivalent | A screenshot |

## Tools

Any browser tool (Playwright, Chrome DevTools or a built-in browser) covers the rendered check.
For generated images, concept mockups and motion video the references use
[ima2-gen](https://github.com/lidge-ai/ima2-gen) (`npm i -g ima2-gen`); any image generator is the
fallback. Where the references say `$imagegen`, read it as the agent's own image tool.
