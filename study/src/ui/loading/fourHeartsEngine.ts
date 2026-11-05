export interface FourHeartsEngine {
  setProgress: (progress: number | null) => void;
  burst: () => void;
  destroy: () => void;
}

interface EngineOptions {
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  leaf: number;
  angle: number;
  distance: number;
  glyph: string;
  color: number;
  size: number;
  alpha: number;
  drift: number;
  scatterDistance: number;
  scatterAngle: number;
  isFlower: boolean;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const mulberry32 = (seed: number) => () => {
  let value = seed += 0x6d2b79f5;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};

/**
 * A dependency-free 2D interlude for the real app loader. It deliberately
 * owns no loading state: callers provide readiness, while the field itself
 * supplies the wind, registration error and gather/scatter movement.
 */
export function createFourHeartsEngine(
  canvas: HTMLCanvasElement,
  options: EngineOptions = {},
): FourHeartsEngine {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas 2D context unavailable");

  const reducedMotion = options.reducedMotion === true;
  const random = mulberry32(250106);
  const glyphs = ["·", "·", "·", "+", "+", "×", "x", "*", ":", "◦", "/", "⌁", "◇"];
  const colors = ["#526fbd", "#648983", "#213c70"];
  const shape = new Path2D();
  shape.moveTo(0, -9);
  shape.bezierCurveTo(-13, -28, -49, -38, -61, -67);
  shape.bezierCurveTo(-75, -94, -67, -127, -42, -140);
  shape.bezierCurveTo(-15, -154, 18, -135, 32, -113);
  shape.bezierCurveTo(45, -94, 45, -71, 25, -47);
  shape.bezierCurveTo(11, -26, 4, -15, 0, -9);
  shape.closePath();

  const particles: Particle[] = [];
  for (let leaf = 0; leaf < 4; leaf += 1) {
    let accepted = 0;
    while (accepted < 118) {
      const x = random() * 135 - 75;
      const y = -157 + random() * 149;
      if (!context.isPointInPath(shape, x, y)) continue;
      const distance = Math.hypot(x, y);
      const angle = Math.atan2(y, x);
      particles.push({
        x,
        y,
        leaf,
        angle,
        distance,
        glyph: glyphs[Math.floor(random() * glyphs.length)],
        color: Math.floor(random() * colors.length),
        size: 6.5 + random() * 4.8,
        alpha: 0.26 + random() * 0.62,
        drift: random() * Math.PI * 2,
        scatterDistance: 80 + random() * 245,
        scatterAngle: angle + (random() - 0.5) * 2.9,
        isFlower: random() < 0.09,
      });
      accepted += 1;
    }
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let scale = 1;
  let center = { x: 0, y: 0 };
  let angle = 0;
  let progress: number | null = null;
  let destroyed = false;
  let visible = true;
  let frameId = 0;
  let lastFrame = performance.now();
  let startedAt = lastFrame;
  let burstAt = -10_000;
  let pointer = { x: -10_000, y: -10_000, active: false };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = clamp(Math.min(width / 575, height / 575) * 1.62, 0.56, 1.55);
    center = { x: width * 0.5, y: height * 0.48 };
  };

  const drawFlower = (x: number, y: number, radius: number, color: string, alpha: number) => {
    context.save();
    context.translate(x, y);
    context.rotate(angle * 0.35 + radius * 0.04);
    context.fillStyle = color;
    context.globalAlpha = alpha;
    for (let petal = 0; petal < 4; petal += 1) {
      context.save();
      context.rotate(petal * Math.PI / 2);
      context.beginPath();
      context.ellipse(0, -radius * 0.62, radius * 0.32, radius * 0.64, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    context.restore();
  };

  const draw = (timestamp: number) => {
    const elapsed = (timestamp - startedAt) / 1000;
    const cycle = (elapsed % 9.6) / 9.6;
    const easing = (value: number) => value * value * (3 - 2 * value);
    const automaticScatter = reducedMotion
      ? 0
      : cycle < 0.16
        ? 0
        : cycle < 0.42
          ? easing((cycle - 0.16) / 0.26)
          : cycle < 0.62
            ? 1
            : cycle < 0.88
              ? 1 - easing((cycle - 0.62) / 0.26)
              : 0;
    const burstScatter = reducedMotion ? 0 : Math.exp(-Math.max(0, timestamp - burstAt) / 900) * 0.9;
    const scatter = clamp(Math.max(automaticScatter, burstScatter), 0, 1.1);

    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(center.x, center.y);
    context.beginPath();
    context.arc(0, 0, 151 * scale, 0, Math.PI * 2);
    context.strokeStyle = "rgba(47, 69, 86, .08)";
    context.lineWidth = 0.85;
    context.stroke();
    context.beginPath();
    context.arc(0, 0, 212 * scale, 0, Math.PI * 2);
    context.setLineDash([1.2, 8]);
    context.strokeStyle = "rgba(54, 82, 116, .075)";
    context.stroke();
    context.setLineDash([]);
    context.save();
    context.rotate(angle);
    context.scale(scale, scale);
    for (let leaf = 0; leaf < 4; leaf += 1) {
      context.save();
      context.rotate(leaf * Math.PI / 2);
      context.strokeStyle = `rgba(80, 112, 186, ${0.38 + scatter * 0.22})`;
      context.lineWidth = 0.85;
      context.stroke(shape);
      context.save();
      context.translate(0.8, -0.35);
      context.strokeStyle = "rgba(91, 137, 140, .15)";
      context.lineWidth = 0.6;
      context.stroke(shape);
      context.restore();
      context.restore();
    }
    context.restore();
    context.beginPath();
    context.arc(0, 0, 5.3, 0, Math.PI * 2);
    context.fillStyle = "#2c3d4c";
    context.fill();
    context.restore();

    context.textAlign = "center";
    context.textBaseline = "middle";
    for (const particle of particles) {
      const rotated = angle + particle.leaf * Math.PI / 2;
      const cosine = Math.cos(rotated);
      const sine = Math.sin(rotated);
      let x = center.x + (particle.x * cosine - particle.y * sine) * scale;
      let y = center.y + (particle.x * sine + particle.y * cosine) * scale;
      const windX = Math.cos(particle.scatterAngle + rotated) * particle.scatterDistance + 90 + Math.sin(particle.drift) * 37;
      const windY = Math.sin(particle.scatterAngle + rotated) * particle.scatterDistance * 0.79 - 19;
      x += windX * scatter * scale;
      y += windY * scatter * scale;
      if (!reducedMotion) {
        x += Math.sin(elapsed * 1.15 + particle.drift) * 5 * scatter;
        y += Math.cos(elapsed * 0.85 + particle.drift) * 8 * scatter;
      }
      if (pointer.active && !reducedMotion) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 145 && distance > 1) {
          const force = (1 - distance / 145) ** 2 * 54;
          x += dx / distance * force;
          y += dy / distance * force;
        }
      }
      const alpha = particle.alpha * (0.82 + 0.18 * Math.sin(elapsed * 1.9 + particle.drift));
      const color = colors[particle.color];
      if (particle.isFlower) {
        drawFlower(x, y, particle.size * (scatter > 0.3 ? 0.7 : 0.43) * scale, color, Math.min(0.78, alpha * 0.8));
      } else {
        context.fillStyle = color;
        context.globalAlpha = alpha * 0.72;
        context.font = `${Math.max(6, particle.size * scale * (scatter > 0.3 ? 1 : 0.87)).toFixed(1)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        context.fillText(particle.glyph, x, y);
      }
    }
    context.globalAlpha = 1;
    context.save();
    context.strokeStyle = "rgba(71, 103, 182, .24)";
    context.lineWidth = 0.65;
    context.setLineDash([2, 4]);
    context.beginPath();
    context.moveTo(center.x - 6, center.y + 10);
    context.lineTo(center.x - 25 * scale, Math.min(height, center.y + 247 * scale));
    context.stroke();
    context.restore();
    void progress;
  };

  const frame = (timestamp: number) => {
    frameId = 0;
    if (destroyed || !visible) return;
    const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;
    if (!reducedMotion) angle += delta * (0.2 + Math.max(0, 1 - (timestamp - burstAt) / 1300) * 0.95);
    draw(timestamp);
    frameId = window.requestAnimationFrame(frame);
  };

  const onPointerMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true };
  };
  const onPointerLeave = () => { pointer.active = false; };
  const onPointerDown = () => { burstAt = performance.now(); };
  const onVisibility = () => {
    visible = !document.hidden;
    lastFrame = performance.now();
    if (visible && !frameId && !destroyed) frameId = window.requestAnimationFrame(frame);
  };

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  observer?.observe(canvas);
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
  canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  frameId = window.requestAnimationFrame(frame);

  return {
    setProgress: (value) => { progress = value === null ? null : clamp(value); },
    burst: () => { burstAt = performance.now(); },
    destroy: () => {
      destroyed = true;
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

