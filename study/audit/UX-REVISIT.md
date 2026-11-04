# UX Revisit — Fold, Heartwheel, Bilingual UI

Date: 2026-11-04
Browser: Microsoft Edge via DevTools Protocol
Local preview: `http://127.0.0.1:5174/`
Evidence status uses **Confirmed** for findings directly reproduced in code or browser, **Design critique** for judgement, and **Unverified** for unavailable coverage.

## Findings and changes

### Confirmed — competing fold layers

The top-right Room corner stayed mounted as the reveal began, and a separate preview mask added another clipped surface. Their edges and stacking overlapped. The preview state and mask are removed; the corner trigger mounts only while Index is idle. The Room reveal remains one continuous `clip-path` surface and disables Room input until the reveal settles.

Evidence: [mid-transition, 1440×900](evidence/ux-revisit/room-reveal-mid-1440x900.png). The browser report confirms that the corner and preview layer are absent while reveal progress is between zero and one.

### Confirmed — decorative leaf outlines

All four leaf SVGs had a permanent outline, and the overlaid theme buttons also drew borders. Both idle outlines and button borders are removed. Selection continues to use fill and scale; keyboard `:focus-visible` retains an explicit outline so keyboard users still see focus.

### Confirmed — language state split across surfaces

The site now exposes EN / 中文 controls in the Index identity bar and the Room HUD. A shared provider persists the selection, sets `document.documentElement.lang`, and updates authored labels and copy across the hero, theme navigation, project cards/details, Room hotspots/panels and generated device screens. Mobile switch controls have a 44px minimum height.

Native names, product brands, and live GitHub API descriptions remain in their source language. The book list retains clearly marked source placeholders pending the author's real content.

### Confirmed — night palette did not reach Room text

The night state changed `--ink` on `.app--evening`, but `.app` inherited the root's already-computed `color`. A broad night switch selector also turned the Index language tabs white against its light paper. Binding `.app` to `color: var(--ink)` makes Room panel text follow the night palette; scoping the pale tab colors to the Room HUD keeps the Index tabs dark. The Chinese Room-panel screenshot and computed colors are retained.

### Confirmed — transition focus race

The old callback requested focus in the same animation frame that changed transition state. On return, the Index entry button was not always mounted when the callback ran. A pending-focus effect now waits for the destination route to settle and its button to exist before moving focus. Edge confirmed focus to Room exit on entry and back to Room entry on exit.

### Confirmed — project return lost the visitor's theme

Reproduction: focus QUESTION, scroll to Selected Works, open the BUILD project BioAZ, then use the project return control or browser Back. Before the correction, the project URL correctly represented BioAZ, but its previous `#index` entry did not encode the in-memory QUESTION focus. Route parsing therefore reconstructed the default BUILD state. The visible project content and its return destination had different themes.

The route now records the focused theme and view mode in the matching browser history entry while keeping the authored hash readable. Project history entries carry their source route. `Archive` restores the selected theme and focus mode from that route; Back, Forward and refresh therefore resolve to the same source context. This keeps the existing `#index` share URL and avoids adding one Back step for every leaf selection.

Evidence: `evidence/design-stress/design-stress-report.json` verifies the corrected return; matched settled frames are in [before](evidence/design-stress/source-theme-before-project-1440x900.png) and [after](evidence/design-stress/source-theme-after-project-return-1440x900.png).

## Choreography and interaction review

| Phase | Observed / intended relationship |
|---|---|
| Input | Corner click immediately enters the Room route and removes the corner control. |
| Acknowledgement | One reveal surface begins from the upper-right corner; no separate preview silhouette competes with it. |
| Movement | The same clip path grows from a small corner intersection to cover the viewport. |
| Arrival | Room input remains disabled until the surface settles; focus moves to the visible Room exit. |
| Return | The reveal reverses from its current progress; after the Index control mounts, focus returns to the corner entry. |
| Reduced motion | Reveal progress snaps to its target; theme tile/copy movement and language-switch transitions become static. |

The four-leaf control now communicates selection through the existing filled shape and emphasis. A focus ring appears only for keyboard focus. Project detail remains a reading state within the archive and receives focus after scrolling into view.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed; Vite still warns that the lazy RoomScene chunk exceeds 500 KB.
- `npm run test:heartwheel` — passed.
- `npm run test:room-reveal` — passed.
- Edge/CDP bilingual rehearsal — 10/10 checks passed, including language persistence, Chinese theme/project/Room copy, no overlay during the reveal, zero uncaught exceptions, night text contrast, reduced motion, mobile overflow and control sizing.
- Edge/CDP Index/project regression — 18/18 checks passed, including all four themes, selected-work detail, direct route, Back/Forward, touch cancellation, reduced motion and 390×844 overflow.
- Edge/CDP Room regression — 20/20 checks passed, including all 12 non-lamp content surfaces, entry and exit focus, Escape, Back/Forward and zero uncaught exceptions.
- Edge/CDP design stress rehearsal — 11/11 checks passed: rapid theme changes, same-theme overview toggle, ArrowRight focus, project source-theme return, Back/Forward, refresh, real mouse drag and no ghost click.

Screenshots and JSON reports are in [`evidence/ux-revisit/`](evidence/ux-revisit/), [`evidence/after-final-bilingual/`](evidence/after-final-bilingual/) and [`evidence/after-final/`](evidence/after-final/).

## Unverified

The supplied Vercel preview URL redirected the live browser to Vercel SSO during this pass, so current deployed behavior could not be compared directly. The checked source was rehearsed locally in Edge at the recorded viewports. Physical phone and Safari behavior, other mobile/tablet sizes, full screen-reader review, physical 3D hotspot hit targets, frame-by-frame camera motion, FPS / Web Vitals / GPU cost, and project-specific author role/process/outcomes remain unverified. See [REMAINING-ISSUES.md](REMAINING-ISSUES.md).
