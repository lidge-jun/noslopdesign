---
name: 셈 (Sem)
colors:
  primary: "#0E6B4E"   # ledger green: CTA, active filter, focus
  ink: "#14191B"
  muted: "#566164"
  line: "#DCE1DF"
  background: "#FFFFFF"
  shade: "#F3F5F4"
  loss: "#B42318"      # semantic only: money missing
  pending: "#8A5A00"   # semantic only: payout late
typography:
  heading: { fontFamily: Pretendard, fontSize: "clamp(2.1rem, 1.3rem + 3vw, 3.75rem)", weight: 700, lineHeight: 1.3 }
  body: { fontFamily: Pretendard, fontSize: "1.0625rem", lineHeight: 1.7 }
  numbers: { fontFamily: "JetBrains Mono", feature: tabular-nums }
iconography:
  system: "inline SVG, 1.75px stroke"
  weight: regular
  domain: custom
---

Reading this as: a Korean B2B SaaS landing page for small online sellers who sell on several marketplaces,
with the language of an accountant's ledger: ruled lines, right-aligned figures, one ink colour, one pen colour.

Do's: show the real artifact (a reconciliation table) as the hero; let red mean "money missing" and nothing else;
plain 해요체 copy that names amounts and dates.
Don'ts: no gradients, no glow, no icon-tile feature cards, no invented customer counts, logos or testimonials.

DESIGN_VARIANCE: 6
MOTION_INTENSITY: 5
Product density profile: D3
Reasoning: marketing page for a finance-adjacent tool, so calm and exact, with the product table carrying the visual weight.

Motion: signature = hero rows resolve from "대조 중" to their result on load; supporting = step rule fills on scroll,
sections rise in once. All disabled under prefers-reduced-motion.
