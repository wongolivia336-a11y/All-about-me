import { useEffect, useRef } from "react";

type AsciiLoaderProps = {
  active: boolean;
  onInitialReady: () => void;
};

const ramp = " .,:;irsXA253hMHGS#9B&@";
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type CursorState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  velocity: number;
};

/**
 * A tiny software rasteriser for the boot screen. It samples the supplied
 * photograph into a character grid; no external ASCII service or runtime
 * dependency is required, and the original image never leaves the visitor's
 * browser after download.
 */
export function AsciiLoader({ active, onInitialReady }: AsciiLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const onInitialReadyRef = useRef(onInitialReady);
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeRef.current = active;
    if (active) wakeRef.current?.();
  }, [active]);

  useEffect(() => {
    onInitialReadyRef.current = onInitialReady;
  }, [onInitialReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      onInitialReadyRef.current();
      return;
    }
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      onInitialReadyRef.current();
      return;
    }

    const sample = document.createElement("canvas");
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) {
      onInitialReadyRef.current();
      return;
    }

    const image = new Image();
    image.decoding = "async";

    const cursor: CursorState = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      velocity: 0,
    };
    let smoothedLuma = new Float32Array();
    let flow = new Float32Array();
    let columns = 0;
    let rows = 0;
    let sourceReady = false;
    let sourceFailed = false;
    let imageRenderedAt = 0;
    let initialReadySent = false;
    let animationFrame = 0;
    let running = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fitCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { width: bounds.width, height: bounds.height };
    };

    const signalInitialReady = () => {
      if (initialReadySent || !sourceReady) return;
      initialReadySent = true;
      window.requestAnimationFrame(() => onInitialReadyRef.current());
    };

    const render = (time: number) => {
      const { width, height } = fitCanvas();
      context.fillStyle = "#090a0b";
      context.fillRect(0, 0, width, height);

      if (!sourceReady || !image.naturalWidth) {
        context.fillStyle = "#d5d7d3";
        context.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText("::", width / 2 - 7, height / 2);
        if (sourceFailed) signalInitialReady();
        return;
      }

      const imageAspect = image.naturalWidth / image.naturalHeight;
      let renderWidth = Math.min(width * 0.88, height * imageAspect * 0.78);
      let renderHeight = renderWidth / imageAspect;
      if (renderHeight > height * 0.78) {
        renderHeight = height * 0.78;
        renderWidth = renderHeight * imageAspect;
      }
      const originX = (width - renderWidth) / 2;
      const originY = (height - renderHeight) / 2;
      if (!imageRenderedAt) imageRenderedAt = time;
      const mobile = width < 680;
      const nextColumns = clamp(Math.floor(renderWidth / (mobile ? 7.4 : 8.7)), 42, 118);
      const cellWidth = renderWidth / nextColumns;
      const nextRows = clamp(Math.floor(renderHeight / (cellWidth * 1.62)), 26, 76);

      if (columns !== nextColumns || rows !== nextRows) {
        columns = nextColumns;
        rows = nextRows;
        smoothedLuma = new Float32Array(columns * rows);
        flow = new Float32Array(columns * rows);
        sample.width = columns;
        sample.height = rows;
      }

      sampleContext.clearRect(0, 0, columns, rows);
      sampleContext.drawImage(image, 0, 0, columns, rows);
      const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
      const cellHeight = renderHeight / rows;

      const nextX = cursor.x + (cursor.targetX - cursor.x) * 0.14;
      const nextY = cursor.y + (cursor.targetY - cursor.y) * 0.14;
      cursor.velocity = Math.min(1, Math.hypot(nextX - cursor.x, nextY - cursor.y) * 12);
      cursor.x = nextX;
      cursor.y = nextY;

      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${Math.max(6, cellWidth * 1.26)}px ui-monospace, SFMono-Regular, Menlo, monospace`;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const pixelIndex = index * 4;
          const targetLuma =
            (pixels[pixelIndex] * 0.2126 +
              pixels[pixelIndex + 1] * 0.7152 +
              pixels[pixelIndex + 2] * 0.0722) /
            255;
          smoothedLuma[index] += (targetLuma - smoothedLuma[index]) * (reducedMotion ? 1 : 0.13);

          const normalizedX = (column + 0.5) / columns;
          const normalizedY = (row + 0.5) / rows;
          const distanceX = normalizedX - cursor.x;
          const distanceY = normalizedY - cursor.y;
          const distanceSquared = distanceX * distanceX + distanceY * distanceY;
          const proximity = Math.exp(-distanceSquared / 0.014);
          const flowTarget = reducedMotion ? 0 : proximity * (0.46 + cursor.velocity * 0.9);
          flow[index] += (flowTarget - flow[index]) * 0.16;

          const level = clamp(Math.floor(smoothedLuma[index] * (ramp.length - 1)), 0, ramp.length - 1);
          const character = ramp[level];
          if (character === " ") continue;

          const distance = Math.sqrt(distanceSquared) + 0.0001;
          const wave = Math.sin(time * 0.004 - distance * 36 + column * 0.16) * flow[index];
          const push = wave * cellWidth * 1.55;
          const x = originX + (column + 0.5) * cellWidth + (distanceX / distance) * push;
          const y = originY + (row + 0.5) * cellHeight + (distanceY / distance) * push * 0.42;
          const alpha = clamp(0.12 + smoothedLuma[index] * 0.9 + flow[index] * 0.12, 0, 1);

          context.fillStyle = `rgba(238, 240, 235, ${alpha})`;
          context.fillText(character, x, y);
        }
      }

      if (reducedMotion || time - imageRenderedAt >= 540) signalInitialReady();
    };

    const frame = (time: number) => {
      render(time);
      if (activeRef.current && !reducedMotion) {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      animationFrame = window.requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      cursor.targetX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      cursor.targetY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
      wake();
    };
    const leavePointer = () => {
      cursor.targetX = 0.5;
      cursor.targetY = 0.5;
    };
    const imageLoaded = () => {
      sourceReady = true;
      wake();
    };
    const imageFailed = () => {
      sourceFailed = true;
      imageLoaded();
    };

    image.addEventListener("load", imageLoaded);
    image.addEventListener("error", imageFailed);
    image.src = "/images/steve-jobs-macintosh.png";
    canvas.addEventListener("pointermove", updatePointer, { passive: true });
    canvas.addEventListener("pointerleave", leavePointer, { passive: true });
    window.addEventListener("resize", wake, { passive: true });
    wake();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      image.removeEventListener("load", imageLoaded);
      image.removeEventListener("error", imageFailed);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", leavePointer);
      window.removeEventListener("resize", wake);
      wakeRef.current = null;
    };
  }, []);

  return (
    <div className={`ascii-loader${active ? "" : " ascii-loader--hidden"}`} aria-hidden={!active}>
      <span className="sr-only" role="status">
        正在载入 The Study
      </span>
      <canvas ref={canvasRef} className="ascii-loader__canvas" />
    </div>
  );
}
