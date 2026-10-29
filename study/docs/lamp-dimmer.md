# Physical lamp dimmer — implementation audit

## Scope

This pass changes only the physical lamp control chain:

```text
HUD control ↔ studyStore ↔ LampDimmer ↔ DeskLamp / PostFX
```

It does not alter room layout, navigation, other hotspots, or unrelated scene
assets.

## Confirmed defects in the previous implementation

| Hypothesis | Finding | Change |
| --- | --- | --- |
| H1 Pointer capture | Confirmed: drag lifecycle lived in `window` listeners rather than the hit object. | The dial hit target now captures and releases its active R3F pointer. |
| H2 Cancel | Confirmed: `pointerup` and `pointercancel` shared `release()`, so a cancelled press toggled power. | Cancellation releases safely, restores an interrupted drag, and never toggles. |
| H3 Hotspot conflict | Confirmed risk: the parent lamp Hotspot owned a click action while the dial was nested inside it. | Every dial event stops propagation; the lamp body now focuses rather than toggles power. |
| H4 Mobile mapping | Confirmed: only `clientX` was considered and the threshold was 4 px. | Pointer type has its own 6 px mouse / 8 px touch threshold and a calibrated diagonal drag mapping. |
| H5 State coupling | Confirmed: one setter changed brightness and `lampOn`. | `lampPower`, `lampBrightness`, and `lastNonZeroLampBrightness` now have separate semantics. |
| H6 Angle legibility | Confirmed: a mostly featureless brass disk had a short 89° visual range. | 260° range, indicator line, stationary scale ring, knurling and stronger CMF contrast. |
| H7 Audio unlock | Needs device verification. The old code resumed a context, but only made oscillator tones. | Feedback is still user-gesture initiated, resumes one shared context, and uses throttled noise/mechanical transients. |
| H8 Camera competition | Needs touch-device verification; it was not explicitly managed. | `CameraControls` is disabled only during an active dial pointer. |
| H9 Auto-initialisation | Confirmed: nighttime initialisation called the lamp setter. | The time-of-day effect no longer changes physical lamp power or brightness. |

## Interaction specification

```text
Idle
  └─ pointerdown (first pointer only) → Press candidate + capture
       ├─ move ≥ threshold → Dragging, continuous brightness update
       ├─ release ≤ 450 ms → power toggle once
       ├─ release after drag → retain brightness, no toggle
       └─ pointercancel → restore starting brightness, no toggle
```

- Short press: the dial moves down 1.8 mm, triggers one mechanical click on
  release, then returns without overshoot.
- Drag: brightness is continuous and clamped to `0…1`; the HUD range uses a
  1% step and reads the same source of truth.
- Off state: drag can choose a next brightness but does not power the lamp.
- Restore: pressing power on restores the dial's saved non-zero setting.
- HUD power: changes the same switch state, makes the dial perform one short
  mechanical dip, and uses the same optional press feedback.
- Detents: 16 evenly distributed feedback landmarks only; they never quantise
  the brightness value.
- Multi-touch: only the initial pointer is accepted. Later pointers are
  stopped and cannot duplicate the action.

## Mechanical and CMF decisions

| Part | Treatment |
| --- | --- |
| Top cap | Low-reflection, sandblasted warm silver `#a9adaa`; a shallow shoulder creates the bevel without a decorative ring |
| Side wall | Darker grey-green metal `#707775`, with 36 almost-flush machined knurl ridges rather than block-like teeth |
| Fixed ring | A two-layer dark-metal well and scale plate, with 15 stationary calibration marks seated on the plate |
| Indicator | Graphite radial line, carried by the rotating dial |
| Accent | No separate bright accent ring: the silhouette and graphite indicator provide the readout hierarchy |
| Motion | 260° range, damped rotation, no forced visual detent snapping |

## Performance behaviour

- `DeskLamp` reads effective light output inside `useFrame`, so pointer moves
  do not React-rerender the lamp geometry.
- Other room consumers use focused selectors rather than subscribing to every
  brightness change.
- The HUD and post-process layer update from the shared store because they
  must visibly track the setting.
- Knurling and calibration ticks use `InstancedMesh`; no physics library or
  per-tick geometry allocation is introduced.
- Mechanical audio owns one lazily-created `AudioContext`; rapid ticks are
  merged inside a 34 ms window and sources disconnect when finished.

## Verification status

Performed in this environment:

```text
npm run lint     PASS
npm run build    PASS
```

The local server returned HTTP 200. The available headless browser cannot
start its GPU process, so it cannot render this WebGL canvas. Consequently,
desktop screenshot, before/after capture, real iPhone Safari, Android Chrome,
draw calls and frame-time measurements remain **unverified**, rather than being
reported as passed.

Use a GPU-capable device to run this focused checklist before merging:

1. Press once, double press, long stationary press, and press after dimming to
   zero.
2. Drag from 20% to 80% slowly; check the HUD, indicator, filament, shade and
   desk pool move continuously together.
3. Drag quickly to both end stops and reverse direction.
4. Cancel an in-progress touch; ensure brightness returns and power is stable.
5. Use a second finger while dragging; it must not change state.
6. Repeat in iPhone Safari and Android Chrome, including muted feedback and
   reduced-motion preference.
