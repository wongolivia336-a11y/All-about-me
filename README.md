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
    Marshall.tsx   desk speaker
    PosterWall.tsx the film wall
    Chair.tsx      reading chair, and Domi
    CameraRig.tsx  camera choreography
  data/
    hotspots.ts    object -> content -> URL -> camera pose
    content.ts     section copy
    films.ts       the poster wall
    links.ts       accounts
  interaction/
    studyStore.ts  shared state
    Hotspot.tsx    hover label + click to enter
  ui/
    Surface.tsx         picks the panel for the focused object
    GitHubPanel.tsx     live GitHub
    PhonePanel.tsx      publishing platforms
    MusicPanel.tsx      the speaker
    Panel.tsx           generic content surface
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

One trap worth recording: drei's `<SoftShadows>` injects a PCSS shader that
calls `unpackRGBAToDepth`, which current three.js no longer defines. A failed
injection breaks shader compilation for *every* material in the scene, and the
symptom is not an obviously broken image — metalness and clearcoat quietly stop
working and the whole room reads as matte plastic. The Canvas uses three's own
soft shadow map instead.

## Accounts

Only GitHub is live. It is fetched straight from the browser: the
unauthenticated REST API allows 60 requests per hour *per visitor IP*, so every
visitor has their own budget and two calls per page view is nowhere near it. No
token and no backend.

LinkedIn closed its public API in 2015, and Xiaohongshu, WeChat Official
Accounts and NetEase Cloud Music expose nothing a static site may read. Those
are outbound links, and the UI says so rather than dressing a stale cache up as
live data. URLs go in `src/data/links.ts`.

## Dropping in assets

- `public/posters/` — film artwork, wired up in `src/data/films.ts`
- `public/audio/now-playing.mp3` — what the speaker plays

Both folders have a README covering the format and the rights question.

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
