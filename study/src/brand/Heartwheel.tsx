import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { ThemeId } from "../data/library";
import { themeConfig, themeOrder } from "../data/themeConfig";
import { themeText, useLanguage } from "../i18n";
import { HEART_PATH, HeartTextTexture } from "./HeartTextTexture";
import "./Heartwheel.css";

export interface ThemeZoomOrigin {
  x: number;
  y: number;
}

interface HeartwheelProps {
  activeTheme: ThemeId;
  focused?: boolean;
  previewTheme?: ThemeId | null;
  onThemeChange: (theme: ThemeId, source?: "select" | "drag", origin?: ThemeZoomOrigin) => void;
  onThemeHover?: (theme: ThemeId | null) => void;
}
type Gesture = {
  pointerId: number;
  startX: number;
  startRotation: number;
  dragging: boolean;
};

type SettleAnimation = {
  target: number;
  velocity: number;
};

const SNAP_ANGLE = 90;
const SPRING_STIFFNESS = 210;
const SPRING_DAMPING = 29;
const SPRING_MASS = 1;
const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

const targetForTheme = (theme: ThemeId) => themeConfig[theme].focusRotation;

const angularDistance = (rotation: number, target: number) => {
  const wrapped = ((rotation - target + 180) % 360 + 360) % 360 - 180;
  return Math.abs(wrapped);
};

const nearestTarget = (rotation: number, theme: ThemeId) => {
  const target = targetForTheme(theme);
  return target + Math.round((rotation - target) / 360) * 360;
};

const themeForRotation = (rotation: number) => {
  const nearestTheme = themeOrder.reduce((best, theme) => {
    const currentDistance = angularDistance(rotation, targetForTheme(theme));
    const bestDistance = angularDistance(rotation, targetForTheme(best));
    return currentDistance < bestDistance ? theme : best;
  }, themeOrder[0]);
  return nearestTheme;
};

