import * as THREE from "three";

/**
 * Procedural surface textures.
 *
 * Everything here is drawn into a canvas at runtime rather than shipped as
 * image files: the room stays a few hundred KB, and every surface stays
 * parameterised, so a wood tone is a colour argument rather than a re-export
 * from a paint program.
 *
 * Each maker returns a colour map plus a matching bump map. The bump is what
 * actually sells the material — flat colour with a little surface relief reads
 * as wood or cloth, while a perfectly smooth surface reads as plastic no
 * matter how good the colour is.
 */

interface Maps {
  map: THREE.Texture;
  bumpMap: THREE.Texture;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

function toTexture(c: HTMLCanvasElement, repeat: [number, number], srgb: boolean) {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  return tex;
}

/** Deterministic noise so a reload does not reshuffle the grain. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function makeWood(
  base: string,
  dark: string,
  repeat: [number, number] = [1, 1],
  { planks = 0 }: { planks?: number } = {},
): Maps {
  const W = 1024;
  const H = 1024;
  const { c, ctx } = canvas(W, H);
  const { c: bc, ctx: bctx } = canvas(W, H);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, W, H);

  // grain: long wavering lines down the length of the board
  for (let i = 0; i < 240; i++) {
    const x = rand(i) * W;
    const wobble = 8 + rand(i + 0.3) * 26;
    const phase = rand(i + 0.7) * Math.PI * 2;
    const alpha = 0.03 + rand(i + 1.1) * 0.1;
    const width = 0.6 + rand(i + 1.9) * 2.6;

    ctx.strokeStyle = dark;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    bctx.strokeStyle = rand(i + 2.3) > 0.5 ? "#6a6a6a" : "#989898";
    bctx.globalAlpha = alpha * 1.6;
    bctx.lineWidth = width;

    ctx.beginPath();
    bctx.beginPath();
    for (let y = 0; y <= H; y += 16) {
      const px = x + Math.sin(y / 150 + phase) * wobble;
      if (y === 0) {
        ctx.moveTo(px, y);
        bctx.moveTo(px, y);
      } else {
        ctx.lineTo(px, y);
        bctx.lineTo(px, y);
      }
    }
    ctx.stroke();
    bctx.stroke();
  }
  ctx.globalAlpha = 1;
  bctx.globalAlpha = 1;

  // a couple of knots, which is what stops it reading as striped wallpaper
  for (let k = 0; k < 3; k++) {
    const kx = rand(k + 40) * W;
    const ky = rand(k + 41) * H;
    for (let r = 26; r > 0; r -= 3) {
      ctx.strokeStyle = dark;
      ctx.globalAlpha = 0.05 + (26 - r) / 300;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(kx, ky, r, r * 0.55, rand(k + 42) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // plank seams
  if (planks > 0) {
    const step = H / planks;
    for (let i = 1; i < planks; i++) {
      const y = i * step;
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, y - 1, W, 2.5);
      bctx.fillStyle = "#3a3a3a";
      bctx.fillRect(0, y - 1, W, 3);
    }
  }

  return {
    map: toTexture(c, repeat, true),
    bumpMap: toTexture(bc, repeat, false),
  };
}

export function makeFabric(
  base: string,
  repeat: [number, number] = [4, 4],
): Maps {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const { c: bc, ctx: bctx } = canvas(S, S);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, S, S);

  // plain weave: alternating warp and weft
  const cell = 8;
  for (let y = 0; y < S; y += cell) {
    for (let x = 0; x < S; x += cell) {
      const over = ((x / cell) | 0) % 2 === ((y / cell) | 0) % 2;
      ctx.fillStyle = over ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
      ctx.fillRect(x, y, cell, cell);
      bctx.fillStyle = over ? "#a4a4a4" : "#5e5e5e";
      bctx.fillRect(x, y, cell, cell);
    }
  }

  // slubs, so it is not a perfect machine grid
  for (let i = 0; i < 900; i++) {
    const x = rand(i) * S;
    const y = rand(i + 0.5) * S;
    ctx.fillStyle = `rgba(0,0,0,${0.03 + rand(i + 1) * 0.05})`;
    ctx.fillRect(x, y, 2 + rand(i + 2) * 5, 1.5);
  }

  return {
    map: toTexture(c, repeat, true),
    bumpMap: toTexture(bc, repeat, false),
  };
}

/** Painted plaster: almost flat, just enough tooth to catch raking light. */
export function makePlaster(base: string, repeat: [number, number] = [3, 2]): Maps {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const { c: bc, ctx: bctx } = canvas(S, S);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 9000; i++) {
    const x = rand(i) * S;
    const y = rand(i + 0.31) * S;
    const v = rand(i + 0.77);
    ctx.fillStyle = `rgba(${v > 0.5 ? "255,255,255" : "0,0,0"},0.028)`;
    ctx.fillRect(x, y, 2, 2);
    bctx.fillStyle = v > 0.5 ? "#8c8c8c" : "#747474";
    bctx.fillRect(x, y, 2, 2);
  }

  return {
    map: toTexture(c, repeat, true),
    bumpMap: toTexture(bc, repeat, false),
  };
}

/** Paper stock for the portfolio block and loose sheets. */
export function makePaper(base = "#faf7f0"): Maps {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const { c: bc, ctx: bctx } = canvas(S, S);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 6000; i++) {
    const x = rand(i + 3) * S;
    const y = rand(i + 3.4) * S;
    ctx.fillStyle = `rgba(120,105,85,${0.012 + rand(i + 5) * 0.03})`;
    ctx.fillRect(x, y, 1.5, 1.5);
    bctx.fillStyle = rand(i + 6) > 0.5 ? "#888888" : "#787878";
    bctx.fillRect(x, y, 1.5, 1.5);
  }

  return {
    map: toTexture(c, [1, 1], true),
    bumpMap: toTexture(bc, [1, 1], false),
  };
}
