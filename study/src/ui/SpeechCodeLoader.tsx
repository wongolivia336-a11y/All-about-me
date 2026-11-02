import { useEffect, useRef, useState } from "react";
import "./SpeechCodeLoader.css";

type SpeechCodeLoaderProps = {
  active: boolean;
  error?: string | null;
  onRetry?: () => void;
};

type Cell = {
  x: number;
  y: number;
  row: number;
  code: string;
  mark: number;
  phase: number;
};

type CodeField = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  cells: Cell[];
  offsetX: Float32Array;
  offsetY: Float32Array;
  velocityX: Float32Array;
  velocityY: Float32Array;
  energy: Float32Array;
  tiles: Map<string, HTMLCanvasElement>;
};

// Short excerpts from the 2005 Stanford address. Every character, including
// spaces and punctuation, is encoded as a three-digit ASCII value in the field.
const speechExcerpt =
  "Your time is limited. Have the courage to follow your heart and intuition. Stay hungry. Stay foolish.";
const speechCodes = Array.from(speechExcerpt, (character) => character.charCodeAt(0).toString().padStart(3, "0"));
const exposureMs = 2600;
const reducedExposureMs = 900;
const exitMs = 520;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const palette = Array.from({ length: 16 }, (_, index) => {
  const position = index / 15;
  const start = [75, 111, 113];
  const middle = [153, 189, 176];
  const end = [247, 185, 121];
  const from = position < 0.55 ? start : middle;
  const to = position < 0.55 ? middle : end;
  const amount = position < 0.55 ? position / 0.55 : (position - 0.55) / 0.45;
  return `rgb(${from.map((component, channel) => Math.round(component + (to[channel] - component) * amount)).join(",")})`;
});

function makeField(width: number, height: number, ratio: number): CodeField {
  const mobile = width < 680;
  const columns = Math.max(12, Math.floor(width / (mobile ? 28 : 36)));
  const rows = Math.max(16, Math.ceil(height / (mobile ? 22 : 24)));
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const mask = document.createElement("canvas");
  mask.width = columns;
  mask.height = rows;
  const maskPen = mask.getContext("2d", { willReadFrequently: true });
  let markPixels: Uint8ClampedArray | null = null;

  if (maskPen) {
    maskPen.fillStyle = "white";
    maskPen.textAlign = "center";
    maskPen.textBaseline = "middle";
    maskPen.font = `600 ${Math.floor(Math.min(rows * (mobile ? 0.44 : 0.7), columns * (mobile ? 0.57 : 0.42)))}px system-ui, sans-serif`;
    maskPen.fillText("OW", columns * (mobile ? 0.5 : 0.69), rows * (mobile ? 0.37 : 0.5));
    markPixels = maskPen.getImageData(0, 0, columns, rows).data;
  }

  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      cells.push({
        x: (column + 0.5) * cellWidth,
        y: (row + 0.5) * cellHeight,
        row,
        code: speechCodes[index % speechCodes.length],
        mark: markPixels ? markPixels[index * 4 + 3] / 255 : 0,
        phase: column * 0.18 + row * 0.31,
      });
    }
  }

  const tiles = new Map<string, HTMLCanvasElement>();
  const fontSize = Math.min(12, cellWidth * 0.39);
  for (const code of new Set(speechCodes)) {
    for (let tone = 0; tone < palette.length; tone += 1) {
      const tile = document.createElement("canvas");
      tile.width = Math.ceil(cellWidth * ratio);
      tile.height = Math.ceil(cellHeight * ratio);
      const pen = tile.getContext("2d");
      if (!pen) continue;
      pen.setTransform(ratio, 0, 0, ratio, 0, 0);
      pen.fillStyle = palette[tone];
      pen.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      pen.textAlign = "center";
      pen.textBaseline = "middle";
      pen.fillText(code, cellWidth / 2, cellHeight / 2);
      tiles.set(`${code}:${tone}`, tile);
    }
  }

  const count = cells.length;
  return {
    width, height, cellWidth, cellHeight, cells, tiles,
    offsetX: new Float32Array(count),
    offsetY: new Float32Array(count),
    velocityX: new Float32Array(count),
    velocityY: new Float32Array(count),
    energy: new Float32Array(count),
  };
}

