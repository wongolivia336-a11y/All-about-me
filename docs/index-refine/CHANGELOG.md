# Index Refactor Changelog

## Baseline — 2026-11-26

- Recorded canonical base commit `381c5b802b46c860902f9cb324d90dc5c737fa91`.
- Created backup ref `backup/index-before-editorial-2026-11-26` and isolated branch `feat/index-quiet-editorial-refine`.
- Documented the current Index order, routes, assets and interaction owners.
- Preserved the original worktree's uncommitted Room edits and untracked notes.
- Baseline lint, production build and Room reveal checks pass. The existing Heartwheel test has a stale PaperCorner CSS assertion.
- Local desktop/mobile screenshot capture is pending: Edge headless exits during GPU initialization before writing files.


## Phase 2 — 2026-11-26

- Removed the homepage Quick Read metallic-card block and the separate contact band.
- Retained the underlying Experience, Education and Selected Work pages, now reachable from a small About index.
- Kept the three existing featured projects and moved the remaining project list behind an accessible disclosure; the complete 12-item dataset and detail links remain unchanged.
- Moved Journal below About to match the requested reading order. Hero social/contact actions now live in the footer.
- Added bilingual disclosure copy and an in-list close action with focus return.
- Validation at this phase: lint and production TypeScript/Vite build pass; the existing Three.js chunk-size warning remains.

## Phase 3 — 2026-11-26

- Reduced the Selected Work spacing and replaced the rounded glass hover tag with a quiet square-corner editorial label; existing grayscale-to-color, image zoom and detail transitions remain in their original components.
- Reworked About as a compact three-column editorial section with direct links into the existing Experience, Education and Selected Work routes.
- Rebuilt the footer as a single restrained contact row, removed the duplicate GitHub text link and cleared selectors/styles belonging to the removed homepage contact and Quick Read blocks.
- Kept the original cover art, project data, Journal paper/reader, Heartwheel and Room navigation implementations.
- Lint, build and Room reveal verification pass. The existing Heartwheel verifier retains its stale PaperCorner CSS assertion. Stable Edge screenshots/manual interaction checks remain blocked by the local headless GPU failure; see `QA.md`.

## Room refinements — 2026-11-26

- Combined the requested Index release with the pending desktop-object refinements from the canonical local worktree, without staging or modifying that original worktree.
- Reused one shared 1-bit Happy Mac bitmap for the Macintosh CRT's distant screen and its interactive desktop wallpaper.
- Replaced the mug mesh with a 72-segment lathed, hollow ceramic form; added coffee, a restrained rim detail and a curved `DAMN GOOD COFFEE` decal with a bilingual David Lynch / Agent Cooper hover note.
- Moved the polaroid stack to sit beside the camera. Other Room objects and interaction handlers remain unchanged.
- Lint, TypeScript/production build and `test:room-reveal` pass. The established `test:heartwheel` PaperCorner CSS assertion remains stale. Real-browser visual checks are still pending due the local Edge GPU failure.
