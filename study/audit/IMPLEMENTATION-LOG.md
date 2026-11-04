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
11. **History-backed reading context** — `src/App.tsx`, `src/ui/Archive.tsx`, `scripts/rehearse-design-stress.mjs`
   - Reproduced a source-theme loss: QUESTION → open BUILD/BioAZ → Back returned to BUILD because plain `#index` parsed as the default theme.
   - Store theme and focused/overview mode with the matching history entry; store the source route with each in-app project detail entry. Back, Forward and refresh restore the same theme and expanded artwork.
   - Edge/CDP stress rehearsal: 11/11 passed, including rapid switches, real drag, project return, browser history and refresh.

Final verification after the latest source changes: `npm run lint`, `npm run build`, `npm run test:heartwheel`, `npm run test:room-reveal`, 11 design-stress checks, 18 project checks, 20 Room checks and 10 bilingual checks passed in Edge/CDP. Vite still reports the lazy RoomScene chunk above its 500 KB advisory threshold; see [REMAINING-ISSUES.md](REMAINING-ISSUES.md).

## Browser annotation follow-up — 2026-11-04

12. **Heartwheel keyboard focus** — `src/brand/Heartwheel.css`
    - Removed the rectangular focus outline and focus-only block fill. A short dark theme-ink underline now marks the focused label without boxing its copy.
13. **Paper corner hover** — `src/PageTurn.css`
    - Changed the flap from a flat rotate-and-translate to a restrained 3D hinge around its diagonal crease. The Room label stays in place; reduced-motion users see the resting fold.
14. **Room HUD controls** — `src/App.tsx`, `src/interaction/studyStore.ts`, `src/interaction/tactile.ts`, `src/scene/lamp/LampDimmer.tsx`, `src/i18n.tsx`
    - Removed the default-on tactile mute toggle and dead preference state. Press / detent feedback remains active; lamp power and brightness remain visible.
15. **Room return glyph** — `src/PageTurn.css`
    - Removed the hover/focus rotation that turned the “Return to Index” cross into a plus. The exit symbol keeps its meaning while the button surface responds.
16. **Comment-specific rehearsal** — `scripts/rehearse-comment-fixes.mjs`, `audit/evidence/annotation-follow-up/`
    - 5/5 Edge/CDP checks passed, including rest / mid-hover / settled captures, focus appearance, reduced motion, stable return glyph and the Room HUD.

See [ANNOTATION-FOLLOW-UP.md](ANNOTATION-FOLLOW-UP.md) for reproduction, decisions and reference-material limits.
