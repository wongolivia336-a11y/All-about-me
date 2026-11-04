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
