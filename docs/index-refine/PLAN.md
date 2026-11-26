# Index Quiet Editorial Refactor Plan

## Phase A — baseline

- Keep the original canonical worktree and its unrelated local changes intact.
- Create a named backup ref and feature branch from the canonical HEAD.
- Record route, content, interaction and build/test baselines.
- Commit baseline documentation before changing product source.

## Phase B — information hierarchy

- Keep the Hero and four-world Heartwheel together as the first section.
- Put Selected Work next, with only BioAZ Agent Workbench, KNOCK KNOCK and Qiaopi.
- Keep the other nine projects in an explicit, keyboard-accessible full archive disclosure.
- Replace the home Quick Read card trio with one concise About section and three direct entries into the existing Experience, Education and Selected Work pages.
- Put Journal after About and keep the existing paper and reader routes intact.
- Fold contact paths into the Footer. Keep the independent Room paper corner and `#room` route untouched.

## Phase C — editorial visual refinement

- Reduce duplicated copy and wrapper layers while retaining the existing cover assets and project hover/detail transitions.
- Keep the white canvas, typographic contrast and current Four Hearts accents; limit glass treatment to small controls already in the design system.
- Retain the current responsive layout and focus/reduced-motion rules; refine only Index-specific spacing and disclosure presentation.

## Phase D — verification and handoff

- Run lint, TypeScript/production build, and existing Heartwheel and Room reveal checks.
- Exercise 360, 390, 768 and 1440 px layouts, English/Chinese navigation, all twelve project entries, Quick Read, Journal, Room corner and reduced-motion behavior.
- Save before/after screenshots when the local browser renderer can capture the WebGL/Canvas page; document any environment limitation instead of presenting a fabricated capture.
- Commit information hierarchy and visual refinement separately. Do not merge, push or deploy.

