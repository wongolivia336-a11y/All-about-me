# Global ASCII loading field

## Intent

The loading experience is a full-viewport, generated typographic field—not a
scaled photo or a fake progress screen. Dense, staggered ASCII glyphs form a
quiet fabric that gains and loses density through a layered, deterministic flow
field. It stays deliberately low-contrast so it can reveal either the Index or
the Room without a visual jump.

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

- Rows are staggered to form a subtle scale / textile rhythm.
- Three offset, low-frequency waves make density and drift vary by location.
- Dark masks are stable across frames, preserving negative space instead of
  producing a wall of random characters.
- Pointer movement adds a bounded local velocity field; spring restoration and
  damping let repeated passes overlap and fade naturally.
- DPR is capped at 1.5 on desktop and 1.25 on small screens. Grid density is
  reduced on mobile.
- `prefers-reduced-motion` draws a static field and does not retain a RAF loop.

## Transitions and failures

The field waits for a real app-shell paint or an explicit task, then keeps a
short visual handoff only to avoid a flash on very fast loads. It never blocks
on a noncritical image. On completion, interaction is released immediately;
the Canvas field settles and fades without exposing a blank frame.

Tasks can call `fail(message, retry)` to retain the field and expose a compact
Retry action. The current Room path starts a task when the Room is requested,
reports Drei's real asset progress when available, and completes only after the
Canvas has committed its first frame.
