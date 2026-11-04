# Issue Backlog

## FH-01 — Project detail opens outside the viewport

- **Priority:** P0 · **Evidence:** Confirmed on live site and local browser before correction
- **Location:** `src/ui/Archive.tsx`, `src/App.tsx`
- **Reproduction:** Scroll to Selected Works; open BioAZ.
- **Observed:** Hash changes while detail remains above the nested scroll viewport; body retains focus and title stays generic.
- **Root cause:** The app changed route state without positioning `.archive`, managing detail focus or updating document title.
- **Correction:** Scroll and focus the detail; store source card and scroll context; restore them on return; use history Back; support direct routes.
- **Files:** `src/App.tsx`, `src/ui/Archive.tsx`, `scripts/verify-project-navigation.mjs`
- **Acceptance:** Detail visible, title/hash match, source scroll/focus return, refresh and Back/Forward work.
- **Regression risk:** Stacked route updates and interrupted scroll; covered by browser regression.
- **Status:** **Fixed and verified.**

## FH-02 — Project covers misrepresent current projects

- **Priority:** P1 · **Evidence:** Confirmed by thumbnail/source audit
- **Location:** `src/data/library.ts`, `public/portfolio/`
- **Reproduction:** Compare current project names with `thumb-03` through `thumb-10` page content.
- **Observed:** Modern projects displayed old ReMap / WeaveCo portfolio pages; Film shelf had no cover.
- **Root cause:** Legacy thumbnails were reused for unrelated modern project IDs.
- **Correction:** Add seven relevant image pairs; disclose that they are conceptual; keep real URLs and project status.
- **Acceptance:** All 14 paths return 200; each theme shows its mapped image; detail preserves aspect and provenance caption.
- **Regression risk:** Added 5,909,212 PNG bytes total; review load behavior on slow devices.
- **Status:** **Fixed and verified.**

## FH-03 — Cancelled wheel gesture commits a theme

- **Priority:** P1 · **Evidence:** Confirmed by code path; touch-cancel behavior verified in Edge
- **Location:** `src/brand/Heartwheel.tsx`
- **Reproduction:** Start a horizontal touch drag and dispatch pointer cancellation.
- **Observed:** Cancellation could invoke the successful gesture commit path.
- **Root cause:** Pointer up, cancel and lost capture shared completion semantics.
- **Correction:** Distinguish cancellation and restore the prior target.
- **Acceptance:** Hash/mode unchanged and rotation returns to its starting angle.
- **Regression risk:** Drag completion / synthetic click interaction.
- **Status:** **Fixed and verified.**

## FH-04 — Project detail illustration stretches vertically

- **Priority:** P1 · **Evidence:** Confirmed in browser layout metrics
- **Location:** `src/ui/Archive.tsx`, `src/index.css`
- **Observed:** 1600×1000 art rendered at 474×1000 due the HTML height hint.
- **Correction:** CSS `height: auto`; preserve 1.6 ratio.
- **Acceptance:** Browser measured 474×296, with caption visible below.
- **Status:** **Fixed and verified.**

## FH-05 — Project case studies lack role and process evidence

- **Priority:** P1 · **Evidence:** Confirmed from supplied project records
- **Location:** `src/data/library.ts`, `src/ui/Archive.tsx`
- **Observed:** Data has summaries, year, type, status and links, but no per-project role, decisions, process or substantiated outcomes.
- **Root cause:** No source material for those details was provided in the artwork ZIP.
- **Correction:** Keep current detail compact and factual. Add case-study sections only after the author supplies evidence.
- **Acceptance:** Author-approved contribution, decisions and process visuals with real links.
- **Status:** **Open — requires project material.**

## FH-06 — Room still contains explicit placeholder copy

- **Priority:** P2 · **Evidence:** Confirmed in `src/data/content.ts`
- **Observed:** Reading list uses “书名占位”; poster and sketchbook copy describes placeholders.
- **Correction:** Replace with actual reading / poster / sketch materials when available.
- **Risk:** Inventing personal archive content would weaken authorship.
- **Status:** **Open — requires author content.**

## FH-07 — Bundle and asset performance need field measurement

- **Priority:** P2 · **Evidence:** Confirmed build warning; runtime metrics unverified
- **Observed:** RoomScene is 1,384 KB minified / 443.91 KB gzip; the 14 PNGs total about 5.64 MiB.
- **Correction:** Measure LCP/CLS/INP and request timing on target devices before deciding on code splitting or lossless asset conversion.
- **Status:** **Open — no performance improvement claimed.**

