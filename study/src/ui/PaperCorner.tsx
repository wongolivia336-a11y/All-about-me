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

    const size = 256;
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
      grain.data[index + 3] = Math.round(random() * (dark ? 29 : 34));
    }
    context.putImageData(grain, 0, 0);

    // Uncoated stock contains directional, irregular cellulose strands.
    for (let index = 0; index < 1150; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const length = .8 + random() * 9;
      const alpha = .035 + random() * .13;
      context.strokeStyle = `rgba(80, 69, 53, ${alpha})`;
      context.lineWidth = .3 + random() * .7;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + length * .5, y + (random() - .5) * 3, x + length, y + (random() - .5) * 4);
      context.stroke();
    }

    for (let index = 0; index < 160; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = .2 + random() * 1.1;
      context.fillStyle = `rgba(92, 87, 74, ${.05 + random() * .12})`;
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
