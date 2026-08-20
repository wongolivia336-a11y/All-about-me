import * as THREE from "three";

/**
 * Poster artwork drawn in code.
 *
 * The wall needs nine posters that look like a curated series rather than nine
 * coloured rectangles. Official artwork is copyrighted, so instead each film
 * gets a geometric motif and a shared typographic system: same margins, same
 * rule, same hierarchy, different field and figure. That consistency is what
 * makes a set read as designed.
 *
 * These stay in place until `scripts/fetch-posters.mjs` fills in TMDB URLs,
 * and come back automatically if one of those ever fails to load.
 */

export type Motif =
  | "orb"
  | "horizon"
  | "windows"
  | "folds"
  | "grain"
  | "beam";

export interface PosterSpec {
  /** seeds the motif so films sharing one do not share a composition */
  id?: string;
  title: string;
  titleEn: string;
  director: string;
  year: string;
  tone: string;
  motif?: Motif;
  /** ink colour; defaults to a warm off-white */
  ink?: string;
}

const W = 600;
const H = 900;
const MARGIN = 52;

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r},${g},${b})`;
}

const rand = (s: number) => {
  const x = Math.sin(s * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Stable per-film seed, so two films sharing a motif do not share a picture. */
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h;
}

/**
 * Largest size that fits the measure.
 *
 * Starts big and comes down, which matters: a two-character title like 一一
 * set at a nine-character title's size looks like a rendering failure rather
 * than a poster. Letting short titles run large is the whole point of the
 * system — the measure is fixed, the type fills it.
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  max = 120,
  weight = 600,
) {
  let size = max;
  const family = '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", serif';
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 2;
  } while (ctx.measureText(text).width > maxWidth && size > 18);
  return size + 2;
}

type MotifFn = (ctx: CanvasRenderingContext2D, ink: string, seed: number) => void;

const motifs: Record<Motif, MotifFn> = {
  // a single body low in the frame — moon, lamp, held gaze
  orb(ctx, ink, seed) {
    const cy = 340 + rand(seed) * 90;
    const r = 108 + rand(seed + 1) * 46;
    const cx = W / 2 + (rand(seed + 2) - 0.5) * 90;

    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.6);
    g.addColorStop(0, ink.replace(")", ",0.30)").replace("rgb", "rgba"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 130, W, 520);
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },

  // layered land, the way a place stacks up when you look at it for years
  horizon(ctx, ink, seed) {
    const bands = [
      { y: 288 + rand(seed) * 40, h: 90, a: 0.14 },
      { y: 372 + rand(seed + 1) * 36, h: 110, a: 0.2 },
      { y: 456 + rand(seed + 2) * 30, h: 130, a: 0.28 },
    ];
    bands.forEach((b, i) => {
      const phase = rand(seed + i * 3.7) * Math.PI * 2;
      const period = 110 + rand(seed + i * 5.1) * 90;
      const amp = 14 + rand(seed + i * 7.3) * 22;
      ctx.fillStyle = ink;
      ctx.globalAlpha = b.a;
      ctx.beginPath();
      ctx.moveTo(0, b.y + b.h);
      for (let x = 0; x <= W; x += 16) {
        ctx.lineTo(x, b.y + Math.sin(x / period + phase) * amp);
      }
      ctx.lineTo(W, b.y + b.h);
      ctx.closePath();
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  },

  // lit windows — a city of separate lives
  windows(ctx, ink, seed) {
    const cols = 6 + Math.floor(rand(seed) * 3);
    const rows = 8 + Math.floor(rand(seed + 1) * 3);
    const cw = 30 + rand(seed + 2) * 10;
    const ch = 22 + rand(seed + 3) * 8;
    const gx = 14 + rand(seed + 4) * 8;
    const gy = 12 + rand(seed + 5) * 8;
    const x0 = (W - (cols * cw + (cols - 1) * gx)) / 2;
    const y0 = 230;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = rand(seed + r * 13 + c * 7) > 0.45;
        ctx.fillStyle = ink;
        ctx.globalAlpha = lit ? 0.16 + rand(seed + r + c * 3) * 0.3 : 0.05;
        ctx.fillRect(x0 + c * (cw + gx), y0 + r * (ch + gy), cw, ch);
      }
    }
    ctx.globalAlpha = 1;
  },

  // heavy vertical folds
  folds(ctx, ink, seed) {
    for (let i = 0; i < 26; i++) {
      const x = (i / 25) * W;
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.06 + Math.abs(Math.sin(i * 1.1 + seed)) * 0.16;
      ctx.lineWidth = 6 + Math.abs(Math.sin(i * 0.7 + seed)) * 20;
      ctx.beginPath();
      ctx.moveTo(x, 170);
      ctx.bezierCurveTo(x + 26, 360, x - 26, 470, x, 640);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  // vertical static
  grain(ctx, ink, seed) {
    for (let i = 0; i < 4200; i++) {
      const x = rand(seed + i) * W;
      const y = 170 + rand(seed + i + 0.5) * 470;
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.05 + rand(seed + i + 1) * 0.3;
      ctx.fillRect(x, y, 1.6, 4 + rand(seed + i + 2) * 20);
    }
    ctx.globalAlpha = 1;
  },

  // a beam opening downward
  beam(ctx, ink, seed) {
    const spread = 170 + rand(seed) * 80;
    const g = ctx.createLinearGradient(0, 170, 0, 640);
    g.addColorStop(0, ink.replace(")", ",0.32)").replace("rgb", "rgba"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 26, 170);
    ctx.lineTo(W / 2 + 26, 170);
    ctx.lineTo(W / 2 + spread, 640);
    ctx.lineTo(W / 2 - spread, 640);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 26, 170);
    ctx.lineTo(W / 2 - spread, 640);
    ctx.moveTo(W / 2 + 26, 170);
    ctx.lineTo(W / 2 + spread, 640);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },
};

export const POSTER_W = W;
export const POSTER_H = H;

/**
 * Draws one poster into any 2D context sized POSTER_W x POSTER_H.
 *
 * Kept free of three.js and of `document` so the same code can run headless
 * under node-canvas — which is how the set gets proofed as flat images without
 * having to squint at nine 22cm frames across a 3D room.
 */
export function drawPoster(ctx: CanvasRenderingContext2D, film: PosterSpec) {
  const ink = film.ink ?? "rgb(244,240,232)";

  // field
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, shade(film.tone, 26));
  bg.addColorStop(1, shade(film.tone, -28));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  motifs[film.motif ?? "orb"](ctx, ink, hash(film.id ?? film.titleEn));

  // typography
  ctx.textAlign = "left";
  const measure = W - MARGIN * 2;

  const titleSize = fitText(ctx, film.title, measure);
  ctx.fillStyle = ink;
  ctx.font = `600 ${titleSize}px "PingFang SC", "Microsoft YaHei", serif`;
  ctx.fillText(film.title, MARGIN, 726);

  ctx.globalAlpha = 0.66;
  ctx.font = "400 21px Georgia, 'Times New Roman', serif";
  ctx.fillText(film.titleEn.toUpperCase(), MARGIN, 762);
  ctx.globalAlpha = 1;

  // rule
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.34;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN, 792);
  ctx.lineTo(W - MARGIN, 792);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.78;
  ctx.font = '400 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(film.director, MARGIN, 828);
  ctx.textAlign = "right";
  ctx.font = "400 22px Georgia, serif";
  ctx.fillText(film.year, W - MARGIN, 828);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;

  // print grain, so it does not look like a flat vector export
  for (let i = 0; i < 5200; i++) {
    const x = rand(i + 7) * W;
    const y = rand(i + 7.3) * H;
    ctx.fillStyle = rand(i + 9) > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
    ctx.fillRect(x, y, 1.6, 1.6);
  }
}

export function makePosterTexture(film: PosterSpec) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  drawPoster(c.getContext("2d")!, film);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
