import * as THREE from "three";

/**
 * Drawn surfaces: sketchbook pages, the whiteboard, and the ring a mug leaves
 * behind. Same approach as the posters — canvas at runtime, nothing shipped.
 *
 * The sketchbook is deliberately close to blank. Inventing convincing design
 * sketches would be putting work in her book that she did not draw; dot-grid
 * paper with a margin and a couple of guide lines reads as a sketchbook in use
 * and swaps out cleanly the moment real scans exist.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

function texture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const rand = (s: number) => {
  const x = Math.sin(s * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** An open A5 spread: dot grid, margin rule, faint guides. */
export function makeSketchSpread() {
  const W = 1024;
  const H = 720;
  const { c, ctx } = canvas(W, H);

  ctx.fillStyle = "#f6f2e8";
  ctx.fillRect(0, 0, W, H);

  // gutter shadow down the middle
  const g = ctx.createLinearGradient(W / 2 - 54, 0, W / 2 + 54, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, "rgba(94,76,54,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(W / 2 - 54, 0, 108, H);

  // dot grid, skipping the gutter
  ctx.fillStyle = "rgba(90,80,64,0.30)";
  for (let y = 46; y < H - 30; y += 22) {
    for (let x = 40; x < W - 30; x += 22) {
      if (Math.abs(x - W / 2) < 48) continue;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }

  // margin rules
  ctx.strokeStyle = "rgba(178,120,110,0.35)";
  ctx.lineWidth = 1.4;
  [104, W / 2 + 104].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x, H - 30);
    ctx.stroke();
  });

  // a couple of very light construction guides — the book is in use, not full
  ctx.strokeStyle = "rgba(110,100,86,0.22)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(150, 500);
  ctx.lineTo(430, 380);
  ctx.moveTo(150, 500);
  ctx.lineTo(150, 250);
  ctx.moveTo(430, 380);
  ctx.lineTo(430, 150);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(700, 300, 96, 34, -0.2, 0, Math.PI * 2);
  ctx.stroke();

  // page numbers
  ctx.fillStyle = "rgba(120,108,92,0.5)";
  ctx.font = "400 17px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("42", W / 4, H - 34);
  ctx.fillText("43", (W / 4) * 3, H - 34);
  ctx.textAlign = "left";

  // paper tooth
  for (let i = 0; i < 5200; i++) {
    const x = rand(i + 2) * W;
    const y = rand(i + 2.5) * H;
    ctx.fillStyle = `rgba(120,105,85,${0.014 + rand(i + 4) * 0.03})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  return texture(c);
}

/**
 * The unfinished corner. Boxes, arrows and sticky notes with no legible
 * claims on them — the point is that it looks like thinking in progress, not
 * that it says anything in particular.
 */
export function makeWhiteboard() {
  const W = 1024;
  const H = 700;
  const { c, ctx } = canvas(W, H);

  ctx.fillStyle = "#f7f7f4";
  ctx.fillRect(0, 0, W, H);

  // ghosting from things wiped off before
  ctx.strokeStyle = "rgba(90,110,130,0.07)";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(rand(i) * W, rand(i + 0.4) * H);
    ctx.lineTo(rand(i + 0.8) * W, rand(i + 1.2) * H);
    ctx.stroke();
  }
  ctx.lineCap = "butt";

  // a half-drawn flow
  const boxes = [
    { x: 90, y: 150, w: 168, h: 92 },
    { x: 350, y: 120, w: 168, h: 92 },
    { x: 350, y: 300, w: 168, h: 92 },
    { x: 620, y: 210, w: 168, h: 92 },
  ];
  ctx.strokeStyle = "#3c4a5a";
  ctx.lineWidth = 3;
  boxes.forEach((b, i) => {
    ctx.globalAlpha = i === 3 ? 0.35 : 1; // last one still tentative
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 8);
    ctx.stroke();
    ctx.fillStyle = "rgba(60,74,90,0.18)";
    ctx.fillRect(b.x + 20, b.y + 30, b.w - 78, 7);
    ctx.fillRect(b.x + 20, b.y + 50, b.w - 110, 7);
  });
  ctx.globalAlpha = 1;

  // arrows
  const arrow = (x1: number, y1: number, x2: number, y2: number, dashed = false) => {
    ctx.setLineDash(dashed ? [9, 8] : []);
    ctx.strokeStyle = dashed ? "rgba(60,74,90,0.4)" : "#3c4a5a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 13 * Math.cos(a - 0.4), y2 - 13 * Math.sin(a - 0.4));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 13 * Math.cos(a + 0.4), y2 - 13 * Math.sin(a + 0.4));
    ctx.stroke();
    ctx.setLineDash([]);
  };
  arrow(258, 190, 344, 166);
  arrow(258, 200, 344, 340);
  arrow(518, 166, 614, 240, true);
  arrow(518, 340, 614, 270, true);

  // a question mark where the thinking stops
  ctx.fillStyle = "rgba(200,90,70,0.75)";
  ctx.font = "600 76px Georgia, serif";
  ctx.fillText("?", 840, 290);

  // sticky notes
  const notes = [
    { x: 96, y: 430, c: "#f5e07c", r: -0.03 },
    { x: 250, y: 452, c: "#f2a8b6", r: 0.04 },
    { x: 404, y: 436, c: "#a9d8f2", r: -0.02 },
    { x: 560, y: 458, c: "#c7e8b6", r: 0.03 },
  ];
  notes.forEach((n, i) => {
    ctx.save();
    ctx.translate(n.x + 62, n.y + 62);
    ctx.rotate(n.r);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(-60, -58, 124, 124);
    ctx.fillStyle = n.c;
    ctx.fillRect(-62, -62, 124, 124);
    ctx.fillStyle = "rgba(60,55,45,0.34)";
    for (let l = 0; l < 3 + (i % 2); l++) {
      ctx.fillRect(-42, -30 + l * 22, 84 - (l === 2 ? 34 : 0), 6);
    }
    ctx.restore();
  });

  // marker tray smudge along the bottom
  ctx.fillStyle = "rgba(60,74,90,0.06)";
  ctx.fillRect(0, H - 46, W, 46);

  return texture(c);
}

/** A dried ring, drawn with alpha so it sits on the desk as a stain. */
export function makeCoffeeRing() {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  ctx.clearRect(0, 0, S, S);

  const cx = S / 2;
  const cy = S / 2;
  // the rim is darkest — coffee dries outward and concentrates at the edge
  const g = ctx.createRadialGradient(cx, cy, S * 0.3, cx, cy, S * 0.42);
  g.addColorStop(0, "rgba(90,58,34,0)");
  g.addColorStop(0.72, "rgba(90,58,34,0.05)");
  g.addColorStop(0.9, "rgba(84,52,30,0.34)");
  g.addColorStop(1, "rgba(90,58,34,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // break the ring up so it is not a perfect circle
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 26; i++) {
    const a = rand(i) * Math.PI * 2;
    const r = S * (0.36 + rand(i + 0.5) * 0.08);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4 + rand(i + 1) * 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  return texture(c);
}