## FH-08 — Room reveal layers compete at the fold

- **Priority:** P1 · **Evidence:** Confirmed in component state and Edge mid-transition capture
- **Location:** `src/App.tsx`, `src/PageTurn.css`, `src/ui/PaperCorner.tsx`
- **Observed:** The old preview mask and the persistent corner trigger overlapped the Room reveal.
- **Root cause:** Preview state and trigger lifetime extended across the transition boundary.
- **Correction:** Remove the preview layer and mount the corner trigger only while Index is idle; keep one clipped reveal surface.
- **Acceptance:** Mid-transition has no paper corner or preview layer; Room becomes interactive after reveal.
- **Status:** **Fixed and verified.**

## FH-09 — Four Heartwheel leaves have persistent outlines

- **Priority:** P2 · **Evidence:** Confirmed in SVG / CSS and browser computed styles
- **Location:** `src/brand/Heartwheel.tsx`, `src/brand/Heartwheel.css`
- **Observed:** Every leaf and label button carried an idle outline / border.
- **Correction:** Remove decorative outlines and borders; retain `:focus-visible` for keyboard navigation.
- **Acceptance:** Zero outline paths and zero idle button border; visible keyboard focus remains.
- **Status:** **Fixed and verified.**

## FH-10 — Index and Room lack a shared bilingual mode

- **Priority:** P1 · **Evidence:** Confirmed in code; 10 Edge bilingual checks
- **Location:** `src/i18n.tsx`, `src/ui/LanguageSwitch.tsx`, Index / Room UI and canvas textures
- **Observed:** Page copy, project metadata, hotspots and generated screens could not follow one language selection.
- **Correction:** Add persisted EN / 中文 state and localized copy helpers across both views.
- **Acceptance:** Language stays selected across route changes; title, theme, project, hotspot and document-language values agree.
- **Status:** **Fixed and verified for authored UI; live third-party descriptions keep their source language.**

## FH-11 — Night Room panels inherit the wrong text color

- **Priority:** P1 · **Evidence:** Confirmed from computed browser color and screenshot
- **Location:** `src/index.css`
- **Observed:** Dark night panel background with dark text; the night language-tab selector also made Index tabs too light against paper.
- **Root cause:** `.app--evening` changed `--ink`, but `.app` inherited the root’s computed `color`; the language-tab night rule was scoped to every view.
- **Correction:** Set `.app { color: var(--ink) }` and scope the light switch colors to `.hud` in Room.
- **Acceptance:** Room panel text uses the light palette at night; Index tabs retain their dark palette regardless of time.
- **Status:** **Fixed and verified.**

## FH-12 — Room transition focus can run before its target mounts

- **Priority:** P1 · **Evidence:** Reproduced in Edge by a focus handoff check
- **Location:** `src/App.tsx`
- **Observed:** Exit focus sometimes remained on `body` after the Room reveal closed.
- **Root cause:** Focus was requested in the same animation-frame callback as state changes that mount the destination button.
- **Correction:** Defer pending transition focus to an effect that runs after the settled destination render.
- **Acceptance:** Room entry focuses Room exit; exit focuses the Room entry; browser Back / Forward remains usable.
- **Status:** **Fixed and verified.**

## FH-13 — Project return forgets the focused source theme

- **Priority:** P1 · **Evidence:** Confirmed in Edge by reproducing before and after the correction
- **Location:** `src/App.tsx`, `src/ui/Archive.tsx`
- **Reproduction:** On `#index`, focus QUESTION; scroll to Selected Works; open the BUILD project BioAZ; use the detail Back control or browser Back.
- **Observed:** Before correction, the project route showed BioAZ and the URL was valid, but return reconstructed plain `#index` as BUILD. The reader lost the theme and expanded content they came from.
- **Root cause:** Focused theme and focus mode existed only in the Archive component state; `routeFromHash("#index")` defaults to BUILD. The previous browser entry did not carry that state.
- **Correction:** Store a hash-matched route snapshot on each history entry, persist the project source route on its detail entry and hydrate Archive's focused theme/view mode from that route.
- **Files:** `src/App.tsx`, `src/ui/Archive.tsx`, `scripts/rehearse-design-stress.mjs`
- **Acceptance:** Project return, Back, Forward and refresh all restore QUESTION and its focused artwork; direct project routes remain valid.
- **Regression risk:** History state must stay paired with its hash across Index ↔ Room and project navigation; covered by Edge/CDP project, Room and stress rehearsals.
- **Status:** **Fixed and verified: 11/11 stress checks, 18 project checks and 20 Room checks passed.**
