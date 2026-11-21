# noslopdesign

**English** | [한국어](README.ko.md)

One Agent Skill that stops coding agents from shipping the average AI page: the purple-to-blue
gradient, the colored bar down the side of every card, the row of three icon tiles, the fake "10,000+
teams" stat. Ask for a
page the way you normally would and the agent picks a direction, builds it with real content and
assets, and checks the result in a real browser before it calls the job done.

```text
$noslop-design make a SaaS homepage that looks great
$noslop-design SaaS 홈페이지 멋있게 만들어줘
$noslop-design this dashboard looks AI-made, fix it
$noslop-design pick a brand direction for our budgeting app before we build anything
```

Plain requests work too: the skill description triggers on "make a SaaS homepage", "redesign",
"멋있게" and similar. To call it by name:

| Installed with | Codex | Claude Code |
|---|---|---|
| `npx skills` or `install.sh` | `$noslop-design …` | `/noslop-design …` |
| Plugin marketplace | `$noslopdesign:noslop-design …` | `/noslopdesign:noslop-design …` |

| Mode | Use it to | What it does |
|---|---|---|
| Direction | Decide the look before code | Intent discovery for briefs like "make it clean", Design Read, concept mockups, design systems, typography, navigation, onboarding/empty/error states, logos and favicons. |
| Copy | Write the words | A fact sheet from your brief, a register (including a Korean marketing register tested with blind A/B), short headlines and CTAs, and a tell check. |
| Build | Build, redesign or fix a page or app screen | Routes by surface, density, locale and asset needs, builds it in your stack, then renders it at three widths. |
| Audit | Find why it looks AI-made | Static and rendered lint (`ui-lint`, `copy-lint`, `sloplint`), a slop consensus list from vendor guides and deslop projects, and a violation ledger. |

`noslop-frontend` and `noslop-uiux` from 0.2 still work; they now point to `noslop-design`.

## Install

```bash
npx skills add https://github.com/lidge-jun/noslopdesign
```

