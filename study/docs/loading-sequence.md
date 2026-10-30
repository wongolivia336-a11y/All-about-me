# Global ASCII loading field

## Intent

The loading experience is a full-viewport, living ASCII portrait of Steve
Jobs—not a scaled photo or a fake progress screen. The portrait is first
rasterized into stable character-density arrays, then rendered entirely with
glyphs. A lower-contrast full-viewport field fills the remaining space, while
the portrait remains the visual subject through every frame.

## Architecture

```text
GlobalLoadingProvider
  ├─ explicit real-work tasks (begin / report / done / fail)
  ├─ AsciiLoader overlay and its enter/exit lifecycle
  └─ retry affordance for a failed task

App
  └─ Room task → RoomScene first committed frame
       └─ Drei useProgress → real R3F asset progress, when assets are present
```

`GlobalLoadingProvider` is mounted in `src/main.tsx`, so future routes and
async content can use `useLoading().begin(...)` without creating their own
overlays. Progress is stored only when a real loader exposes it; the UI never
invents a percentage.

## ASCII field

`src/ui/AsciiLoader.tsx` uses Canvas 2D and typed arrays for per-cell phase,
density, displacement, velocity and energy. The actual glyphs are cached into
small off-screen Canvas tiles whenever the viewport changes, avoiding repeated
text layout during each animation frame.

- `public/images/steve-jobs-macintosh.png` is sampled only when the source or
  viewport changes. It is never drawn to the visible Canvas.
- The resulting `portraitDensity` map stays immutable during animation; flow
  and pointer energy only change glyph position, tone and opacity around it.
- The face has an additional motion shield. Its character values stay stable,
  while the surrounding room can breathe more freely.
- Rows are staggered to form a subtle scale / textile rhythm.
- Three offset, low-frequency waves make density and drift vary by location.
- Dark masks are stable across frames, preserving negative space instead of
  producing a wall of random characters.
- Pointer movement adds a bounded local velocity field; spring restoration and
  damping let repeated passes overlap and fade naturally.
- DPR is capped at 1.5 on desktop and 1.25 on small screens. On mobile the
  source crops only peripheral room detail, keeping Steve and the Macintosh
  complete at a denser character resolution.
- `prefers-reduced-motion` draws a static field and does not retain a RAF loop.

## Transitions and failures

The field waits until the local portrait has been sampled, then keeps a short
visual handoff so the subject is visible even after a very fast app-shell
paint. On completion, interaction is released immediately; the Canvas field
settles and fades without exposing a blank frame.

Tasks can call `fail(message, retry)` to retain the field and expose a compact
Retry action. The current Room path starts a task when the Room is requested,
reports Drei's real asset progress when available, and completes only after the
Canvas has committed its first frame.
