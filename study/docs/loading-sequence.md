# Loading sequence

## Intent

The loader gives the room a short, personal prelude without turning the site
into a forced splash screen. The supplied black-and-white Macintosh photograph
is represented as a responsive field of characters, not shown as a flat image.

## Runtime model

- `src/ui/AsciiLoader.tsx` draws the source image to a small off-screen Canvas,
  reads its luminance, and selects glyphs from an ASCII ramp.
- Each cell retains a smoothed luminance value, so the image resolves rather
  than appearing in one hard swap.
- Pointer position creates a short-lived radial disturbance. The glyphs flow
  outward and settle back; no state is retained after the overlay hides.
- The component begins as the initial app loader. Entering `#room` reuses the
  same overlay until `RoomScene` has committed and rendered two animation
  frames.

The image remains a normal public asset at
`public/images/steve-jobs-macintosh.png`; there is no third-party image upload
or conversion API in the request path.

## Accessibility and performance

- The Canvas has a concise status announcement while the overlay is active.
- `prefers-reduced-motion` draws one static result instead of retaining the
  requestAnimationFrame loop.
- Character density is clamped by viewport and uses an off-screen sample grid,
  keeping the loader independent of WebGL and the room's rendering budget.
- The interaction is enhancement only: the underlying Index and Room routes
  remain fully usable after the loader hands off.

## Updating the image

Replace `public/images/steve-jobs-macintosh.png` with an image you have the
right to publish, preserving the filename or updating the source path in
`AsciiLoader.tsx`. High-contrast images with a clear subject work best; no
pre-conversion step is required.
