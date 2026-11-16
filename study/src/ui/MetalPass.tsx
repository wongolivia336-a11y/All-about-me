import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createMetalRenderer, type Finish } from "./quick-read-metal/metalRenderer";

interface MetalPassProps {
  active: boolean;
  accent: string;
  className: string;
  children: ReactNode;
  onActivate: () => void;
}

interface Point { x: number; y: number }

export function MetalPass({ active, accent, className, children, onActivate }: MetalPassProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<() => void>(() => {});
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const glintUntilRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !active) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reducedMotion.matches;
    let visible = typeof IntersectionObserver === "undefined";
    let frameId = 0;
    let timerId = 0;
    let attempted = false;
    let lastFrame = 0;
    let lastRendered = 0;
    let renderer: ReturnType<typeof createMetalRenderer> | null = null;
    const state = { x: 0, y: 0, vx: 0, vy: 0, glow: 0, vg: 0 };

    const pause = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      if (timerId) window.clearTimeout(timerId);
      frameId = timerId = 0;
      lastFrame = 0;
    };
    const initialize = () => {
      if (attempted) return;
      attempted = true;
      try {
        renderer = createMetalRenderer(canvas);
        root.dataset.renderMode = renderer?.mode ?? "static";
      } catch {
        root.dataset.renderMode = "static";
      }
    };
    const tick = (now: number) => {
      frameId = 0;
      if (!visible || document.hidden) return;
      initialize();
      const delta = Math.min((now - (lastFrame || now)) / 1000, 0.032);
      lastFrame = now;
      const toX = reduce ? 0 : targetRef.current.x;
      const toY = reduce ? 0 : targetRef.current.y;
      if (reduce) {
        state.x = state.y = state.vx = state.vy = state.glow = state.vg = 0;
      } else {
        state.vx += (120 * (toX - state.x) - 16 * state.vx) * delta;
        state.vy += (120 * (toY - state.y) - 16 * state.vy) * delta;
        state.x += state.vx * delta;
        state.y += state.vy * delta;
        const glintTarget = pointerRef.current.active && now < glintUntilRef.current ? 1 : 0;
        state.vg += (92 * (glintTarget - state.glow) - 19 * state.vg) * delta;
        state.glow += state.vg * delta;
      }
      root.style.transform = `perspective(1050px) rotateX(${state.x.toFixed(3)}deg) rotateY(${state.y.toFixed(3)}deg)`;

      const pointerMoving = pointerRef.current.active && now < glintUntilRef.current;
      const interval = pointerMoving && !reduce ? 1000 / 30 : 100;
      if (renderer && (lastRendered === 0 || now - lastRendered >= interval)) {
        try {
          lastRendered = now;
          renderer.render({
            time: reduce ? 0 : now / 1000,
            tiltX: state.x,
            tiltY: state.y,
            tint: accent,
            finish: "polished" satisfies Finish,
            pointerX: pointerRef.current.x,
            pointerY: pointerRef.current.y,
            hover: reduce ? 0 : Math.min(1, Math.max(0, state.glow)),
          });
        } catch {
          try { renderer.dispose(); } catch { /* Lost contexts are already released by the browser. */ }
          renderer = null;
          root.dataset.renderMode = "static";
        }
      }

      if (!reduce) {
        timerId = window.setTimeout(() => {
          timerId = 0;
          wakeRef.current();
        }, pointerMoving ? 18 : 100);
      }
    };
    const wake = () => {
      if (!active || !visible || document.hidden || frameId) return;
      if (timerId) { window.clearTimeout(timerId); timerId = 0; }
      frameId = window.requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const onVisibility = () => document.hidden ? pause() : wakeRef.current();
    const onMotionPreference = () => {
      reduce = reducedMotion.matches;
      if (reduce) {
        targetRef.current = { x: 0, y: 0 };
        pointerRef.current.active = false;
      }
      wakeRef.current();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      pause();
      try { renderer?.dispose(); } catch { /* The browser has invalidated this context. */ }
      renderer = null;
      attempted = true;
      root.dataset.renderMode = "static";
    };
    const onContextRestored = () => {
      attempted = false;
      root.dataset.renderMode = "pending";
      wakeRef.current();
    };
    const onResize = () => wakeRef.current();

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) wakeRef.current(); else pause();
    }, { threshold: 0.01 });
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize);
    observer?.observe(root);
    resizeObserver?.observe(root);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionPreference);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    if (visible) wake();

    return () => {
      pause();
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionPreference);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      try { renderer?.dispose(); } catch { /* Context already lost or browser teardown. */ }
      renderer = null;
      wakeRef.current = () => {};
      root.style.transform = "";
      delete root.dataset.renderMode;
    };
  }, [accent, active]);

  const updatePointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    targetRef.current = { x: Math.max(-12, Math.min(12, -(y * 2 - 1) * 12)), y: Math.max(-12, Math.min(12, (x * 2 - 1) * 12)) };
    pointerRef.current = { x, y: 1 - y, active: true };
    glintUntilRef.current = performance.now() + 420;
    wakeRef.current();
  };
  const resetPointer = () => {
    targetRef.current = { x: 0, y: 0 };
    pointerRef.current.active = false;
    wakeRef.current();
  };

  return (
    <article
      ref={rootRef}
      className={["quick-read__card", className].join(" ")}
      data-render-mode="pending"
      style={{ "--card-accent": accent } as CSSProperties}
      onPointerEnter={updatePointer}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      onFocusCapture={() => {
        pointerRef.current = { x: 0.5, y: 0.62, active: true };
        glintUntilRef.current = performance.now() + 140;
        wakeRef.current();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resetPointer();
      }}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button, a, input, textarea, select")) onActivate();
      }}
    >
      <canvas ref={canvasRef} className="quick-read__metal-canvas" aria-hidden="true" />
      <div className="quick-read__foreground">{children}</div>
    </article>
  );
}
