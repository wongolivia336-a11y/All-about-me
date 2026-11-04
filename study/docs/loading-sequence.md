# Loading, page turn and Four Hearts

## Intent

The site has two modes: the fast, structured Index and the slower spatial Room.
The loading layer is a visual handoff between them, not a simulated progress
bar. Its typography echoes the Four Hearts mark while keeping the page ready
as soon as real work is complete.

## Architecture

```text
GlobalLoadingProvider
  ├─ app-shell and Room resource tasks
  ├─ two-frame Index handoff task
  ├─ Page turn task, begun before either view folds away
  └─ SpeechCodeLoader overlay, retry and Return to Index affordances

App
  ├─ Room / Index page sheet + upper-right folded corner
  ├─ page turn over the Four Hearts glyph field
  └─ Room task → RoomScene first committed frame
```

The loader uses the deterministic clover glyph artwork from
`src/data/clover.ts`. It does not embed the full Steve Jobs speech or invent a
percentage. The current visual exposure is 1200ms for ordinary motion and
280ms for reduced motion, followed by a 360ms fade. The page fold remains
interruptible at the application state level, and browser history uses the
same hash transition.

## Field and performance

`SpeechCodeLoader.tsx` renders a small deterministic glyph set on a 2D canvas.
It fits once per size change, paints at a bounded cadence, responds to pointer
proximity, and stops its animation loop when reduced motion is active or the
document is hidden. The loader is not a WebGL surface and does not increase the
initial Room cost.

`useLoading().begin(label)` tracks real work. A task may report measured
progress or call `fail(message, retry)`; the UI does not invent a percentage.
Room resources are observed through Drei's progress hook, and a failed Room
load exposes both retry and Return to Index actions.