That installs the skill with the [`npx skills`](https://github.com/vercel-labs/skills) CLI.

<details>
<summary>Claude Code plugin</summary>

```
/plugin marketplace add lidge-jun/noslopdesign
/plugin install noslopdesign@noslopdesign
```

The skill loads as `noslopdesign:noslop-design`. `/plugin update` upgrades it.

</details>

<details>
<summary>Codex plugin</summary>

```bash
codex plugin marketplace add lidge-jun/noslopdesign
codex plugin add noslopdesign@noslopdesign
```

Start a new Codex session afterwards so the skills load.

</details>

<details>
<summary>From a clone, linked instead of copied</summary>

```bash
git clone https://github.com/lidge-jun/noslopdesign && cd noslopdesign
./install.sh               # Claude Code
./install.sh --codex       # Codex
./install.sh --all-agents  # both
```

The skills are symlinked, so `git pull` updates them in place. `./install.sh --uninstall` removes the links.

</details>

The skills need nothing beyond what the agent already has. Any browser tool (Playwright, Chrome
DevTools, a built-in browser) covers the rendered check. For generated images and motion they use
[ima2-gen](https://github.com/lidge-ai/ima2-gen) when it is installed and fall back to the agent's own
image tool.

## How a build runs

See the same four prompts run with no skill, with taste-skill and with noslopdesign on one model and
machine: [lidge-jun.github.io/noslopdesign/compare](https://lidge-jun.github.io/noslopdesign/compare/).


1. Sizes the work, from a copy fix to a new brand-visible surface, and spends effort to match.
2. Classifies the surface: landing, app, dashboard, AI tool; locale; density; asset and motion needs.
3. For a vague or brand-visible brief, runs a Design Read and locks one direction before any code.
4. Builds with real content and real assets. No placeholder gradients, no icon-card filler.
5. Renders the page at mobile, tablet and desktop widths and checks it against the slop catalog.
6. Fixes what the screenshots show and reports what it checked.

## What counts as slop

Run the linter on any page, with or without the skill:

```bash
node skills/noslop-design/scripts/sloplint.mjs ./index.html
node skills/noslop-design/scripts/ui-lint.mjs ./index.html --render
node skills/noslop-design/scripts/copy-lint.mjs ./index.html
```

It sorts findings into three tiers. **Floor** never ships (blocked zoom, removed focus ring,
placeholder copy, emoji icons). **Reflex** is a default a model falls into (purple gradients,
gradient text, Inter-only, buzzwords, vanity metrics); keep one only with a written
`noslop-allow NS-RULE-ID: reason`. **Finish** is craft detail and never blocks. For redesigns,
`--inventory before.json` records every link, field, handler and heading, and `--kept before.json`
fails if one went missing.

Modes narrow the job: `$noslop-design audit ./index.html`, `redesign`, `polish`, `critique`,
`bolder`, `quieter`, `harden`. Once a direction is chosen, the skill writes it to `DESIGN.md` so the
next run builds the same design.

The catalog in [`anti-slop.md`](skills/noslop-design/references/build/anti-slop.md) covers more than
a hundred tells. A few of them:

- Inter everywhere, or Space Grotesk as the automatic "not Inter".
- A gradient hero with no reason to exist, or one hue tinting the entire page.
- Three icon-tile feature cards, logo strip, testimonial carousel: the default page skeleton.
- A colored bar down one side of cards, callouts or pills; buttons in a different hue each.
- Emoji as icons, fake metrics, "Jane Doe" testimonials, copy that describes the page instead of the product.
- Latin font choices applied to Hangul without checking line height and rhythm.

## Korean-first

Most anti-slop guidance stops at English. noslopdesign also covers Hangul typography and line
breaking, Korean UX writing, the Korean vocabulary people use for design ("깔끔하게", "감성적으로",
"토스 느낌"), and the patterns of Korean products in 2026.

## Staying in sync

The references are maintained in [CodexClaw](https://github.com/lidge-jun/codexclaw), where they ship
as `cxc-dev-frontend` and `cxc-dev-uiux-design`. A weekly workflow copies them here with a fixed set
of rewrites ([`scripts/lib/rules.mjs`](scripts/lib/rules.mjs)) and opens a pull request when anything
changed. [`upstream.json`](upstream.json) records the CodexClaw commit the skills match. The two
`SKILL.md` entry files are written for this repo and are never overwritten by a sync.

```bash
node scripts/sync-from-codexclaw.mjs --source ../codexclaw          # sync by hand
node scripts/sync-from-codexclaw.mjs --source ../codexclaw --check  # fail if out of date
npm install && npm run check                                         # frontmatter, links, leftovers
```

## Maintaining

Synced files under `skills/` are never edited by hand. Change CodexClaw, or add a rule to
[`scripts/lib/rules.mjs`](scripts/lib/rules.mjs), then sync from a clean clone of CodexClaw `main`:

```bash
git clone --depth 1 https://github.com/lidge-jun/codexclaw /tmp/codexclaw-main
node scripts/sync-from-codexclaw.mjs --source /tmp/codexclaw-main
npm install && npm run check
```

The weekly sync workflow needs "Allow GitHub Actions to create and approve pull requests" enabled
in the repository's Actions settings. When a sync is blocked by a new internal reference or a broken
link, the workflow opens an issue titled "Sync from CodexClaw is blocked" and closes it after the
next clean run. A release bumps the version in `package.json`, `.claude-plugin/marketplace.json`
and `.codex-plugin/plugin.json` together; the check fails if they differ.

## Credits and license

MIT, see [LICENSE](LICENSE). Parts of the references adapt or synthesize ideas from other skill
projects, including [taste-skill](https://github.com/Leonxlnx/taste-skill) and
[impeccable](https://github.com/pbakaus/impeccable); [NOTICE.md](NOTICE.md) lists each source and its license.
