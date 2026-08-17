import * as THREE from "three";

/**
 * Palette for the study. Kept deliberately narrow: warm neutrals for the room,
 * anodized greys for the devices, one accent per soft object. Apple-ish
 * skeuomorphism comes from material response (clearcoat + tight roughness),
 * not from colour variety.
 */
export const palette = {
  wall: "#efebe3",
  wallShadow: "#e3ded4",
  floor: "#b08a5f",
  rug: "#d9d1c2",
  deskTop: "#d8b489",
  deskEdge: "#c9a375",
  deskLeg: "#8e8e94",
  aluminum: "#d6d6db",
  aluminumDark: "#a8a8ae",
  spaceGray: "#5a5a60",
  glass: "#0e0e12",
  paper: "#faf7f0",
  ceramic: "#f3f0ea",
  leather: "#8b5a3c",
  leaf: "#4d7a52",
  terracotta: "#c2724d",
  brass: "#c8a54a",
} as const;

type ScreenDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) => void;

function makeTexture(w: number, h: number, draw: ScreenDraw) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/**
 * A stand-in "website" for the laptop screen. Once a real project is wired up
 * this gets replaced by an <Html transform> surface rendering actual DOM.
 */
export const makeSiteScreen = () =>
  makeTexture(1024, 640, (ctx, w, h) => {
    ctx.fillStyle = "#f7f5f1";
    ctx.fillRect(0, 0, w, h);

    // browser chrome
    ctx.fillStyle = "#e6e2db";
    ctx.fillRect(0, 0, w, 46);
    ctx.fillStyle = "#cfcac1";
    [30, 56, 82].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, 23, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#f7f5f1";
    roundRect(ctx, 120, 11, w - 200, 24, 12);

    // hero
    ctx.fillStyle = "#1c1c1e";
    ctx.font = "600 54px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Selected Work", 64, 160);
    ctx.fillStyle = "#8a8a8f";
    ctx.font = "400 26px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Web — interface & systems", 64, 204);

    // cards
    const cardW = (w - 128 - 48) / 3;
    ["#c8d8e8", "#e8d2c4", "#d3dcc9"].forEach((c, i) => {
      ctx.fillStyle = c;
      roundRect(ctx, 64 + i * (cardW + 24), 250, cardW, 210, 16);
    });
    ctx.fillStyle = "#c9c5bd";
    roundRect(ctx, 64, 500, w - 128, 12, 6);
    roundRect(ctx, 64, 528, (w - 128) * 0.6, 12, 6);
  });

/** Stand-in app UI for the phone screen. */
export const makeAppScreen = () =>
  makeTexture(512, 1040, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1d2430");
    g.addColorStop(1, "#0f141c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 22px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("9:41", 34, 52);

    ctx.font = "700 46px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Today", 34, 150);
    ctx.fillStyle = "#7d8794";
    ctx.font = "400 22px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Mobile — product & prototype", 34, 190);

    for (let i = 0; i < 5; i++) {
      const y = 240 + i * 132;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, 28, y, w - 56, 112, 22);
      ctx.fillStyle = ["#5b8def", "#e0794f", "#57b894", "#b06fd0", "#e0b54f"][i];
      roundRect(ctx, 48, y + 24, 64, 64, 18);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      roundRect(ctx, 132, y + 34, 190, 14, 7);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      roundRect(ctx, 132, y + 62, 130, 12, 6);
    }
  });

/** Warm paper-ish texture for the open portfolio spread. */
export const makeSpreadTexture = () =>
  makeTexture(1024, 724, (ctx, w, h) => {
    ctx.fillStyle = "#faf7f0";
    ctx.fillRect(0, 0, w, h);

    // gutter shading
    const g = ctx.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, "rgba(90,70,50,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(w / 2 - 60, 0, 120, h);

    ctx.fillStyle = "#1c1c1e";
    ctx.font = "600 40px Georgia, serif";
    ctx.fillText("Portfolio", 70, 110);
    ctx.fillStyle = "#9a948a";
    ctx.font = "400 20px Georgia, serif";
    ctx.fillText("2021 — 2026", 70, 146);

    ctx.fillStyle = "#d9d2c6";
    roundRect(ctx, 70, 190, 360, 250, 6);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = "#cfc8bc";
      roundRect(ctx, 70, 480 + i * 26, i === 6 ? 200 : 360, 10, 5);
    }
    ctx.fillStyle = "#c9c2b6";
    roundRect(ctx, w / 2 + 60, 120, 360, 460, 6);
    ctx.fillStyle = "#9a948a";
    ctx.font = "400 18px Georgia, serif";
    ctx.fillText("01", w / 2 + 60, 610);
  });
