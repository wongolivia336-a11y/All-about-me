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
- `src/ui/Archive.tsx` — the accessible Index interface
- `src/data/library.ts` — curated portfolio content
- `src/data/hotspots.ts` — physical room objects and their focus positions

The room should stay an experience, rather than becoming the only route to information. New content normally starts in `library.ts`; add or remap a room object only when the object gives it a meaningful physical metaphor.

Current object routes are intentionally limited to content that is already public:

- Laptop → Work
- Material tray → Make
- Whiteboard → Research

The sketchbook remains a private working object until there are Journal entries worth publishing. The 3D scene is dynamically loaded, so these room routes never increase the default Index bundle.
