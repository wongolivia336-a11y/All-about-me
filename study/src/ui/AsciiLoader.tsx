import { useEffect, useRef, useState } from "react";

type AsciiLoaderProps = {
  active: boolean;
  error?: string | null;
  onRetry?: () => void;
};

type GlyphAtlas = {
  drawHeight: number;
  drawWidth: number;
  glyphs: HTMLCanvasElement[][];
};

type PortraitBounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type Field = {
  baseDensity: Float32Array;
  cellHeight: number;
  cellWidth: number;
  columns: number;
  energy: Float32Array;
  height: number;
  offsetX: Float32Array;
  offsetY: Float32Array;
  phaseA: Float32Array;
  phaseB: Float32Array;
  phaseC: Float32Array;
  portraitDensity: Float32Array;
  portraitShield: Float32Array;
  portraitWeight: Float32Array;
  rows: number;
  velocityX: Float32Array;
  velocityY: Float32Array;
  voidMask: Float32Array;
  width: number;
  x: Float32Array;
  y: Float32Array;
};

const glyphRamp = ".,:;irsXA253hMHGS#9B&@";
const minimumPortraitExposure = 680;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const random = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + seed * seed * 0.00011) * 43758.5453;
  return value - Math.floor(value);
};

function buildField(width: number, height: number, mobile: boolean): Field {
  const desiredCellWidth = mobile ? 6.2 : 9.6;
  const columns = clamp(Math.floor(width / desiredCellWidth), mobile ? 56 : 72, mobile ? 84 : 142);
  const cellWidth = width / columns;
  const cellHeight = cellWidth * 1.52;
  const rows = clamp(Math.ceil(height / cellHeight), mobile ? 48 : 46, mobile ? 112 : 92);
  const count = columns * rows;
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const phaseA = new Float32Array(count);
  const phaseB = new Float32Array(count);
  const phaseC = new Float32Array(count);
  const baseDensity = new Float32Array(count);
  const voidMask = new Float32Array(count);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const seed = index * 1.618 + row * 7.11 + column * 0.17;
      const stagger = row % 2 === 0 ? 0 : 0.48;
      x[index] = (column + stagger + 0.5) * cellWidth;
      y[index] = (row + 0.5) * cellHeight;
      // Coherent spatial phases make a continuous field. The tiny seeded
      // offsets keep it organic without degenerating into per-cell flicker.
      phaseA[index] = column * 0.072 + row * 0.045 + (random(seed + 1) - 0.5) * 0.45;
      phaseB[index] = column * -0.052 + row * 0.075 + (random(seed + 2) - 0.5) * 0.34;
      phaseC[index] = (column + row) * 0.028 + (random(seed + 3) - 0.5) * 0.24;
      baseDensity[index] = random(seed + 4);
      // Coherent macro masks leave breathing room; per-cell randomness alone
      // would turn the entire viewport into visually tiring static.
      const macro =
        (Math.sin(column * 0.075 + row * 0.03) * 0.45 +
          Math.cos(column * 0.04 - row * 0.065) * 0.35 +
          Math.sin((column + row) * 0.02) * 0.2 +
          1) /
        2;
      voidMask[index] = 0.1 + macro * 0.9;
    }
  }

  return {
    baseDensity,
    cellHeight,
    cellWidth,
    columns,
    energy: new Float32Array(count),
    height,
    offsetX: new Float32Array(count),
    offsetY: new Float32Array(count),
    phaseA,
    phaseB,
    phaseC,
    portraitDensity: new Float32Array(count),
    portraitShield: new Float32Array(count),
    portraitWeight: new Float32Array(count),
    rows,
    velocityX: new Float32Array(count),
    velocityY: new Float32Array(count),
    voidMask,
    width,
    x,
    y,
  };
}

