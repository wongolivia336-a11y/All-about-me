# Code Audit

## Confirmed implementation findings

| Location | Finding | Correction |
|---|---|---|
| `src/ui/Archive.tsx` / `src/App.tsx` | Project state changed the hash but did not move the nested `.archive` scroll container or move focus. Browser title remained generic. | Store source context, focus and scroll the detail, update title, and use history Back for in-app return. Direct-route close falls back to an archive route. |
| `src/ui/Archive.tsx` | Project detail used `role="tabpanel"` without tab semantics, and generic placeholder notes occupied the detail. | Use a labelled focusable `region`; render only real library data and links. |
| `src/data/library.ts` | Current project IDs reused older portfolio page thumbnails unrelated to several named projects; Film shelf lacked a visual. | Map each entry to its matching conceptual pair and preserve status/links. |
| `src/ui/Archive.tsx`, `src/index.css` | Detail image had a fixed HTML height attribute but no CSS height override; it rendered 474×1000. | Set `height: auto` while retaining its 1.6 source ratio. |
| `src/brand/Heartwheel.tsx` | `pointercancel` and lost pointer capture shared the successful gesture-commit path. | Add `cancelGesture`; cancellation suppresses synthetic click and returns to the prior target without selecting a theme. |
| `src/ui/LeafCanvas.tsx` / `.css` | The four tiles already stayed mounted, but supporting copy was repetitive and mobile pushed the matrix down. | Keep spatial model; remove redundant copy and tune title / wheel scale below 480px. |

## Architecture reconstructed

- `App.tsx` parses hash routes and owns Index ↔ Room transition state.
- `Archive.tsx` owns local selected theme, view mode and project detail; `library.ts` is the project data source.
- `LeafCanvas.tsx` keeps four images mounted; CSS transforms express overview/focus.
- `Heartwheel.tsx` rotates SVG leaves from click, drag and an interruptible animation loop.
- Room object focus is shared through `interaction/studyStore.ts`; hotspot labels and camera poses read `data/hotspots.ts`, which derives object targets from `scene/layout.ts`.
- `GlobalLoadingProvider` and `SpeechCodeLoader` manage the loading overlay; `RoomRevealSurface` uses the shared reveal progress.

## Repository baseline

The local nested repository started on `codex/room-object-routing` at `5723587`, one existing commit ahead of `origin/codex/room-object-routing` (`6f22615`). That ahead commit adds the current Leaf & Canvas index and is part of the intended feature state. The live site and local branch were not assumed to match; the live navigation symptom was checked separately and the local implementation was tested after changes.

## Known scope limits

No React profiler, browser performance trace, screen reader, Safari session, 375×667, 768×1024 or 1024×768 viewport was available in this pass. Runtime Room smoke checked the 12 non-lamp content surfaces, reveal, focus, Escape and browser history; it did not simulate every object hit point or the physical lamp dial.
