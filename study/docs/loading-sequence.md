# ASCII interlude and page turn

## Intent

The site remains Olivia Wong's personal space. The transition foreground is
her name; a short excerpt from the [2005 Stanford address](https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says)
is source material for the moving field. `SpeechCodeLoader.tsx` converts every
character in that excerpt, including spaces and punctuation, to a three-digit
decimal ASCII value. The repeated codes form an `OW` mask. The address is
credited in a small footer link rather than presented as the site's subject.

## Architecture

```text
GlobalLoadingProvider
  ├─ app-shell and Room resource tasks
  ├─ two-frame Index handoff task
  ├─ Page turn task, begun before either view folds away
  └─ SpeechCodeLoader overlay and retry affordance

App
  ├─ Room / Index page sheet + upper-right folded corner
  ├─ 850 ms sheet turn over the ASCII interlude
  └─ Room task → RoomScene first committed frame
```

Clicking a corner starts the loader behind the current page, then rotates that
page around its upper-right edge. After the 850 ms turn, the next view mounts
beneath the loader. The overlay stays visible for at least 2.6 seconds from
the beginning of the transition, then fades for 520 ms. Direct hash changes
and browser history use the same fold. Reduced motion skips the rotation and
uses a static field with a 0.9-second exposure.

## Field and performance

The numeric grid is sampled into a stable cell array; a small off-screen atlas
caches each ASCII code at 16 colors. Neighboring cells share two slow wave
phases. A diagonal band travels through the color ramp during each transition,
and pointer movement adds bounded velocity and energy to nearby cells. Spring
restoration returns the digits to their cells. The field paints at most 20 fps
and caps DPR at 1.5 on desktop and 1.25 on small screens. Reduced motion draws
once, without a retained animation loop or pointer disturbance.

`useLoading().begin(label)` remains available for future real work. A task may
report measured progress or call `fail(message, retry)`; the UI never invents
a percentage. The current Room path completes after the first committed Canvas
frame and reports Drei's resource progress when assets expose it.
