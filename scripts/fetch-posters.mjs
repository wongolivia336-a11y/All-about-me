#!/usr/bin/env node
/**
 * Fill in poster artwork URLs from TMDB.
 *
 *   node scripts/fetch-posters.mjs <api-key>
 *   TMDB_API_KEY=... node scripts/fetch-posters.mjs
 *   node scripts/fetch-posters.mjs <api-key> --force   # refresh existing ones
 *
 * Get a free key at https://www.themoviedb.org/settings/api
 *
 * Why this is a build step and not a runtime fetch:
 *
 *   - The key stays out of the shipped bundle. Only the resulting image URLs
 *     are written to films.json, and the page hotlinks image.tmdb.org with no
 *     credentials at all.
 *   - No poster file is ever copied into this repo. Official posters are
 *     copyrighted; linking TMDB's CDN under their terms is a different thing
 *     from redistributing the images from your own domain.
 *   - Visitors pay no API latency, and there is no rate limit to share.
 *
 * TMDB requires attribution wherever their data or artwork appears. That
 * string lives in src/data/films.ts and the cinema panel renders it as soon
 * as any TMDB URL is present.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FILMS = join(HERE, "..", "study", "src", "data", "films.json");

// w500 is ample: the frames are 22cm wide in a room seen from across it
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const args = process.argv.slice(2);
const force = args.includes("--force");
const key = args.find((a) => !a.startsWith("--")) ?? process.env.TMDB_API_KEY;

if (!key) {
  console.error(
    "Need a TMDB API key.\n" +
      "  node scripts/fetch-posters.mjs <api-key>\n" +
      "Get one free at https://www.themoviedb.org/settings/api",
  );
  process.exit(1);
}

async function search(film) {
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("api_key", key);
  url.searchParams.set("query", film.titleEn);
  url.searchParams.set("year", film.year);
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url);
  if (res.status === 401) throw new Error("TMDB rejected the key (401)");
  if (!res.ok) throw new Error(`TMDB ${res.status}`);

  const { results = [] } = await res.json();
  // prefer an exact year match; TMDB sometimes returns re-releases first
  const hit =
    results.find((r) => (r.release_date ?? "").startsWith(film.year)) ??
    results[0];
  return hit?.poster_path ? IMAGE_BASE + hit.poster_path : null;
}

const films = JSON.parse(await readFile(FILMS, "utf8"));
let filled = 0;
let kept = 0;
let missed = 0;

for (const film of films) {
  if (film.poster && !force) {
    kept++;
    continue;
  }
  try {
    const poster = await search(film);
    if (poster) {
      film.poster = poster;
      filled++;
      console.log(`  ✓ ${film.title.padEnd(12)} ${poster}`);
    } else {
      missed++;
      console.log(`  · ${film.title.padEnd(12)} no match — placeholder stays`);
    }
  } catch (err) {
    missed++;
    console.log(`  ! ${film.title.padEnd(12)} ${err.message}`);
  }
}

await writeFile(FILMS, JSON.stringify(films, null, 2) + "\n", "utf8");
console.log(
  `\n${filled} filled, ${kept} already set, ${missed} left on the placeholder`,
);
