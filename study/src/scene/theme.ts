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

/**
 * The phone's home screen: the apps you actually publish to.
 * Icon marks and colours come from `data/links.ts` so the screen and the
 * panel behind it never disagree about what is on the phone.
 */
export const makeAppScreen = (
  apps: { mark: string; label: string; tone: string }[],
) =>
  makeTexture(512, 1040, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#39566f");
    g.addColorStop(0.55, "#2b3f56");
    g.addColorStop(1, "#1d2a3a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // status bar
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "600 24px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("9:41", 36, 56);
    ctx.textAlign = "right";
    ctx.fillText("▮▮▮", w - 36, 56);
    ctx.textAlign = "left";

    // date widget
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "300 92px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("9:41", 40, 220);
    ctx.font = "400 26px -apple-system, Segoe UI, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("周一  8月17日", 44, 262);

    // icon grid
    const cols = 3;
    const icon = 104;
    const gapX = (w - cols * icon - 80) / (cols - 1);
    apps.slice(0, 9).forEach((app, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 40 + col * (icon + gapX);
      const y = 360 + row * (icon + 66);

      ctx.fillStyle = app.tone;
      roundRect(ctx, x, y, icon, icon, 26);

      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.font = "600 44px -apple-system, PingFang SC, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(app.mark, x + icon / 2, y + icon / 2 + 16);

      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.font = "400 20px -apple-system, PingFang SC, Segoe UI, sans-serif";
      ctx.fillText(app.label, x + icon / 2, y + icon + 30);
      ctx.textAlign = "left";
    });

    // dock
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, 34, h - 168, w - 68, 132, 34);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    roundRect(ctx, w / 2 - 70, h - 26, 140, 6, 3);
  });

/** Woven speaker cloth for the Marshall front. */
export const makeGrilleTexture = () =>
  makeTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#141212";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(210,200,185,0.20)";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,240,220,0.05)";
    for (let i = 0; i < 900; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  });

// Poster artwork lives in ./poster.ts — it grew its own motif system and no
// longer belongs in the shared texture grab-bag.

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