function buildGlyphAtlas(cellWidth: number, cellHeight: number, ratio: number): GlyphAtlas {
  const drawWidth = cellWidth * 1.22;
  const drawHeight = cellHeight * 1.08;
  const fontSize = Math.max(7, cellWidth * 1.3);
  const tones = ["#7c8786", "#a8b1af", "#d7ddda"];

  return {
    drawWidth,
    drawHeight,
    glyphs: tones.map((tone) =>
      Array.from(glyphRamp, (glyph) => {
        const tile = document.createElement("canvas");
        tile.width = Math.ceil(drawWidth * ratio);
        tile.height = Math.ceil(drawHeight * ratio);
        const context = tile.getContext("2d");
        if (!context) return tile;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.fillStyle = tone;
        context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(glyph, drawWidth / 2, drawHeight / 2);
        return tile;
      }),
    ),
  };
}

function getPortraitBounds(width: number, height: number, image: HTMLImageElement, mobile: boolean): PortraitBounds {
  const aspect = mobile ? 0.72 : image.naturalWidth / image.naturalHeight;
  const maximumWidth = width * (mobile ? 0.8 : 0.76);
  const maximumHeight = height * (mobile ? 0.68 : 0.74);
  let portraitWidth = maximumWidth;
  let portraitHeight = portraitWidth / aspect;
  if (portraitHeight > maximumHeight) {
    portraitHeight = maximumHeight;
    portraitWidth = portraitHeight * aspect;
  }

  return {
    height: portraitHeight,
    width: portraitWidth,
    x: (width - portraitWidth) / 2,
    y: (height - portraitHeight) / 2,
  };
}

/**
 * The image is sampled once into typed arrays; it is never composited onto
 * the visible canvas. Every visible pixel of the portrait remains a glyph.
 */
function rasterizePortrait(
  field: Field,
  image: HTMLImageElement,
  sample: HTMLCanvasElement,
  sampleContext: CanvasRenderingContext2D,
  mobile: boolean,
) {
  const bounds = getPortraitBounds(field.width, field.height, image, mobile);
  sample.width = field.columns;
  sample.height = field.rows;
  sampleContext.clearRect(0, 0, sample.width, sample.height);
  const sourceX = mobile ? image.naturalWidth * 0.25 : 0;
  const sourceWidth = mobile ? image.naturalWidth * 0.5 : image.naturalWidth;
  sampleContext.drawImage(
    image,
    sourceX,
    0,
    sourceWidth,
    image.naturalHeight,
    bounds.x / field.cellWidth,
    bounds.y / field.cellHeight,
    bounds.width / field.cellWidth,
    bounds.height / field.cellHeight,
  );
  const pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;

  field.portraitDensity.fill(0);
  field.portraitWeight.fill(0);
  field.portraitShield.fill(0);

  for (let index = 0; index < field.x.length; index += 1) {
    const sampleColumn = clamp(Math.floor(field.x[index] / field.cellWidth), 0, field.columns - 1);
    const sampleRow = clamp(Math.floor(field.y[index] / field.cellHeight), 0, field.rows - 1);
    const pixelIndex = (sampleRow * field.columns + sampleColumn) * 4;
    const alpha = pixels[pixelIndex + 3] / 255;
    if (alpha <= 0.01) continue;

    const luma =
      (pixels[pixelIndex] * 0.2126 + pixels[pixelIndex + 1] * 0.7152 + pixels[pixelIndex + 2] * 0.0722) /
      255;
    const localX = (field.x[index] - bounds.x) / bounds.width;
    const localY = (field.y[index] - bounds.y) / bounds.height;
    const edge = Math.min(localX, 1 - localX, localY, 1 - localY);
    const edgeFade = clamp(edge / 0.04, 0, 1);
    const faceShield = Math.exp(-((localX - 0.5) ** 2) / 0.018 - ((localY - 0.235) ** 2) / 0.018);

    field.portraitDensity[index] = clamp((luma - 0.025) / 0.975, 0, 1);
    field.portraitWeight[index] = alpha * edgeFade;
    field.portraitShield[index] = field.portraitWeight[index] * faceShield;
  }
}

