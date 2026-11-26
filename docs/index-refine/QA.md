# Index Refactor QA

## Post-refactor checks

| Check | Result | Notes |
|---|---|---|
| `npm run lint` | Pass | Oxlint completes without findings. |
| `npm run build` | Pass | TypeScript and Vite production build pass. Existing Room / Three.js chunks remain above Vite's 500 kB advisory threshold. |
| `npm run test:room-reveal` | Pass | Existing Room reveal and Leaf & Canvas spatial assertions pass. |
| `npm run test:heartwheel` | Fail (pre-existing) | The verifier still expects a `.paper-corner` rule in `PageTurn.css`; current PaperCorner B4 styles do not use that selector. The same failure exists at baseline and is outside Index scope. |
| `git diff --check` | Pass with CRLF-aware setting | Use `git -c core.whitespace=cr-at-eol diff --check` for this Windows checkout. |
| Local preview HTTP | Pass | `http://127.0.0.1:5178/#index` responds HTTP 200 from the feature worktree. |
| Room prop source/build review | Pass | Five Room files contain the requested Happy Mac, coffee mug and polaroid changes; lint, TypeScript and production build pass. Visual calibration in a stable WebGL browser is still pending. |
| Desktop / mobile screenshots | Incomplete | Edge headless produced only the startup loader at 1440px and failed during GPU initialization in subsequent attempts. Those loader-only images were discarded; no screenshot is presented as a page review. |
| Manual interactions / responsive widths | Not completed | This environment did not provide a stable browser renderer. Check the feature preview at 360, 390, 768 and 1280/1440px, including both locales, project archive disclosure, project detail return, Quick Read routes, Journal reader, Room entry, keyboard focus and reduced motion. |

## Static preservation review

- `Archive.tsx` still derives the featured set and complete portfolio index from the existing `library` data. All 12 portfolio entries with a `portfolioOrder` remain in the index data; only entries marked `featured` appear in the three-card Selected Work section.
- About routes still call the existing Quick Read handlers for Experience, Education and Selected Work. The badge, folder, poster and project-detail implementations were not modified.
- The existing Journal section/reader, hash route handlers and return-focus/scroll state were not changed.
- Heartwheel, PaperCorner, page-turn transition and Room navigation were not modified. The later combined release changes only `LaptopDesktop.css`, `LaptopDesktop.tsx`, `Objects.tsx`, `layout.ts` and `theme.ts` for the requested Mac display, coffee cup and photo placement.
- The shared Happy Mac bitmap feeds both the distant CRT and interactive desktop. The mug uses a 72-segment lathe, a coffee surface, a surface-conforming text plane and a hover note in both languages. The polaroid position is adjacent to the camera's desk position.
- New project archive controls have localized labels, `aria-expanded`, `aria-controls`, a hidden/inert collapsed region, a close action and focus return to the disclosure button.

These are source-level checks, not substitutes for the pending real-browser interaction pass.

## Known build advisory

Vite reports `three.module` at roughly 725 kB and `RoomScene` at roughly 756 kB minified. The prop refinement does not add dependencies or split the existing Room payload.
