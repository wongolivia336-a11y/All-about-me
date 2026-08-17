# Poster artwork

Drop image files here, then point at them from `src/data/films.ts`:

```ts
{
  id: "yi-yi",
  title: "一一",
  poster: "/posters/yi-yi.jpg",   // ← add this line
  ...
}
```

Until a `poster` path is set, the wall draws a typeset placeholder from the
title, director and year, so the layout is always complete.

Aspect ratio is 2:3 (the frames are 0.22 × 0.33m). Around 880 × 1320px is
plenty — the posters are small on screen and nine full-size scans would
dominate the page weight.

**On rights:** official film posters are copyrighted. Nothing in this project
fetches or bundles them, and putting them on a public site is a decision only
you can make. Artwork you design yourself carries no such risk — and on a
design portfolio it counts as work rather than decoration.