export function Heartwheel({
  activeTheme,
  focused = true,
  previewTheme = null,
  onThemeChange,
  onThemeHover,
}: HeartwheelProps) {
  const { language, copy } = useLanguage();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);
  const rotationRef = useRef(0);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const targetRotation = useRef(0);
  const hoverLock = useRef<{ theme: ThemeId; x: number; y: number } | null>(null);
  const animationFrame = useRef<number | null>(null);
  const animationRef = useRef<SettleAnimation | null>(null);
  const lastFrameAt = useRef<number | null>(null);
  const angularVelocity = useRef(0);

  const cancelSettle = (resetVelocity = true) => {
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    animationRef.current = null;
    lastFrameAt.current = null;
    if (resetVelocity) angularVelocity.current = 0;
  };

  const applyRotation = (next: number) => {
    rotationRef.current = next;
    stageRef.current?.style.setProperty("--heartwheel-rotation", `${next}deg`);
  };

  const animateToRotation = (target: number) => {
    const from = rotationRef.current;
    const initialVelocity = angularVelocity.current;
    targetRotation.current = target;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancelSettle();
      applyRotation(target);
      return;
    }
    cancelSettle(false);

    if (Math.abs(target - from) < 0.01 && Math.abs(initialVelocity) < 0.1) {
      applyRotation(target);
      return;
    }

    const animation: SettleAnimation = {
      target,
      velocity: initialVelocity,
    };
    animationRef.current = animation;
    lastFrameAt.current = performance.now();

    const tick = (now: number) => {
      if (animationRef.current !== animation) return;
      const elapsed = Math.min(0.032, Math.max(0.001, (now - (lastFrameAt.current ?? now)) / 1000));
      const displacement = animation.target - rotationRef.current;
      const acceleration =
        (SPRING_STIFFNESS * displacement - SPRING_DAMPING * animation.velocity) / SPRING_MASS;
      animation.velocity += acceleration * elapsed;
      const next = rotationRef.current + animation.velocity * elapsed;
      lastFrameAt.current = now;
      angularVelocity.current = animation.velocity;
      applyRotation(next);

      if (Math.abs(animation.target - next) > 0.05 || Math.abs(animation.velocity) > 0.05) {
        animationFrame.current = window.requestAnimationFrame(tick);
      } else {
        applyRotation(animation.target);
        animationFrame.current = null;
        animationRef.current = null;
        lastFrameAt.current = null;
        angularVelocity.current = 0;
      }
    };

    animationFrame.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (gesture.current?.dragging) return;
    const targetTheme = previewTheme ?? (focused ? activeTheme : null);
    const next = targetTheme ? nearestTarget(rotationRef.current, targetTheme) : 0;
    if (Math.abs(next - targetRotation.current) < 0.01) return;
    animateToRotation(next);
  }, [activeTheme, focused, previewTheme]);

  useEffect(() => {
    if (!focused && !previewTheme) {
      setHoveredTheme(null);
      onThemeHover?.(null);
    }
  }, [focused, onThemeHover, previewTheme]);

  const originFromElement = (element: Element): ThemeZoomOrigin => {
    const bounds = element.getBoundingClientRect();
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  };

  const chooseTheme = (theme: ThemeId, origin?: ThemeZoomOrigin) => {
    const next = nearestTarget(rotationRef.current, theme);
    animateToRotation(next);
    onThemeChange(theme, "select", origin);
  };

  const commitGesture = () => {
    const current = rotationRef.current;
    const snapped = Math.round(current / SNAP_ANGLE) * SNAP_ANGLE;
    const theme = themeForRotation(snapped);
    animateToRotation(snapped);
    onThemeChange(theme, "drag");
  };

  const finishGesture = (pointerId: number) => {
    const active = gesture.current;
    if (!active || active.pointerId !== pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (active.dragging) {
      suppressClick.current = true;
      commitGesture();
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
  };

  const cancelGesture = (pointerId: number) => {
    const active = gesture.current;
    if (!active || active.pointerId !== pointerId) return;
    gesture.current = null;
    setDragging(false);
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
    if (active.dragging) animateToRotation(targetRotation.current);
  };

  const applyPointerHover = (theme: ThemeId, x: number, y: number) => {
    const locked = hoverLock.current;
    if (locked && locked.theme !== theme && Math.hypot(locked.x - x, locked.y - y) < 2) return;
    hoverLock.current = { theme, x, y };
    setHoveredTheme(theme);
    onThemeHover?.(theme);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    if (gesture.current) return;
    cancelSettle();
    targetRotation.current = rotationRef.current;
    hoverLock.current = null;
    setHoveredTheme(null);
    onThemeHover?.(null);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startRotation: rotationRef.current,
      dragging: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (active && active.pointerId === event.pointerId) {
      const distance = event.clientX - active.startX;
      if (!active.dragging && Math.abs(distance) < 7) return;
      if (!active.dragging) {
        active.dragging = true;
        setDragging(true);
      }
      event.preventDefault();
      applyRotation(active.startRotation + distance * 0.72);
      return;
    }

    if (dragging) return;
    const hitLeaf = (event.target as Element).closest<SVGGElement>("[data-heart-leaf]");
    const theme = hitLeaf?.dataset.heartLeaf as ThemeId | undefined;
    if (!theme) return;
    applyPointerHover(theme, event.clientX, event.clientY);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }
    finishGesture(event.pointerId);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!gesture.current || gesture.current.pointerId !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }
    cancelGesture(event.pointerId);
  };

  const wheelStyle = {
    "--heartwheel-rotation": `${rotationRef.current}deg`,
  } as CSSProperties;

  const handleLeafClick = (theme: ThemeId, origin: ThemeZoomOrigin) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    chooseTheme(theme, origin);
  };

  useEffect(() => () => cancelSettle(), []);

  return (
    <div className="heartwheel" role="group" aria-label={copy.themeNavigation}>
      <div
        className={["heartwheel__stage", dragging && "heartwheel__stage--dragging"].filter(Boolean).join(" ")}
        ref={stageRef}
        style={wheelStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={() => {
          if (gesture.current) cancelGesture(gesture.current.pointerId);
        }}
      >
        <div className="heartwheel__orbit">
          <svg className="heartwheel__svg" viewBox="-170 -170 340 340" role="presentation">
            <defs>
              {themeOrder.map((theme) => (
                <clipPath key={theme} id={`heart-clip-${theme}`} clipPathUnits="userSpaceOnUse">
                  <path d={HEART_PATH} />
                </clipPath>
              ))}
            </defs>
            {themeOrder.map((theme) => {
              const active = focused && activeTheme === theme;
              const hovered = hoveredTheme === theme;
              return (
                <g
                  key={theme}
                  className={["heartwheel__leaf", active && "heartwheel__leaf--active", hovered && "heartwheel__leaf--hovered"].filter(Boolean).join(" ")}
                  data-heart-leaf={theme}
                  style={{ "--leaf-accent": themeConfig[theme].accent, "--leaf-ink": themeConfig[theme].ink } as CSSProperties}
                  transform={`rotate(${themeConfig[theme].leafAngle} 0 0)`}
                >
                  <g className="heartwheel__leaf-visual">
                    <path className="heartwheel__leaf-fill" d={HEART_PATH} />
                    <HeartTextTexture theme={theme} clipId={`heart-clip-${theme}`} />
                  </g>
                  <path
                    className="heartwheel__leaf-hit"
                    d={HEART_PATH}
                    fill="#ffffff"
                    fillOpacity="0"
                    pointerEvents="all"
                    onPointerEnter={(event) => {
                      if (focused) return;
                      applyPointerHover(theme, event.clientX, event.clientY);
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleLeafClick(theme, originFromElement(event.currentTarget));
                    }}
                    aria-label={copy.selectTheme + themeText(theme, language).label}
                  />
                </g>
              );
            })}
            <circle className="heartwheel__hub" cx="0" cy="0" r="6" />
          </svg>
        </div>

        <div className="heartwheel__labels" role="group" aria-label={copy.themeGroup}>
            {themeOrder.map((theme, index) => {
              const selected = focused && activeTheme === theme;
              const labelStyle = {
                "--label-accent": themeConfig[theme].accent,
                "--label-ink": themeConfig[theme].ink,
              } as CSSProperties;
              return (
                <button
                  key={theme}
                  className={["heartwheel__label", selected && "heartwheel__label--selected"].filter(Boolean).join(" ")}
                  style={labelStyle}
                  type="button"
                  aria-pressed={selected}
                  aria-label={copy.selectTheme + themeText(theme, language).label}
                  onMouseEnter={(event) => {
                    applyPointerHover(theme, event.clientX, event.clientY);
                  }}
                  onFocus={() => {
                    hoverLock.current = null;
                    setHoveredTheme(theme);
                    onThemeHover?.(theme);
                  }}
                  onBlur={() => {
                    setHoveredTheme(null);
                    onThemeHover?.(null);
                  }}
                  onClick={(event) => chooseTheme(theme, originFromElement(event.currentTarget))}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                    event.preventDefault();
                    const nextIndex = mod(index + (event.key === "ArrowRight" ? 1 : -1), themeOrder.length);
                    const nextTheme = themeOrder[nextIndex];
                    chooseTheme(nextTheme);
                    requestAnimationFrame(() => {
                      document.querySelector<HTMLButtonElement>(`[data-heart-theme="${nextTheme}"]`)?.focus();
                    });
                  }}
                  data-heart-theme={theme}
                >
                  <span>{themeText(theme, language).label}</span>
                  <small>{themeText(theme, language).descriptor}</small>
                </button>
              );
            })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {copy.currentTheme}{themeText(activeTheme, language).label}, {themeText(activeTheme, language).shortLabel}
      </p>
    </div>
  );
}
