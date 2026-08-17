import filmsJson from "./films.json";

/**
 * The poster wall.
 *
 * The list lives in `films.json` so `scripts/fetch-posters.mjs` can write
 * artwork URLs back into it without anyone hand-editing TypeScript.
 *
 * `poster` is a URL, not a bundled file. Real artwork comes from TMDB's CDN
 * and is linked, never copied into this repo — official film posters are
 * copyrighted, and redistributing them from your own domain is a different
 * thing from displaying them. Until a URL is present each frame draws a
 * typeset placeholder, and a URL that fails to load falls back to the same
 * placeholder, so the wall is never full of holes.
 */
export interface Film {
  id: string;
  title: string;
  titleEn: string;
  director: string;
  year: string;
  /** absolute URL (TMDB) or a path under /posters/ if you host your own */
  poster?: string;
  /** the accent the placeholder is drawn in */
  tone: string;
}

export const films: Film[] = filmsJson as Film[];

/** Required by TMDB's terms whenever their artwork or data is shown. */
export const TMDB_ATTRIBUTION =
  "海报数据来自 TMDB。本站使用 TMDB API，但未获 TMDB 认可或认证。";

export const usingTmdb = () =>
  films.some((f) => f.poster?.includes("image.tmdb.org"));
