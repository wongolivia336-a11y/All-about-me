# Implementation Log

## 2026-11-04

1. **Project reading continuity** — `src/ui/Archive.tsx`, `src/App.tsx`
   - Added detail reading position, accessible region focus, title synchronization, return focus/scroll restoration and history-aware close behavior.
   - Reproduced and corrected the Selected Works scroll bug.
2. **Mono-color art mapping** — `src/data/library.ts`, `public/portfolio/mono/`
   - Added 14 PNGs (seven wide + seven landscape), total 5,909,212 bytes.
   - Labeled them conceptual art in project detail; preserved original documentary pages and external project links.
3. **Image and mobile layout** — `src/ui/Archive.tsx`, `src/ui/LeafCanvas.tsx`, `src/ui/LeafCanvas.css`, `src/index.css`
   - Restored detail art aspect ratio, removed duplicate instructions/facts and improved the 390px first viewport.
4. **Gesture cancellation** — `src/brand/Heartwheel.tsx`
   - Pointer cancellation now restores the current target without selecting a theme.
5. **Audit assets** — `audit/evidence/after-final/`, `scripts/verify-project-navigation.mjs`, `scripts/verify-room-path.mjs`
   - Captured consistent desktop/mobile screenshots and JSON browser reports.

## Verification

- `npm run lint` — passed.
- `npm run test:heartwheel` — passed.
- `npm run test:room-reveal` — passed.
- `npm run build` — passed; existing Vite warning remains for the 1,384 KB RoomScene chunk.
- `node scripts/verify-project-navigation.mjs after-final` — 18 checks passed in Edge/CDP.
- `node scripts/verify-room-path.mjs` — 20 checks passed in Edge/CDP; 12 non-lamp Room content surfaces, Escape, Room/Index focus, Back/Forward and zero uncaught exceptions.

Browser conditions: local Vite app, Edge DevTools Protocol, DPR 1; Index at 1440×900 plus 390×844; Room at 1280×800. Room evidence screenshot explicitly sets day mode for visibility. No network/CPU throttle was applied.

## UX revisit — 2026-11-04

6. **Single-layer Room reveal** — `src/App.tsx`, `src/PageTurn.css`, `src/ui/PaperCorner.tsx`
   - Removed the redundant preview mask and limited the top-right fold trigger to idle Index. Captured a mid-transition frame.
7. **Heartwheel control clarity** — `src/brand/Heartwheel.tsx`, `src/brand/Heartwheel.css`
   - Removed permanent leaf strokes and idle button borders; keyboard focus styling remains.
8. **Persistent bilingual UI** — `src/i18n.tsx`, `src/ui/LanguageSwitch.tsx`, Index / Room components, `src/scene/theme.ts`
   - Added EN / 中文 tabs with local storage persistence, translated authored UI and project records, and regenerated device screen textures when the language changes. Mobile controls have 44px touch height.
9. **Night contrast and route focus** — `src/index.css`, `src/App.tsx`
   - Bound app text to the active palette and moved Room entry/exit focus handoff to the settled destination render.
10. **Rehearsal evidence** — `audit/evidence/ux-revisit/`, updated browser verification scripts
   - 10 bilingual checks, 18 Index / project checks and 20 Room checks passed in Edge/CDP.

Final verification after the latest source changes: `npm run lint`, `npm run build`, `npm run test:heartwheel`, `npm run test:room-reveal` and `git diff --check` passed. Vite still reports the lazy RoomScene chunk above its 500 KB advisory threshold; see [REMAINING-ISSUES.md](REMAINING-ISSUES.md).