export function SpeechCodeLoader({ active, error = null, onRetry }: SpeechCodeLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shownAt = useRef(0);
  const [presented, setPresented] = useState(active);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!active) return;
    shownAt.current = performance.now();
    setPresented(true);
    setLeaving(false);
  }, [active]);

  useEffect(() => {
    if (active || !presented) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = Math.max(0, (reduced ? reducedExposureMs : exposureMs) - (performance.now() - shownAt.current));
    const leaveTimer = window.setTimeout(() => setLeaving(true), wait);
    const hideTimer = window.setTimeout(() => setPresented(false), wait + (reduced ? 0 : exitMs));
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [active, presented]);

  useEffect(() => {
    if (!presented) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let field: CodeField | null = null;
    let frameId = 0;
    let lastPaint = 0;
    let ratio = 1;
    let pointerX = -1000;
    let pointerY = -1000;
    let previousX = -1000;
    let previousY = -1000;
    let previousPointerAt = 0;

    const fit = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const nextRatio = Math.min(window.devicePixelRatio || 1, width < 680 ? 1.25 : 1.5);
      if (field && field.width === width && field.height === height && ratio === nextRatio) return;
      ratio = nextRatio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      field = makeField(width, height, ratio);
    };

    const disturb = (x: number, y: number, dx: number, dy: number, strength: number) => {
      if (!field || reduced) return;
      const radius = field.width < 680 ? 106 : 148;
      for (let index = 0; index < field.cells.length; index += 1) {
        const cell = field.cells[index];
        const distanceX = cell.x - x;
        const distanceY = cell.y - y;
        const distance = Math.hypot(distanceX, distanceY);
        if (distance >= radius) continue;
        const falloff = (1 - distance / radius) ** 2;
        const push = (28 + strength * 34) * falloff;
        const outwardX = distanceX / (distance || 1);
        const outwardY = distanceY / (distance || 1);
        field.velocityX[index] += (outwardX * 0.48 - outwardY * 0.16 + dx * 0.36) * push;
        field.velocityY[index] += (outwardY * 0.48 + outwardX * 0.16 + dy * 0.36) * push;
        field.energy[index] = Math.min(1.3, field.energy[index] + falloff * (0.35 + strength * 0.42));
      }
    };

    const paint = (now: number) => {
      fit();
      if (!field) return;
      const delta = lastPaint ? Math.min(0.08, (now - lastPaint) / 1000) : 0.05;
      lastPaint = now;
      context.clearRect(0, 0, field.width, field.height);
      const seconds = now / 1000;
      const stripePeriod = field.width + field.height * 0.35 + 320;
      const stripe = (((now - shownAt.current) / 3000) % 1) * stripePeriod - 160;
      const damping = Math.exp(-delta * 7.5);
      const energyFade = Math.exp(-delta * 1.1);

      for (let index = 0; index < field.cells.length; index += 1) {
        const cell = field.cells[index];
        field.velocityX[index] = (field.velocityX[index] - field.offsetX[index] * 25 * delta) * damping;
        field.velocityY[index] = (field.velocityY[index] - field.offsetY[index] * 25 * delta) * damping;
        field.offsetX[index] = clamp(field.offsetX[index] + field.velocityX[index] * delta, -12, 12);
        field.offsetY[index] = clamp(field.offsetY[index] + field.velocityY[index] * delta, -9, 9);
        field.energy[index] *= energyFade;

        const wave = reduced ? 0 :
          Math.sin(cell.phase + cell.x * 0.009 - seconds * 0.75) * 0.7 +
          Math.sin(cell.y * 0.018 - cell.x * 0.005 - seconds * 0.42) * 0.3;
        const distance = Math.abs(cell.x + cell.y * 0.35 - stripe);
        const shine = reduced ? 0 : Math.exp(-(distance * distance) / (82 * 82));
        const tone = clamp(Math.round((cell.mark * 0.5 + (wave + 1) * 0.07 + shine * 0.62 + field.energy[index] * 0.25) * 15), 0, 15);
        const alpha = clamp(
          (cell.mark > 0.08 ? 0.42 + cell.mark * 0.52 : 0.055 + Math.max(0, wave) * 0.05) +
            shine * 0.42 + field.energy[index] * 0.25,
          0.06,
          1,
        );
        const reveal = reduced ? 1 : clamp((now - shownAt.current - cell.row * 6) / 420, 0, 1);
        if (reveal <= 0) continue;
        const tile = field.tiles.get(`${cell.code}:${tone}`);
        if (!tile) continue;
        context.globalAlpha = alpha * reveal;
        const x = cell.x + wave * 2.2 + field.offsetX[index];
        const y = cell.y + wave * 1.2 + field.offsetY[index];
        context.drawImage(tile, x - field.cellWidth / 2, y - field.cellHeight / 2, field.cellWidth, field.cellHeight);
      }
      context.globalAlpha = 1;
    };

    const frame = (now: number) => {
      frameId = 0;
      if (document.hidden) return;
      if (reduced || lastPaint === 0 || now - lastPaint >= 50) paint(now);
      if (!reduced) frameId = window.requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!frameId && !document.hidden) frameId = window.requestAnimationFrame(frame);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (reduced) return;
      const bounds = canvas.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      const now = performance.now();
      const elapsed = Math.max(16, now - previousPointerAt);
      const dx = clamp((pointerX - previousX) / elapsed * 16, -1, 1);
      const dy = clamp((pointerY - previousY) / elapsed * 16, -1, 1);
      if (previousPointerAt) disturb(pointerX, pointerY, dx, dy, Math.min(1, Math.hypot(dx, dy)));
      previousX = pointerX;
      previousY = pointerY;
      previousPointerAt = now;
    };
    const onPointerDown = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      disturb(event.clientX - bounds.left, event.clientY - bounds.top, 0, -0.4, 1.6);
    };
    const observer = new ResizeObserver(() => {
      field = null;
      wake();
    });
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", wake);
    wake();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [presented]);

  return (
    <div className={["speech-loader", !presented && "speech-loader--hidden", leaving && "speech-loader--leaving"].filter(Boolean).join(" ")} aria-hidden={!presented}>
      <span className="sr-only" role="status" aria-live="polite">正在翻页</span>
      <canvas ref={canvasRef} className="speech-loader__canvas" aria-hidden="true" />
      <header className="speech-loader__header">
        <span>Olivia Wong</span>
        <span>All about me / The Study</span>
      </header>
      <div className="speech-loader__identity">
        <p>Room ↔ Index</p>
        <h1>Olivia<br />Wong</h1>
        <span aria-hidden="true">083 116 097 121 032 104 117 110 103 114 121</span>
      </div>
      <footer className="speech-loader__footer">
        <span>Turning the page</span>
        <a href="https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says" target="_blank" rel="noreferrer">
          Words from the 2005 Stanford address
        </a>
      </footer>
      {error && onRetry && (
        <div className="speech-loader__error">
          <span>{error}</span>
          <button type="button" onClick={onRetry}>Retry</button>
        </div>
      )}
    </div>
  );
}
