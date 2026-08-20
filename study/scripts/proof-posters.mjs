#!/usr/bin/env node
/**
 * Proof the drawn poster set as flat images.
 *
 *   npm run proof:posters        (from study/)
 *
 * Writes a contact sheet to study/scratch/posters-proof.png. Nine posters
 * hanging at 22cm across a 3D room are impossible to judge in place; this
 * renders the same drawing code headless so the set can be looked at the way
 * a poster set is meant to be looked at.
 *
 * It shares `drawPoster` with the running site rather than reimplementing it,
 * which is the whole reason that function takes a context instead of reaching
 * for `document` itself.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..");
const OUT = join(APP, "scratch");

// Windows ships YaHei rather than PingFang; make sure something with CJK
// coverage is registered before the titles get drawn.
GlobalFonts.loadSystemFonts();

const source = await readFile(join(APP, "src", "scene", "poster.ts"), "utf8");

// strip the three.js half — the drawing code has no need of it
const stripped = source
  .replace(/^import \* as THREE.*$/m, "")
  .replace(/export function makePosterTexture[\s\S]*$/m, "");

const js = ts.transpileModule(stripped, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const { drawPoster, POSTER_W, POSTER_H } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);

const films = JSON.parse(
  await readFile(join(APP, "src", "data", "films.json"), "utf8"),
);

const COLS = 3;
const SCALE = 0.52;
const GAP = 16;
const CW = Math.round(POSTER_W * SCALE);
const CH = Math.round(POSTER_H * SCALE);
const rows = Math.ceil(films.length / COLS);

const sheet = createCanvas(
  CW * COLS + GAP * (COLS + 1),
  CH * rows + GAP * (rows + 1),
);
const sctx = sheet.getContext("2d");
sctx.fillStyle = "#15130f";
sctx.fillRect(0, 0, sheet.width, sheet.height);

for (const [i, film] of films.entries()) {
  const one = createCanvas(POSTER_W, POSTER_H);
  drawPoster(one.getContext("2d"), film);
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  sctx.drawImage(
    one,
    GAP + col * (CW + GAP),
    GAP + row * (CH + GAP),
    CW,
    CH,
  );
}

await mkdir(OUT, { recursive: true });
const file = join(OUT, "posters-proof.png");
await writeFile(file, sheet.toBuffer("image/png"));
console.log(`${films.length} posters -> ${file}`);
