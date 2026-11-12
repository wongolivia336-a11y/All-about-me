# Archive Index Refinement Implementation Plan

**Date:** 2026-11-12
**Status:** Approved; implementation complete, branch publication in progress
**Goal:** Refine the Archive Index into a polished first impression while preserving the four-leaf rotation and the existing Room route.
**Architecture:** Keep the current React Archive and route model. Replace only the leaf artwork with shallow React Three Fiber geometry, while preserving the DOM controls and outer rotation/drag behavior. Tune the existing room reveal timing and refine the Archive's white editorial layout around real work and configured links.
**Tech Stack:** React 19, TypeScript, React Three Fiber 9, Three.js, existing CSS, Vite. No new dependency.
**Spec:** [2026-11-12 Archive Index Redesign](../specs/2026-11-12-archive-index-redesign-design.md)

## Global constraints

- Work in `G:\实习\wongolivia336-a11y\all-about-me-room`, on the existing `codex/four-hearts-source-first-2026-11-11` branch.
- The worktree already contains extensive tracked and untracked work. Before editing overlapping files, inspect and record the complete current diff, including untracked files. Preserve all existing edits; do not reset, clean, or overwrite them.
- Keep this pass centered on the Index and its existing folded-corner transition. Do not redesign Room models, panels, or the Room project catalog.
- Use real project assets and links already present in the repository. Show only configured, working social/contact destinations; do not invent missing XHS, WeChat, LinkedIn, or public-account URLs.
- Keep DOM controls and labels accessible independently of WebGL. Respect keyboard navigation, touch/pointer cancellation, focus restoration, and `prefers-reduced-motion`; provide a static leaf fallback if WebGL cannot start.
- Do not add or run tests. Run the production build and inspect the local preview because the requested deliverable is a visual front-end revision.
- Before publishing, review the complete branch diff and stage only the reviewed portfolio changes. Preserve unreviewed or unrelated user work. The user's earlier request to push the reviewed portfolio update to GitHub remains in effect.

## Task 1: Audit the existing branch and protect current work

**Files:** The current tracked and untracked worktree; especially `study/src/App.tsx`, `study/src/PageTurn.css`, `study/src/brand/Heartwheel.tsx`, `study/src/brand/Heartwheel.css`, `study/src/brand/HeartTextTexture.tsx`, `study/src/ui/Archive.tsx`, `study/src/ui/LeafWorld.tsx`, `study/src/ui/LeafWorld.css`, `study/src/index.css`, and `study/src/ui/ArchiveResume.css`.

1. Capture `git status --short --branch` and inspect diffs for every tracked file that overlaps this work.
2. Read the existing new/untracked files in the planned scope before changing them; distinguish earlier portfolio work from this Index refinement.
3. Confirm the existing `Heartwheel` public props, drag/snap behavior, pointer cancellation, DOM label buttons, route/focus behavior, and the user's current Vercel/asset URLs.
4. Keep a short list of files that this pass will touch. If an existing change conflicts with the approved design, preserve it and resolve the conflict within the relevant component rather than replacing the file wholesale.

**Acceptance:** Existing edits remain intact, and the implementation scope is clear before code changes begin.

## Task 2: Give the rotating four-leaf mark controlled depth

**Files:** `study/src/brand/HeartwheelScene.tsx` (new), `study/src/brand/Heartwheel.tsx`, `study/src/brand/Heartwheel.css`, and `study/src/brand/HeartTextTexture.tsx` only if its SVG texture is no longer needed.

1. Build a shallow leaf surface from the existing heart/leaf silhouette using the installed Three.js and React Three Fiber stack. Use soft green material variation, a subtle center ridge, gentle directional light, and only enough edge thickness to read as a physical surface.
2. Render the four leaves at the existing angles so the clover continues to visibly rotate as a unit. Keep the existing spring snap and drag calculations as the motion driver; do not add a second spring or shader framework.
3. Make the canvas artwork decorative to assistive technology and pointer input. Preserve the existing DOM theme buttons, labels, hover/focus states, SVG hit areas where needed, and the `Heartwheel` callback/prop contract.
4. Use demand rendering where it does not break layout updates. Handle resize and hidden/focused states without leaving an always-running animation loop.
5. Keep the geometry and controls usable on touch and keyboard. Add a quiet static fallback if WebGL initialization fails, without hiding the theme controls.

