import { forwardRef, useEffect, useRef } from "react";

interface PaperCornerProps {
  label: string;
  ariaLabel: string;
  title: string;
  onClick: () => void;
  onPeekChange?: (peeking: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A small canvas-made paper grain keeps the fold from reading as a flat SVG
 * triangle. The canvas is decorative; the button remains the semantic control.
 */
export const PaperCorner = forwardRef<HTMLButtonElement, PaperCornerProps>(function PaperCorner(
  {
    label,
    ariaLabel,
    title,
    onClick,
    onPeekChange,
    disabled = false,
    className,
  },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 128;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(dpr, dpr);

    context.fillStyle = "#E3E2DB";
    context.fillRect(0, 0, size, size);

    let seed = 9137;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let index = 0; index < 160; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const length = 2 + random() * 13;
      const alpha = 0.012 + random() * 0.025;
      context.strokeStyle = `rgba(80, 69, 53, ${alpha})`;
      context.lineWidth = 0.35 + random() * 0.55;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + length, y + (random() - 0.5) * 1.5);
      context.stroke();
    }

    for (let index = 0; index < 28; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 0.5 + random() * 1.7;
      context.fillStyle = `rgba(92, 87, 74, ${0.012 + random() * 0.025})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }, []);

  return (
    <button
      ref={forwardedRef}
      className={["paper-corner", className].filter(Boolean).join(" ")}
      type="button"
      onClick={onClick}
      onPointerEnter={() => onPeekChange?.(true)}
      onPointerLeave={() => onPeekChange?.(false)}
      onFocus={() => onPeekChange?.(true)}
      onBlur={() => onPeekChange?.(false)}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
    >
      <span className="paper-corner__label">{label}</span>
      <span className="paper-corner__leaf" aria-hidden="true">
        <canvas ref={canvasRef} className="paper-corner__grain" />
        <span className="paper-corner__crease" />
        <span className="paper-corner__edge" />
      </span>
    </button>
  );
});
