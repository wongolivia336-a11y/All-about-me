# Visual and Motion Audit

## Visual hierarchy

**Confirmed:** the name, role, short introduction and “See selected work” path identify the author and make work discoverable. In the baseline screenshot, the hero facts repeated the role line and pushed the index down. Those facts are removed. The four-leaf diagram remains recognizable and the image matrix still carries the work.

**Design critique:** the main theme matrix is a content surface, not a decorative portfolio collage. Replacing unrelated ReMap / WeaveCo page crops with semantically matched monochrome illustrations improves the connection between each theme and its featured work. The original palette and Heartwheel geometry remain intact.

**Confirmed responsive refinement:** at 390×844, the title wraps to fewer lines and the wheel is slightly smaller, bringing more of the four project tiles into the initial viewport while retaining touch targets. Browser `scrollWidth` remains 390px.

## Project detail composition

Opening a project now creates a visible reading state, with back navigation, project title, summary, metadata, actual links and one landscape illustration. An HTML height attribute initially stretched the art to 474×1000; explicit `height: auto` restores 474×296. The conceptual provenance sits directly beneath the image.

## Motion model

| Interaction | Current implementation | Browser finding |
|---|---|---|
| Theme selection | Heartwheel’s interruptible RAF spring plus persistent image-tile transforms | All four themes select matching artwork |
| Image expansion | Existing tile stays mounted and scales in its viewport | Asset is not swapped during focus; selected image remains the visual source |
| Project arrival | Route state changes, detail receives focus, archive scrolls to its top | Detail heading is visible in the same viewport |
| Project return | Browser history plus stored source scroll / focus context | Source `scrollTop` restored exactly (886 → 886 in the recorded run) |
| Pointer cancellation | Separate cancellation path returns rotation to target; no theme commit | Touch-cancel rotation differed by <0.05° in the recorded run |
| Reduced motion | CSS disables tile/copy motion; JS sets wheel target directly | Browser emulation reports 0s tile transition and no copy animation |
| Room reveal | Shared interruptible progress driver and clipped reveal surface | Room became interactive after loading; exit/history worked |

## Evidence limits

The screenshots capture settled states, not a frame-by-frame video or performance trace. No FPS, INP, GPU, memory or image LCP/CLS measurement is claimed. Room hotspot content paths were exercised through the shared store, but every physical object hit area and camera move was not recorded frame-by-frame. Safari was not available in this run.

## UX revisit — 2026-11-04

| Interaction | Confirmed cause | Refinement and evidence |
|---|---|---|
| Index → Room fold | The corner trigger and preview mask survived over the reveal surface, creating competing edges and layers. | The corner trigger now exists only in idle Index; the reveal uses one clip path. `room-reveal-mid-1440x900.png` captures the intermediate state. |
| Four leaves | A decorative SVG stroke outlined every leaf independently of selection. | Removed permanent strokes and button borders. Selection uses fill / scale; keyboard focus keeps a separate visible focus ring. |
| Room entry / return | Focus restoration was scheduled before the destination control was guaranteed to be mounted. | A state-aware effect waits for the settled destination and then focuses its control. Edge confirmed both handoffs and Back / Forward. |
| Night palette | `.app--evening` changed CSS variables, but the app did not rebind inherited `color`; its language-switch selector also made Index tabs white on paper. | `.app` now declares `color: var(--ink)` and night switch styling is scoped to the Room HUD. Both the dark Room panel and light Index tabs stay legible. |
| Language switch | Interface copy and Canvas textures had no shared language state. | Persistent EN / 中文 state now updates Index, project detail, Room panels, accessibility labels and generated screen textures. 390×844 shows no overflow or fold overlap; each switch control is 44px tall. |

Edge/CDP evidence: [10 bilingual UX checks](evidence/ux-revisit/rehearsal-report.json), [18 Index / project checks](evidence/after-final-bilingual/navigation-report.json), and [20 Room checks](evidence/after-final/room-navigation-report.json). See the image set in [UX-REVISIT.md](UX-REVISIT.md).

## Fresh interaction rehearsal — 2026-11-04

The most consequential issue was a continuity break rather than a spacing or animation defect: a reader could focus QUESTION, open a BUILD project, then return to BUILD because `#index` did not carry the in-memory theme. The detail itself changed correctly, but its exit had lost the place the visitor was reading from. History entries now retain the theme and focused/overview state, and project entries retain their source route. This closes the narrative loop without changing the visible hash or adding decorative motion.

Real-pointer Edge/CDP rehearsal also rapidly switched eight themes, tested the second click on the current leaf, used ArrowRight with real focus transfer, dragged a leaf, and checked that the resulting synthetic click did not reselect the origin. All selected leaf, image and settled rotation states agreed. Contact and the Room fold had disjoint hit rectangles at 1440×900.
