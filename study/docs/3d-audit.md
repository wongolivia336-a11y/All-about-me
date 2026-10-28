# The Study — 3D audit, P0 iteration

## Scope and evidence

This document records the first structural iteration on branch
`codex/room-object-routing`. It is intentionally evidence-based:

- **Confirmed** means observable from source geometry or a completed static
  build.
- **Needs visual verification** means it requires a working WebGL-capable
  browser/device. It is not reported as a defect until reproduced.

The audit workstation could run TypeScript, lint and production builds, but its
headless browser's GPU process would not start. Therefore no runtime draw-call,
frame-time, screenshot, or mesh-intersection claims are made in this iteration.

## Current architectural decision

The room uses **Option A: an open architectural diorama**.

| Boundary | Decision |
| --- | --- |
| Back / left | Physical 120 mm walls with thickness and shadows |
| Front / right | Deliberately open cut faces for the overview camera |
| Floor | Finite 4.82 m × 3.47 m × 80 mm architectural plinth |
| Window | A left-wall opening with sill, glass, frame and an exterior layer |
| Camera | Guided orbit, object-led focus, not free architectural navigation |

This keeps the room explorable while making its limits explicit. A complete
four-wall room with dynamic cuts would add camera-state and occlusion failure
modes without helping the present curated-object interaction.

## Scene hierarchy map

```text
Room
├── Studio                         lights / Environment / ContactShadows
├── architecture [debug bounds]
│   └── Shell
│       ├── DioramaFloor
│       ├── BackWall
│       ├── LeftWall (segmented around Window opening)
│       ├── Skirting
│       ├── Window (sky, glass, sill, frame)
│       ├── Rug
│       └── Desk (top, legs, drawer, runners)
├── furnishings [debug bounds]
│   ├── Devices / DeskProps / Workbench / Marshall
│   ├── Bookshelf / Corkboard / Whiteboard / PosterWall
│   └── ReadingChair / Domi
├── CameraRig
├── PostFX (query-toggleable)
└── SceneDebug (development only)
```

The static room dimensions and opening are centralised in
`src/scene/layout.ts`; they are the source of truth for shell geometry.

## Confirmed issues and fixes

| ID | Severity | Object | Observed source condition | Fix in this iteration | Verification |
| --- | --- | --- | --- | --- | --- |
| P0-01 | P0 | Room shell | Two unbounded planes and a 14 m floor did not define a diorama edge or wall thickness. | Replaced with finite plinth and box walls. | Typecheck + production build passed. |
| P0-02 | P0 | Window | A bright plane in front of a wall simulated a window but did not create an opening. | Segmented left wall around a real opening; added sill, thin glass, frame and exterior layer. | Typecheck + production build passed. |
| P0-03 | P0 | Desk / drawer | The shallow drawer had a visible unsupported clearance under a 40 mm top. | Added a 45 mm top, paired metal runners and a separate drawer face/reveal. | Typecheck + production build passed. |
| P0-04 | P0 | Lighting / PostFX | Bloom, AO and vignette were driven by lamp level only, coupling daytime task light to night-style grading. | Introduced independent `isNight`, `lampOn`, and `lampIntensity` state. | Typecheck + production build passed. |

## Lighting-state contract

| State | Environment / direct light | Task lamp | PostFX |
| --- | --- | --- | --- |
| Day / off | Day rig | off | Low bloom, light vignette |
| Day / on | Day rig unchanged | continuous 0–1 local light | Small local bloom response only |
| Night / off | Reduced daylight + retained reflections | off | Darker vignette, restrained bloom |
| Night / on | Night rig unchanged | continuous 0–1 local light | Warm bloom scales with lamp |

`lampOn` is a derived user-facing state, while `lampIntensity` remains the
continuous physical value used by the dimmer, bulb, shade, light pool and
fallback range input.

## Collision report

No non-intended mesh penetrations are asserted yet. The previous source shape
did confirm two architectural integrity problems (P0-01 and P0-03 above), but
an AABB overlap would not distinguish a valid drawer rail, chair leg contact or
cat neck connection from a defect.

For repeatable browser-side inspection, use the development overlay:

```text
/?debug=scene#room
/?debug=scene,wireframe#room
/?debug=scene,normals#room
/?debug=scene,shadows-off,postfx-off#room
```

It provides axes, grid, named coordinate landmarks, broad-phase group bounds,
camera frustum, optional mesh wireframes, optional vertex normals, and isolated
shadow / post-effect passes. The overlay is stripped from production behavior
by `import.meta.env.DEV`.

Next, inspect these pairs at their focus-camera distances and record screenshots
with object IDs before classifying any intersection as a bug:

1. `desk ↔ laptop / portfolio / mug / camera`
2. `drawer ↔ desk top / runners`
3. `chair ↔ Domi ↔ floor`
4. `bookshelf ↔ books ↔ back wall`
5. `window ↔ left wall ↔ camera`

## Asset refinement roadmap

| Tier | Assets | Next action |
| --- | --- | --- |
| Hero A | Laptop, desk lamp, Domi, reading chair, desk | Model two pilots after visual review: laptop and Domi or chair. |
| Supporting B | Bookshelf, portfolio, camera, speaker | Preserve primitive layout; add detail only where focus shots show it. |
| Environmental C | Walls, floor, rug, window exterior | Keep procedural surfaces; tune roughness and texture scale before adding textures. |

### Blender → GLB policy

There are currently no Blender or GLB assets in the repository, and the audit
machine does not have Blender installed. No placeholder or fake GLB has been
created. When an editable asset source is available, use:

```text
study/assets/source/<asset>.blend
study/public/models/<asset>.glb
study/assets/manifest.json
```

Export in metres, Y-up, with named interaction nodes and stable pivots. Keep
interactive parts explicit (for example `Lamp_Dimmer_Pivot`), then bind R3F
raycasts to names/IDs rather than mesh order. Measure GLB size, triangles,
draw calls and focused-camera frame time before replacing a procedural object.

## Performance baseline

This is a build artifact baseline, not a GPU benchmark:

| Asset | Before P0 | Current | Change |
| --- | ---: | ---: | ---: |
| Main interface chunk | 69.96 kB | 70.12 kB | +0.16 kB |
| Lazy RoomScene chunk | 438.87 kB | 440.46 kB | +1.59 kB |

The room stays dynamically imported, so the default Index route does not load
the RoomScene chunk. Vite reports the room chunk above its 500 kB minified
warning threshold; introducing GLB assets must not happen until runtime
measurements identify whether geometry, post-processing, texture memory or code
is the real limiting factor.

## Verification performed

```text
npm run lint     PASS
npm run build    PASS
```

The next P1 pass is visual QA on a GPU-capable browser: capture day/night and
all lamp states, inspect debug bounds, measure renderer statistics, then select
one Hero asset for a real Blender/GLB pilot.
