# The Study — GPU pilot report (2026-11-02)

Branch: `codex/room-object-routing`. Baseline code: `a7d3804`. The two hero
pilots are **Laptop** and **Domi**. No GLB, external model, new audio, hotspot,
or navigation model was introduced.

## Direct visual evidence

All images are browser captures at device pixel ratio 1. The desktop viewport
is 1280 × 800 and mobile is 390 × 844. `before` is the baseline code; `after`
is the pilot. The window pair uses the same manually set camera pose. The other
pairs use the application's focus camera.

| View | Before | After | Observed result |
| --- | --- | --- | --- |
| Day overview | [PNG](evidence/3d-pilot/before/overview-day.png) | [PNG](evidence/3d-pilot/after/overview-day.png) | Room, desk and reading corner remain in frame. |
| Laptop | [PNG](evidence/3d-pilot/before/laptop-focus.png) | [PNG](evidence/3d-pilot/after/laptop-focus.png) | Recessed keyboard, hinges, display bezel and complete base now read at focus distance; screen uses selected work data. |
| Domi | [PNG](evidence/3d-pilot/before/domi-focus.png) | [PNG](evidence/3d-pilot/after/domi-focus.png) | Cone ears, segmented tail and cylinder legs were replaced with shaped ears, a curved tail and tucked paws. She remains intentionally stylised. |
| Window | [PNG](evidence/3d-pilot/before/window-focus.png) | [PNG](evidence/3d-pilot/after/window-focus.png) | Existing opening, frame and sill are unchanged and remain intact. |
| Night, lamp off | [PNG](evidence/3d-pilot/before/overview-night-off.png) | [PNG](evidence/3d-pilot/after/overview-night-off.png) | Ambient depth remains visible. |
| Night, lamp 50% | [PNG](evidence/3d-pilot/before/overview-night-50.png) | [PNG](evidence/3d-pilot/after/overview-night-50.png) | Local warm light remains. |
| Night, lamp 100% | [PNG](evidence/3d-pilot/before/overview-night-100.png) | [PNG](evidence/3d-pilot/after/overview-night-100.png) | Local light scales without changing navigation or room geometry. |
| Mobile overview | [PNG](evidence/3d-pilot/before/overview-mobile.png) | [PNG](evidence/3d-pilot/after/overview-mobile.png) | Pullback and angle now include the reading corner and a sliver of the window; the room is smaller but remains visible. |

## Browser measurements

The GPU-capable browser was headless Edge using ANGLE D3D11 on **Intel Iris Xe**.
An NVIDIA RTX 3060 was present, but Edge did not use it. The [before](evidence/3d-pilot/before/metrics.json)
and [after](evidence/3d-pilot/after/metrics.json) JSON files contain each view,
device string, viewport, 120-frame sample, WebGL draw submissions, triangle
estimates and frame intervals. GPU timer time and texture memory in bytes were
unavailable. Development resource decoded bytes are not download size.

| 1280 × 800 view | Before draws / triangles | After draws / triangles | Before / after sampled FPS |
| --- | ---: | ---: | ---: |
| Day overview | 2,427 / 3.17 M | 1,227 / 1.65 M | 34.8 / 22.2 |
| Laptop focus | 1,105 / 1.36 M | 407 / 0.55 M | 54.2 / 44.3 |
| Domi focus | 1,166 / 1.47 M | 362 / 0.44 M | 58.8 / 66.7 |

The overview submission reduction is 49% in draw calls and 48% in triangle
estimates. The sampled overview FPS is **lower** in this after run, despite
lower submissions. The two runs used the same GPU/browser but different local
development directories and were taken at different times. These data do not
establish a frame-time improvement; Preview needs a repeat measurement on a
normal browser/device before calling performance improved. The lazy Room chunk
grew from 441.43 to 443.91 kB gzip (+2.48 kB); no runtime asset download was
added.

[Isolated effect measurements](evidence/3d-pilot/effect-probe/metrics.json)
and screenshots cover N8AO, Bloom, Vignette, SMAA, all PostFX off and shadows
off. N8AO and shadow passes had the largest measured frame cost, while
Vignette/SMAA changes were smaller than run-to-run noise. `ContactShadows`
now renders one static frame. Removing an unneeded normal pass from
`EffectComposer` reduced the same-scene submission count from 1,686 / 2.30 M
to 1,227 / 1.65 M; screenshots showed no material difference at overview.
No further quality reduction was made from the noisy FPS samples.

## Interaction and lifecycle

The [browser regression record](evidence/3d-pilot/regression.json) has **36/36
passing checks**: Index's lazy WebGL boundary, loader settle, focus restoration,
history, all 13 focus targets, direct clicks on Domi/Laptop/Whiteboard/Shelf,
Escape, HUD range/power, physical dial press/slow and rapid drag/cancel, mobile
HUD/Index touch and Domi's reduced-motion pose. A real touch cancellation
initially failed; the current R3F event manager does not forward
`pointercancel` to mesh handlers, so the dial now handles native cancellation
and lost capture. The retest changed brightness 50→75→50 without toggling power.

Three development Room entries recorded 476 geometries on each entry and
textures 90→89→89, with no continuing growth. A rapid remount in the **Vite
development server** emitted an R3F `events.connect(null)` exception twice;
the room still rendered. The [production build re-entry probe](evidence/3d-pilot/reentry-production.json)
completed four Room→Index cycles with WebGL only in Room and **zero browser
exceptions**. This is a development-only observation, not a claim that all
browser/device combinations are covered.

`npm run lint` and `npm run build` passed from a copy of the exact source and
lockfile dependencies on a faster local validation volume. The source in this
repository is canonical; the copy was used because package installation and
large writes on the workspace volume were unusually slow. The existing Vite
warning for a >500 kB minified Room chunk remains.

## Preview

Preview URL: [Olivia Wong — The Study Preview](https://all-about-me-git-codex-room-b25898-wongolivia336-a11ys-projects.vercel.app/#room).
GitHub's Vercel commit status reported **Deployment has completed** for
`3abd744`; the Vercel Preview Comments check exposed this URL. A direct HTTP
request from this workstation timed out, so remote page rendering is not
claimed as verified. Stable production deployment settings were not changed.
