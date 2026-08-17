# Poster artwork

There are two ways to get real posters onto the wall.

## 1. TMDB (recommended)

```bash
node scripts/fetch-posters.mjs <tmdb-api-key>
```

Free key at <https://www.themoviedb.org/settings/api>. The script writes image
URLs into `src/data/films.json`; the page then links `image.tmdb.org` directly.

Nothing is stored here, and the key never reaches the browser — it is only used
at build time. TMDB requires attribution wherever their artwork appears, and
the cinema panel renders it automatically once any TMDB URL is present.

## 2. Your own files

Drop images in this folder and point at them from `src/data/films.json`:

```json
{ "id": "yi-yi", "poster": "/posters/yi-yi.jpg", ... }
```

Use this for artwork you made yourself. Note that putting official posters here
means your site redistributes copyrighted images from your own domain, which is
a step beyond merely displaying them — linking TMDB's CDN avoids that.

## Format

2:3, matching the 0.22 × 0.33m frames. About 880 × 1320px is ample; nine
full-size scans would dominate the page weight for no visible gain.

Until a `poster` is set — and if a URL fails to load — each frame falls back to
a typeset placeholder built from the title, director and year, so the wall is
never full of holes.
