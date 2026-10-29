# Olivia's Room

A personal digital space with two ways in:

- **Index** — the default, keyboard-friendly way to scan selected work.
- **Room** — available at `#room`, a deliberate spatial mode rather than a gate.

The two modes deliberately serve different needs: the Room carries personality; the Index lets a recruiter or collaborator understand the work without learning the room first. The browser history keeps the selected mode, so `#room` is shareable and Back returns predictably.

## Run locally

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Quality checks:

```bash
npm run lint
npm run build
```

## Content

Selected public work is registered in `src/data/library.ts`.

Each entry needs a collection, a year, one concise summary, and its real public links. Keep the public Index selective; it is not intended to become a raw mirror of every repository.

- `work` — finished or representative product/design work
- `research` — inquiry-led visualisation and knowledge work
- `make` — experiments, tools, and interaction studies
- `journal` — writing, once there is work ready to publish

## Structure

- `src/scene/RoomScene.tsx` — dynamically loaded Canvas boundary
- `src/scene/` — the 3D room, layout, materials, and camera choreography
- `src/interaction/` — room state and object interaction
- `src/ui/loading/LoadingManager.tsx` — shared real-work loading coordinator
- `src/ui/AsciiLoader.tsx` — full-viewport Canvas ASCII flow field
- `src/ui/Archive.tsx` — the accessible Index interface
- `src/data/library.ts` — curated portfolio content
- `src/data/hotspots.ts` — physical room objects and their focus positions
- `docs/3d-audit.md` — structural audit, debug overlay, collision method, and asset roadmap

The room should stay an experience, rather than becoming the only route to information. New content normally starts in `library.ts`; add or remap a room object only when the object gives it a meaningful physical metaphor.

## Loading sequence

The boot screen is a full-viewport Canvas ASCII field: cached glyph tiles,
typed-array flow state, and damped pointer impulses create a low-contrast,
generated character fabric. `GlobalLoadingProvider` owns real loading tasks
across the application; entering the Room waits for its committed Canvas frame
and reports R3F resource progress when assets expose it. There is no simulated
percentage or external ASCII conversion service. See
`docs/loading-sequence.md` for the loading API and performance limits.

## 3D development checks

The room is an open architectural diorama: its finite floor, wall thickness,
window opening and desk geometry live in `scene/layout.ts` and `scene/Shell.tsx`.
For development-only spatial checks, open one of these URLs while `npm run dev`
is running:

```text
/?debug=scene#room
/?debug=scene,wireframe#room
/?debug=scene,normals#room
/?debug=scene,shadows-off,postfx-off#room
```

See `docs/3d-audit.md` for the current verified issues, collision procedure,
lighting-state contract and GLB asset policy.

The lamp's physical dimmer is independently documented in
`docs/lamp-dimmer.md`. It uses a shared `lampPower` / `lampBrightness` control
state: the HUD range is an accessible 1% fallback, while the 3D dial owns its
own captured-pointer press/drag gesture.

Current object routes are intentionally limited to content that is already public:

- Laptop → Work
- Material tray → Make
- Whiteboard → Research

The sketchbook remains a private working object until there are Journal entries worth publishing. The 3D scene is dynamically loaded, so these room routes never increase the default Index bundle.
