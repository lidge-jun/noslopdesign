---
name: cairn
colors:
  background: "#f1f2f4"
  surface: "#ffffff"
  ink: "#15171c"
  accent: "#c2401f"
  done: "#2c7349"
typography:
  heading: { fontFamily: "IBM Plex Sans Condensed", fontSize: "clamp(2.6rem, 1.1rem + 4.6vw, 5.25rem)", fontWeight: 600 }
  body: { fontFamily: "IBM Plex Sans", fontSize: "1.0625rem" }
  mono: { fontFamily: "IBM Plex Mono", use: "issue IDs, shortcuts, commit text" }
iconography:
  system: "custom inline SVG status glyphs"
  weight: "1.75px stroke"
  domain: "library-subset"
---

Reading this as: a SaaS landing page for leads of 3 to 25 person engineering teams, with an
engineering-manual language: IBM Plex, cool paper-gray ground, graphite ink, one vermilion accent.
Reference point: a well-kept internal handbook with a working tool embedded in it.

Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 4, density D4.
Reasoning: buyers are engineers who judge the tool by how fast it feels, so the hero is a working,
keyboard-driven issue list and the rest of the page stays plain and readable.

Reflex test: category default (dark, indigo glow, gradient text, Linear clone) rejected; the
fashionable opposite (cream paper plus display serif) rejected. Plex comes from the engineering
domain and carries mono IDs naturally.

Do's: show the product working; real issue titles a small team would write; one accent used for
the primary action, urgent priority and the stuck flag only; status shown by glyph shape plus label.
Don'ts: testimonials, logo walls or usage metrics we cannot back; gradients; feature card grids;
section eyebrows; em dashes.

Layout: left-aligned hero headline, full-width live demo below it (no split hero); the weekly
workflow as ruled rows with one artifact each; a Git section; a shortcut table; an honest
"left out on purpose" list; two unequal pricing plans; a signup form with inline validation.

Motion: three scroll moments (week rows reveal, burndown line draws, commit closes CRN-214), all
disabled under prefers-reduced-motion.