/**
 * A three-layer typographic field: stable portrait density, gentle flow, and
 * temporary pointer impulses. Neither motion layer mutates source density.
 */
export function AsciiLoader({ active, error = null, onRetry }: AsciiLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<(() => void) | null>(null);
  const presentedStateRef = useRef(active);
  const [presented, setPresented] = useState(active);

  useEffect(() => {
    const wasActive = activeRef.current;
    activeRef.current = active;
    if (active !== wasActive) wakeRef.current?.();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const sample = document.createElement("canvas");
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;
    const image = new Image();
    image.decoding = "async";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let portraitReady = false;
    let field: Field | null = null;
    let atlas: GlyphAtlas | null = null;
    let lastTime = 0;
    let portraitShownAt = 0;
    let presence = 0;
    let animationFrame = 0;
    let running = false;
    let presentedRef = presentedStateRef.current;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerAt = 0;
    let reducedMotionDismissTimer = 0;

    const rebuildPortrait = () => {
      if (!field || !portraitReady || !image.naturalWidth) return;
      rasterizePortrait(field, image, sample, sampleContext, field.width < 680);
    };

    const fitCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const mobile = bounds.width < 680;
      const ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (!field || field.width !== width || field.height !== height) {
        field = buildField(width, height, mobile);
        atlas = buildGlyphAtlas(field.cellWidth, field.cellHeight, ratio);
        rebuildPortrait();
      }
      return { height, width };
    };

    const disturb = (x: number, y: number, velocityX: number, velocityY: number) => {
      if (!field) return;
      const speed = Math.min(1, Math.hypot(velocityX, velocityY) / 1150);
      const radius = clamp(Math.min(field.width, field.height) * (field.width < 680 ? 0.165 : 0.12), 68, 156);
      const minimumRow = Math.max(0, Math.floor((y - radius) / field.cellHeight) - 1);
      const maximumRow = Math.min(field.rows - 1, Math.ceil((y + radius) / field.cellHeight) + 1);
      const minimumColumn = Math.max(0, Math.floor((x - radius) / field.cellWidth) - 2);
      const maximumColumn = Math.min(field.columns - 1, Math.ceil((x + radius) / field.cellWidth) + 2);
      const motionLength = Math.hypot(velocityX, velocityY) || 1;
      const motionX = velocityX / motionLength;
      const motionY = velocityY / motionLength;

      for (let row = minimumRow; row <= maximumRow; row += 1) {
        for (let column = minimumColumn; column <= maximumColumn; column += 1) {
          const index = row * field.columns + column;
          const dx = field.x[index] - x;
          const dy = field.y[index] - y;
          const distance = Math.hypot(dx, dy);
          if (distance >= radius) continue;

          const falloff = (1 - distance / radius) ** 2;
          const safeDistance = distance || 1;
          const radialX = dx / safeDistance;
          const radialY = dy / safeDistance;
          const swirlX = -radialY;
          const swirlY = radialX;
          const portraitProtection = 1 - field.portraitWeight[index] * 0.46 - field.portraitShield[index] * 0.22;
          const impulse = 92 * falloff * (0.58 + speed * 0.82) * portraitProtection;
          field.velocityX[index] += (radialX * 0.4 + swirlX * 0.32 + motionX * 0.54) * impulse;
          field.velocityY[index] += (radialY * 0.3 + swirlY * 0.26 + motionY * 0.38) * impulse;
          field.energy[index] = Math.min(
            1.25,
            field.energy[index] + falloff * (0.34 + speed * 0.58) * portraitProtection,
          );
        }
      }
    };

    const render = (time: number) => {
      const { width, height } = fitCanvas();
      if (!field || !atlas) return;
      if (portraitReady && !portraitShownAt) {
        portraitShownAt = time;
        if (reducedMotion) {
          window.clearTimeout(reducedMotionDismissTimer);
          reducedMotionDismissTimer = window.setTimeout(() => wake(), 520);
        }
      }

      const delta = lastTime ? Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000)) : 0.016;
      lastTime = time;
      const minimumExposure =
        portraitShownAt > 0 && time - portraitShownAt < (reducedMotion ? 520 : minimumPortraitExposure);
      // The shell has painted only when the portrait source has been sampled;
      // a slow image request must not let the loader fade as a blank field.
      const targetPresence = activeRef.current || !portraitReady || minimumExposure ? 1 : 0;
      presence += (targetPresence - presence) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 4.8));

      context.globalAlpha = 1;
      context.fillStyle = "#090b0c";
      context.fillRect(0, 0, width, height);

      const seconds = time / 1000;
      for (let index = 0; index < field.x.length; index += 1) {
        const row = Math.floor(index / field.columns);
        const lowFrequency =
          Math.sin(seconds * 0.27 + field.phaseA[index]) * 0.48 +
          Math.sin(seconds * 0.16 + field.phaseB[index]) * 0.31 +
          Math.sin(seconds * 0.075 + field.phaseC[index]) * 0.21;
        const scaleLift = Math.sin(seconds * 0.44 + field.phaseC[index] + row * 0.12) * 0.5 + 0.5;
        const fluid = lowFrequency * 0.5 + (scaleLift - 0.5) * 0.34;
        const portraitWeight = field.portraitWeight[index];
        const portraitShield = field.portraitShield[index];
        const energy = field.energy[index];

        field.velocityX[index] += -field.offsetX[index] * 32 * delta;
        field.velocityY[index] += -field.offsetY[index] * 32 * delta;
        const damping = Math.exp(-delta * 8.2);
        field.velocityX[index] *= damping;
        field.velocityY[index] *= damping;
        field.offsetX[index] = clamp(
          field.offsetX[index] + field.velocityX[index] * delta,
          -field.cellWidth * 1.15,
          field.cellWidth * 1.15,
        );
        field.offsetY[index] = clamp(
          field.offsetY[index] + field.velocityY[index] * delta,
          -field.cellHeight * 0.8,
          field.cellHeight * 0.8,
        );
        field.energy[index] *= Math.exp(-delta * 4.5);

        const backgroundDensity = clamp(0.12 + field.baseDensity[index] * 0.3 + fluid * 0.14 + energy * 0.1, 0, 1);
        const portraitDensity = clamp(field.portraitDensity[index] + fluid * 0.055 + energy * 0.055, 0, 1);
        const density = backgroundDensity + (portraitDensity - backgroundDensity) * portraitWeight;
        const negativeSpace = clamp(field.voidMask[index] + fluid * 0.16, 0.04, 1);
        const portraitAlpha = 0.1 + portraitDensity * 0.84 + energy * 0.06;
        const backgroundAlpha = negativeSpace * (0.045 + backgroundDensity * 0.19 + energy * 0.06);
        const alpha = presence * (backgroundAlpha + (portraitAlpha - backgroundAlpha) * portraitWeight);
        if (alpha < 0.028) continue;

        const level = clamp(Math.floor(density * (glyphRamp.length - 1)), 0, glyphRamp.length - 1);
        const tone = energy > 0.56 ? 2 : portraitWeight > 0.1 && density > 0.52 ? 1 : 0;
        const motionScale = 1 - portraitWeight * 0.56 - portraitShield * 0.22;
        const driftX =
          (Math.sin(seconds * 0.34 + field.phaseA[index]) * field.cellWidth * 0.18 +
            Math.cos(seconds * 0.13 + field.phaseC[index]) * field.cellWidth * 0.08) *
          motionScale;
        const driftY =
          (Math.cos(seconds * 0.24 + field.phaseB[index]) * field.cellHeight * 0.1 +
            Math.sin(seconds * 0.11 + field.phaseA[index]) * field.cellHeight * 0.06) *
          motionScale;
        const x = field.x[index] + field.offsetX[index] * motionScale + driftX;
        const y = field.y[index] + field.offsetY[index] * motionScale + driftY;
        const rotation =
          (energy * 0.075 + Math.sin(seconds * 0.22 + field.phaseC[index]) * 0.012) * motionScale;
        const glyph = atlas.glyphs[tone][level];

        context.globalAlpha = alpha;
        if (energy > 0.16 || index % 13 === 0) {
          context.save();
          context.translate(x, y);
          context.rotate(rotation);
          context.drawImage(glyph, -atlas.drawWidth / 2, -atlas.drawHeight / 2, atlas.drawWidth, atlas.drawHeight);
          context.restore();
        } else {
          context.drawImage(
            glyph,
            x - atlas.drawWidth / 2,
            y - atlas.drawHeight / 2,
            atlas.drawWidth,
            atlas.drawHeight,
          );
        }
      }
      context.globalAlpha = 1;

      if (!activeRef.current && portraitReady && !minimumExposure && presence < 0.018 && presentedRef) {
        presentedRef = false;
        presentedStateRef.current = false;
        setPresented(false);
      }
    };

    const frame = (time: number) => {
      render(time);
      const shouldKeepRendering =
        !reducedMotion && (activeRef.current || !portraitReady || (presentedRef && presence >= 0.018));
      if (shouldKeepRendering) {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (activeRef.current && !presentedRef) {
        presentedRef = true;
        presentedStateRef.current = true;
        portraitShownAt = 0;
        presence = 0;
        setPresented(true);
      }
      if (running) return;
      running = true;
      animationFrame = window.requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const trackPointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = clamp(event.clientX - bounds.left, 0, bounds.width);
      const y = clamp(event.clientY - bounds.top, 0, bounds.height);
      const now = performance.now();
      const elapsed = Math.max(16, now - lastPointerAt || 16);
      const velocityX = ((x - lastPointerX) / elapsed) * 1000;
      const velocityY = ((y - lastPointerY) / elapsed) * 1000;
      disturb(x, y, velocityX, velocityY);
      lastPointerX = x;
      lastPointerY = y;
      lastPointerAt = now;
      wake();
    };

    const startPointer = (event: PointerEvent) => {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is progressive enhancement; the field remains usable.
      }
      trackPointer(event);
    };
    const endPointer = (event: PointerEvent) => {
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Capture can have been released automatically by the browser.
      }
    };
    const sourceReady = () => {
      portraitReady = true;
      portraitShownAt = 0;
      rebuildPortrait();
      wake();
    };
    const sourceFailed = () => {
      // Keep lifecycle safe if the local asset is unexpectedly unavailable.
      // The production path always uses the checked-in portrait source.
      portraitReady = true;
      wake();
    };

    image.addEventListener("load", sourceReady);
    image.addEventListener("error", sourceFailed);
    image.src = "/images/steve-jobs-macintosh.png";
    canvas.addEventListener("pointerdown", startPointer, { passive: true });
    canvas.addEventListener("pointermove", trackPointer, { passive: true });
    canvas.addEventListener("pointerup", endPointer, { passive: true });
    canvas.addEventListener("pointercancel", endPointer, { passive: true });
    window.addEventListener("resize", wake, { passive: true });
    wake();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(reducedMotionDismissTimer);
      image.removeEventListener("load", sourceReady);
      image.removeEventListener("error", sourceFailed);
      canvas.removeEventListener("pointerdown", startPointer);
      canvas.removeEventListener("pointermove", trackPointer);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      window.removeEventListener("resize", wake);
      wakeRef.current = null;
      field = null;
      atlas = null;
    };
  }, []);

  const className = [
    "ascii-loader",
    !presented && "ascii-loader--hidden",
    presented && !active && "ascii-loader--settling",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-hidden={!presented}>
      <span className="sr-only" role="status" aria-live="polite">
        正在载入 The Study
      </span>
      <canvas ref={canvasRef} className="ascii-loader__canvas" />
      {error && onRetry && (
        <button className="ascii-loader__retry" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
