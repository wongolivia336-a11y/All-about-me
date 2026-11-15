import { forwardRef, useEffect, useRef } from "react";

interface PaperCornerProps {
  label: string;
  ariaLabel: string;
  title: string;
  onClick: () => void;
  onPreload?: () => void;
  disabled?: boolean;
  className?: string;
}

/** The fold has a deterministic, procedural paper-fibre overlay. */
export const PaperCorner = forwardRef<HTMLButtonElement, PaperCornerProps>(function PaperCorner(
  {
    label,
    ariaLabel,
    title,
    onClick,
    onPreload,
    disabled = false,
    className,
  },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Keep texture features close to CSS-pixel scale, otherwise the browser
    // averages the fibres away when the corner is drawn at ~76px.
    const size = 128;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) return;
    let seed = 9137;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Pixel-level tooth: both warm fibres and tiny translucent pinholes.
    // A transparent overlay leaves the directional lighting to the CSS leaf.
    const grain = context.createImageData(size, size);
    for (let index = 0; index < grain.data.length; index += 4) {
      const dark = random() > .47;
      const shade = dark ? 91 : 255;
      grain.data[index] = shade;
      grain.data[index + 1] = dark ? 83 : 255;
      grain.data[index + 2] = dark ? 69 : 249;
      grain.data[index + 3] = Math.round(random() * (dark ? 65 : 25));
    }
    context.putImageData(grain, 0, 0);

    // Uncoated stock contains directional, irregular cellulose strands.
    for (let index = 0; index < 530; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const length = 1 + random() * 13;
      const alpha = .055 + random() * .19;
      context.strokeStyle = `rgba(80, 69, 53, ${alpha})`;
      context.lineWidth = .35 + random() * .85;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + length * .5, y + (random() - .5) * 3, x + length, y + (random() - .5) * 4);
      context.stroke();
    }

    // Sparse, larger pulp flecks provide the irregular scale of real stock.
    for (let index = 0; index < 85; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = .4 + random() * 2.6;
      context.fillStyle = `rgba(92, 87, 74, ${.025 + random() * .075})`;
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
      onPointerEnter={onPreload}
      onFocus={onPreload}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
    >
      <span className="sr-only">{label}</span>
      <span className="paper-corner__leaf" aria-hidden="true">
        <canvas ref={canvasRef} className="paper-corner__grain" />
        <span className="paper-corner__light" />
        <span className="paper-corner__crease" />
        <span className="paper-corner__edge" />
      </span>
    </button>
  );
});
