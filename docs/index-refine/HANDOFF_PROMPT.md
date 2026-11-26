# Handoff Prompt — FOUR HEARTS Index + Room Refinement

You are continuing a combined FOUR HEARTS Index and 3D Room refinement. Work from the current feature branch in the isolated worktree, not the older `G:\实习\wongolivia336-a11y` checkout or the original canonical worktree.

## Current source of truth

- Worktree: `D:\.cache\codex\visualizations\2026\11\16\01a1e1ec-cf3c-7f03-b63e-4fb4f81a4344\index-quiet-editorial-refine`
- Branch: `feat/index-quiet-editorial-refine`
- Baseline commit: `381c5b802b46c860902f9cb324d90dc5c737fa91`
- Baseline backup ref: `backup/index-before-editorial-2026-11-26`
- This feature has separate baseline, IA and visual-refinement commits plus a follow-up Room polish commit. Read `BASELINE.md`, `PLAN.md`, `PRESERVATION_MATRIX.md`, `CHANGELOG.md` and `QA.md` before touching code.
- The original canonical worktree has pre-existing uncommitted 3D Room code and local design notes. Do not overwrite, reset, clean, or move those files.

## Requested design and scope

The Index flow is Hero / four worlds → Selected Work → About → Journal → Footer. Show BioAZ Agent Workbench, KNOCK KNOCK and Qiaopi as the three featured works. Keep every ordered project available in the complete project archive. Keep the current About links into Experience badges, Education folder and Selected Work posters. Keep the existing Journal reader, paper interaction, routes and return state. Preserve the four-leaf navigation, PaperCorner, `#index` / `#room`, room transition, all existing project covers and details, and the bilingual system.

The combined release also refines only these Room elements: one shared 1-bit Happy Mac bitmap on the distant CRT and interactive desktop wallpaper, a 72-segment hollow ceramic mug with coffee and curved `DAMN GOOD COFFEE` text plus a bilingual Lynch / Agent Cooper hover note, and the polaroid stack moved beside the camera. Preserve the existing Macintosh desktop shortcuts, phone app flips and QR cards, portfolio hotspots, posters, room controls and all other Room interactions.

Do not expand the design scope beyond those Index and Room changes. Do not merge to `main` or deploy. The feature branch push is explicitly authorized for the current task; obtain fresh authorization before any later push.

## Required next work

1. Finish the real-browser review of the feature branch at 360, 390, 768, 1280 and 1440 px in English and Chinese.
2. Exercise the project archive disclosure with keyboard and pointer, open/close project details, About's three Quick Read destinations, Journal open/return/focus/scroll, the top navigation, Room corner / return, and Room hotspots including the Mac desktop and phone QR-card flips. Check reduced motion.
3. Capture truthful before/after desktop and mobile screenshots. Headless Edge in the original implementation session displayed only its startup loader and then failed GPU initialization; the attempted loader-only screenshots were discarded. Do not present those images as page evidence.
4. Record the browser, accessibility and responsive findings in `QA.md` and update the preservation matrix only for interactions actually exercised.
5. Keep the known `test:heartwheel` stale `.paper-corner` assertion and existing Three.js chunk-size advisory accurately documented unless separately authorized to fix them.
6. Do not delete `QuickRead.tsx` or assets based on lack of homepage usage; preserve the existing routes and archival assets.

Before any action on `main`, GitHub or deployment, get explicit authorization from Olivia.
