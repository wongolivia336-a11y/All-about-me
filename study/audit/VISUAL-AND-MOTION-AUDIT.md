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