**Acceptance:** The main mark reads as a fuller green four-leaf clover on pure white; all four leaves rotate and settle together; selection, drag, hover, keyboard focus, and screen-reader labels continue to work.

## Task 3: Refine the Archive first viewport and contact path

**Files:** `study/src/ui/Archive.tsx`, `study/src/ui/ArchiveResume.css`, and `study/src/i18n.tsx` only if bilingual copy needs adjustment. Revisit `study/src/index.css` only if its existing cascade overrides the Archive-specific styles.

1. Review the existing hero, theme stage, selected-work cards, footer, and project image references against the supplied FOUR HEARTS HTML and the approved white/green direction.
2. Tune first-screen hierarchy, spacing, clover scale, project-card crops, and the relationship between the introduction and the selected work. Use existing portfolio imagery rather than placeholder or generated project covers.
3. Make configured social/contact links easy to discover in the introduction or nearby contact area, with compact, accessible inline icons or marks. Use the current GitHub and Gmail destinations; omit destinations that are still unconfigured.
4. Keep the existing project data, links, Archive navigation, bilingual behavior, and right-corner Room entry intact. Do not expand or reorganize the Room catalog in this task.

**Acceptance:** On first load, a recruiter can identify Olivia, see the distinctive rotating mark, reach the selected work and valid contact channels quickly, and understand that the fold opens the Room. The page remains pure white with restrained green accents.

## Task 4: Smooth the Archive-to-Room page turn

**Files:** `study/src/App.tsx`, `study/src/ui/useRoomReveal.ts`, and `study/src/PageTurn.css`; adjust `study/src/ui/roomRevealGeometry.ts` only if visual inspection shows the existing upper-right reveal does not align with the folded corner.

1. Add a named duration for the top-level Archive/Room transition and pass it explicitly to the existing interruptible reveal driver. Target about 2.4 seconds for the opening and closing page-turn stages while keeping the existing room-preparation/loading state intact.
2. Keep `prefers-reduced-motion` behavior immediate/brief, retain browser back/forward hash routing, and preserve the existing focus handoff after a transition completes.
3. Keep the corner fold's hover/focus feedback coordinated with the reveal; avoid introducing a separate transition library or independent animation timeline.

**Acceptance:** Clicking the upper-right fold produces a continuous, deliberate reveal of the existing Room; returning to the Index feels equally paced; reduced motion, direct hash navigation, history navigation, loading, and keyboard focus remain correct.

## Task 5: Build and inspect the local preview

**Files:** No additional files unless a concrete issue is found in the planned scope.

1. Run `npm run build` from `study/`. Do not run the test scripts or add tests in this pass.
2. Use the existing local Vite preview if it is still serving `http://localhost:5175/#index`; otherwise start the dev server without disturbing another running process.
3. Inspect the first viewport, leaf rotation/selection, project/contact paths, the fold into Room and return, narrow viewport layout, and reduced-motion behavior. Fix only issues within the approved scope.
4. Re-run the build after implementation fixes and review the final diff for accidental Room changes or overwritten pre-existing edits.

**Acceptance:** The build completes, the requested local pages remain navigable, and the visible Index/Room transition matches the approved design at desktop and narrow viewport sizes.

## Task 6: Review and publish the branch update

**Files:** Only the reviewed files identified during Task 1 and changed by this branch's portfolio work.

1. Review `git diff` and untracked additions file by file; check that no credentials, local-only files, or unrelated changes are included.
2. Preserve changes outside the reviewed portfolio scope. Stage the reviewed portfolio update, create a descriptive commit on the existing feature branch, and push that branch to `origin` as requested earlier.
3. Report the commit, pushed branch, build result, and local/Vercel preview status. Do not merge to the default branch or deploy production unless separately requested.

**Acceptance:** The reviewed feature-branch changes are on GitHub, with a clear commit reference and a concise summary of anything intentionally left uncommitted.

## Review focus

- The new 3D canvas does not intercept the existing DOM controls or break pointer capture/drag cancellation.
- The four-leaf silhouette and rotation remain the strongest visual signature; the result has depth without a cartoon, glossy, or outlined look.
- The pure-white background remains white across themes and transition states.
- Only real portfolio assets and configured URLs appear; missing social destinations remain absent.
- Reduced motion, keyboard-only use, mobile layout, browser history, room loading, and focus return remain intact.
- All pre-existing dirty work remains preserved and is accounted for in the final diff review.
