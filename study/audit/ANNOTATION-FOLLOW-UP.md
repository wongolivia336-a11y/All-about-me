# Browser Annotation Follow-up — 2026-11-04

## FH-14 — Rectangular Heartwheel keyboard focus

- **Evidence:** Confirmed in `Heartwheel.css`; the square was the real `:focus-visible` outline. The vivid blue rectangle in the supplied browser comment capture is the annotation overlay, not site chrome.
- **Correction:** Remove the rectangular outline and focus-only filled block. Keep keyboard location visible with a short, high-contrast theme-ink underline beneath the label. Selected-theme fill remains the separate selection state.
- **Acceptance:** An unselected keyboard-focused label has no outline and no rectangular background; its underline is visible. Verified at 1440×900 in Edge.

## FH-15 — Paper corner moves as a rigid sticker on hover

- **Evidence:** Confirmed in `PageTurn.css`. The flap rotated in the page plane and translated left/down while its label slid independently, so the paper and its caption did not share a physical cause.
- **Correction:** Hinge the triangular flap about its diagonal crease with a small 3D lift, restrained shadow and crease response. Keep the button bounds and label position fixed. Remove the lift when reduced motion is requested.
- **Reference boundary:** The available `FourHearts_MonoColor_Art_Direction.zip` contains illustration assets, not a fold-motion reference. The earlier Handoff ZIP is no longer present in the download directory; this refinement follows the supplied browser capture and its described paper quality rather than claiming a direct frame match.
- **Acceptance:** Rest → mid-hover → settled hover changes the flap transform continuously, with no X/Y translation of the hinge or control and no label movement. Reduced Motion uses the settled shape without the expressive transform.

## FH-16 — Default-on tactile feedback occupies a permanent HUD control

- **Evidence:** Confirmed in `App.tsx` and the Room HUD. The only user-facing tactile setting muted feedback even though the shared state defaults to enabled; it sat beside the lamp's actual power control.
- **Correction:** Remove the global toggle and its unused muted state/translations. Keep press and detent feedback enabled at the existing interaction points. The HUD retains lamp power and brightness controls.
- **Acceptance:** Room HUD has one lamp icon control, a brightness range input and no tactile-feedback toggle. Existing lamp feedback calls still execute on the press and detent paths.

## FH-17 — Room return icon changes from “close” to “add” on hover

- **Evidence:** Discovered while framing the HUD after entering Room. The button is labelled “Return to Index,” but its `×` glyph rotated 45° into a `+` while hovered or keyboard-focused.
- **Correction:** Keep the cross fixed. The button's restrained surface feedback continues to acknowledge hover / focus without changing the symbol's meaning.
- **Acceptance:** On hover, the button remains labelled “Return to Index,” the two strokes retain their crossed transforms and the icon container has no rotation. Verified in Edge.

## Verification

- `node scripts/rehearse-comment-fixes.mjs` — 5/5 Edge/CDP checks passed: non-rectangular keyboard focus, continuous diagonal fold motion, reduced-motion settling, stable return glyph and Room control composition.
- Evidence: [`evidence/annotation-follow-up/`](evidence/annotation-follow-up/), including rest / mid-hover / settled detail crops captured at a 1440×900 viewport, a 3× fold close-up, keyboard focus, reduced motion, the Room HUD and JSON report.
- `npm run lint`, `npm run build`, `npm run test:heartwheel`, and `npm run test:room-reveal` passed. Build retains the existing large `RoomScene` chunk advisory.
