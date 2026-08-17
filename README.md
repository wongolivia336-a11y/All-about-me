# All about me

A personal site built as a 3D study. Every piece of content lives on a physical
object in the room — the laptop holds web work, the phone holds app work, the
open book on the desk holds the portfolio, the shelf holds reading notes.

The room is assembled entirely from primitives. There are no imported models:
rounded boxes, cylinders and spheres, carried by material response and a
softbox lighting rig rather than by geometry detail.

## Running it

```bash
cd study
npm install
npm run dev
```

## Layout

```
study/src/
  scene/
    layout.ts      single source of truth for where objects sit
    theme.ts       palette + procedurally drawn screen and page textures
    Studio.tsx     lighting rig
    Shell.tsx      floor, walls, window, desk
    Devices.tsx    laptop, phone
    Objects.tsx    lamp, portfolio, mug, camera, prints, plant
    Shelf.tsx      bookshelf and pinboard
    CameraRig.tsx  camera choreography
  data/
    hotspots.ts    object -> content -> URL -> camera pose
    content.ts     section copy
  interaction/
    studyStore.ts  shared state
    Hotspot.tsx    hover label + click to enter
  ui/
    Panel.tsx           content surface
    PortfolioViewer.tsx spread-by-spread portfolio reader
scripts/
  render-portfolio.py   turns the source PDF into web assets
```

Two conventions worth keeping:

**Object positions live in `layout.ts` only.** The camera close-ups in
`hotspots.ts` are derived from them, so sliding a prop across the desk brings
its close-up with it instead of leaving the camera pointed at bare wood.

**Shared state is an external store, not React context.** `<Canvas>` mounts its
own reconciler root, so context from the DOM tree never reaches components
inside the scene.

## The portfolio

The source PDF is ~398MB: 20 spreads whose photographs are stored as raw
FlateDecode RGB, which costs about 8MB per photo. It is never served to the
browser. `scripts/render-portfolio.py` re-encodes those images, rasterises the
spreads to WebP, and rebuilds a ~7.7MB PDF for download.

```bash
python scripts/render-portfolio.py "path/to/portfolio.pdf"
```

Requires PyMuPDF and Pillow. Two spreads carry a vector object complex enough
that MuPDF cannot pack it into a display list node; the script detects this and
re-wraps those pages as XObjects, which renders fine.
