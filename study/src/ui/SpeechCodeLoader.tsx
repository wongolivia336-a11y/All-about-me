import { useEffect, useRef, useState } from "react";
import { cloverArt } from "../data/clover";
import "./SpeechCodeLoader.css";

type SpeechCodeLoaderProps = {
  active: boolean;
  error?: string | null;
  onRetry?: () => void;
  onReturnToIndex?: () => void;
};

type Glyph = {
  character: string;
  x: number;
  y: number;
  phase: number;
  energy: number;
};

const exposureMs = 1200;
const reducedExposureMs = 280;
const exitMs = 360;

const glyphsFromArt = (width: number, height: number, fontSize: number): Glyph[] => {
  const lines = cloverArt.split("\n");
  const lineHeight = fontSize * 1.08;
  const charWidth = fontSize * 0.62;
  const artWidth = Math.max(...lines.map((line) => line.length)) * charWidth;
  const startX = (width - artWidth) / 2;
  const startY = (height - lines.length * lineHeight) / 2;
  const glyphs: Glyph[] = [];

  lines.forEach((line, row) => {
    Array.from(line).forEach((character, column) => {
      if (character === " ") return;
      glyphs.push({
        character,
        x: startX + column * charWidth,
        y: startY + row * lineHeight,
        phase: row * 0.31 + column * 0.17,
        energy: 0,
      });
    });
  });

  return glyphs;
};

export function SpeechCodeLoader({ active, error = null, onRetry, onReturnToIndex }: SpeechCodeLoaderProps) {
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
    const wait = Math.max(
      0,
      (reduced ? reducedExposureMs : exposureMs) - (performance.now() - shownAt.current),
    );
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
    let glyphs: Glyph[] = [];
    let frameId = 0;
    let lastPaint = 0;
    let fittedWidth = 0;
    let fittedHeight = 0;
    let fittedFontSize = 0;
    let pointerX = -1000;
    let pointerY = -1000;

    const fit = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const fontSize = Math.max(11, Math.min(22, width * 0.015));
      if (width === fittedWidth && height === fittedHeight && fontSize === fittedFontSize) return;
      fittedWidth = width;
      fittedHeight = height;
      fittedFontSize = fontSize;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      glyphs = glyphsFromArt(width, height, fontSize);
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      context.textBaseline = "top";
    };

    const paint = (now: number) => {
      fit();
      const bounds = canvas.getBoundingClientRect();
      const delta = lastPaint ? Math.min(0.08, (now - lastPaint) / 1000) : 0.05;
      lastPaint = now;
      const seconds = now / 1000;
      context.clearRect(0, 0, bounds.width, bounds.height);

      for (const glyph of glyphs) {
        const distance = Math.hypot(glyph.x - pointerX, glyph.y - pointerY);
        const proximity = reduced ? 0 : Math.max(0, 1 - distance / 170);
        glyph.energy = Math.max(0, glyph.energy * Math.exp(-delta * 3.2) + proximity * 0.035);
        const wave = reduced ? 0 : Math.sin(seconds * 1.2 + glyph.phase) * 1.8;
        const alpha = 0.26 + glyph.energy * 0.8 + (glyph.character === "*" ? 0.26 : 0);
        context.globalAlpha = Math.min(0.95, alpha);
        context.fillStyle = glyph.character === "*" ? "#96735f" : "#697365";
        context.fillText(glyph.character, glyph.x + wave, glyph.y + wave * 0.35);
      }
      context.globalAlpha = 1;
    };

    const frame = (now: number) => {
      frameId = 0;
      if (document.hidden) return;
      if (reduced || lastPaint === 0 || now - lastPaint >= 42) paint(now);
      if (!reduced) frameId = window.requestAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
    };

    const onPointerLeave = () => {
      pointerX = -1000;
      pointerY = -1000;
    };

    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
    frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [presented]);

  return (
    <div className={["speech-loader", !presented && "speech-loader--hidden", leaving && "speech-loader--leaving"].filter(Boolean).join(" ")} aria-hidden={!presented}>
      <span className="sr-only" role="status" aria-live="polite">王心蕊，四叶草缓冲页</span>
      <canvas ref={canvasRef} className="speech-loader__canvas" aria-hidden="true" />
      {error && onRetry && (
        <div className="speech-loader__error">
          <span>{error}</span>
          <button type="button" onClick={onRetry}>Retry</button>
          {onReturnToIndex && (
            <button type="button" onClick={onReturnToIndex}>Return to Index</button>
          )}
        </div>
      )}
    </div>
  );
}
