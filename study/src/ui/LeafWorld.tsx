import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type TransitionEvent as ReactTransitionEvent } from "react";
import { Heartwheel, type ThemeZoomOrigin } from "../brand/Heartwheel";
import { PaperHeart } from "../brand/PaperHeart";
import { library, type ArchiveEntry, type ThemeId } from "../data/library";
import { themeConfig, themeOrder } from "../data/themeConfig";
import { projectText, themeText, useLanguage } from "../i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import "./LeafWorld.css";

export type ThemeSelectionSource = "select" | "drag";

interface LeafWorldProps {
  activeTheme: ThemeId;
  focused: boolean;
  onThemeChange: (theme: ThemeId, source?: ThemeSelectionSource, origin?: ThemeZoomOrigin) => void;
  onProjectOpen: (entry: ArchiveEntry, origin?: ThemeZoomOrigin) => void;
}

const visibleEntries = library.filter(
  (entry) => entry.status === "published" || entry.status === "prototype",
);
const WORLD_REVEAL_DURATION_MS = 1450;
const WORLD_RETURN_DURATION_MS = 760;

interface RevealFiber {
  x: number;
  y: number;
  dx: number;
  dy: number;
  spin: number;
  delay: number;
  width: number;
  color: string;
  opacity: number;
}

function createRevealFibers(theme: ThemeId, size: number): RevealFiber[] {
  const seeds: Record<ThemeId, number> = { build: 193, question: 389, play: 577, keep: 769 };
  let seed = seeds[theme];
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const colors = themeConfig[theme];

  return Array.from({ length: 18 }, (_, index) => {
    const angle = next() * Math.PI * 2;
    const distance = size * (.12 + next() * .3);
    const isThread = index % 4 === 0;
    return {
      x: (next() - .5) * size * .34,
      y: (next() - .5) * size * .3,
      dx: Math.cos(angle) * distance + size * .12,
      dy: Math.sin(angle) * distance * .68,
      spin: (next() - .5) * 100,
      delay: index * 13,
      width: isThread ? 4.2 : 1.8,
      color: index % 3 === 0 ? "white" : colors.ink,
      opacity: .24 + next() * .24,
    };
  });
}

function WorldCard({ entry, primary, onOpen }: { entry: ArchiveEntry; primary?: boolean; onOpen: (origin: ThemeZoomOrigin) => void }) {
  const { language, copy } = useLanguage();
  const definition = themeText(entry.primaryTheme, language);
  const localized = projectText(entry, language);
  const summary = localized.worldSummary ?? localized.summary;
  return (
    <article
      className={["leaf-world__card", primary && "leaf-world__card--primary"].filter(Boolean).join(" ")}
      style={{ "--card-accent": definition.accent, "--card-ink": definition.ink } as CSSProperties}
    >
      <button
        type="button"
        data-project-entry={entry.id}
        data-project-context="theme-world"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          onOpen({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
        }}
      >
        <span className="leaf-world__card-visual">
          {entry.cover ? <img src={entry.cover} alt="" width="1800" height="630" /> : <span>{copy.noPublicCover}</span>}
        </span>
        <span className="leaf-world__card-copy">
          {entry.primaryTheme !== "question" ? (
            <span className="leaf-world__card-meta">{definition.label} · {entry.year}</span>
          ) : null}
          <strong>{localized.title}</strong>
          <span>{summary}</span>
        </span>
      </button>
    </article>
  );
}

export function LeafWorld({ activeTheme, focused, onThemeChange, onProjectOpen }: LeafWorldProps) {
  const { copy, language } = useLanguage();
  const [transitionPhase, setTransitionPhase] = useState<"overview" | "entering" | "revealing" | "focused" | "exiting">(focused ? "focused" : "overview");
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [zoomOrigin, setZoomOrigin] = useState<ThemeZoomOrigin | null>(null);
  const previousFocused = useRef(focused);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const transitionPhaseRef = useRef(transitionPhase);
  transitionPhaseRef.current = transitionPhase;
  const transitionFrame = useRef<number | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const restoreFocusPending = useRef(false);
  const activeThemeRef = useRef(activeTheme);
  activeThemeRef.current = activeTheme;
  const worldRef = useRef<HTMLElement | null>(null);
  const themeEntries = useMemo(
    () => visibleEntries.filter((entry) => entry.primaryTheme === activeTheme),
    [activeTheme],
  );
  const activeDefinition = themeText(activeTheme, language);
  const isQuestionPage = activeTheme === "question";
  const revealFibers = useMemo(
    () => createRevealFibers(activeTheme, zoomOrigin?.size ?? 72),
    [activeTheme, zoomOrigin?.size],
  );

  const clearMotionHandles = useCallback(() => {
    if (transitionFrame.current !== null) {
      window.cancelAnimationFrame(transitionFrame.current);
      transitionFrame.current = null;
    }
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (!media.matches) return;
      clearMotionHandles();
      setTransitionPhase(focusedRef.current ? "focused" : "overview");
    };

    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      clearMotionHandles();
    };
  }, [clearMotionHandles]);

  useLayoutEffect(() => {
    if (focused === previousFocused.current) return;
    previousFocused.current = focused;
    clearMotionHandles();

    if (focused) {
      restoreFocusPending.current = false;
      if (reducedMotion) {
        setTransitionPhase("focused");
        return;
      }
      setTransitionPhase("entering");
      transitionFrame.current = window.requestAnimationFrame(() => {
        transitionFrame.current = null;
        if (focusedRef.current) setTransitionPhase("revealing");
      });
      return clearMotionHandles;
    }

    restoreFocusPending.current = true;
    if (reducedMotion || transitionPhaseRef.current === "entering") {
      setTransitionPhase("overview");
      return;
    }
    setTransitionPhase("exiting");
    return clearMotionHandles;
  }, [clearMotionHandles, focused, reducedMotion]);

  useEffect(() => {
    if (!focused || transitionPhase !== "focused") return;
    worldRef.current?.focus({ preventScroll: true });
  }, [focused, transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "revealing" && transitionPhase !== "exiting") return;
    const phase = transitionPhase;
    const nextPhase = phase === "revealing" ? "focused" : "overview";
    const duration = phase === "revealing" ? WORLD_REVEAL_DURATION_MS : WORLD_RETURN_DURATION_MS;
    transitionTimer.current = window.setTimeout(() => {
      transitionTimer.current = null;
      setTransitionPhase((current) => current === phase ? nextPhase : current);
    }, duration + 120);
    return clearMotionHandles;
  }, [clearMotionHandles, transitionPhase]);

  useLayoutEffect(() => {
    if (focused || transitionPhase !== "overview" || !restoreFocusPending.current) return;
    let frame = 0;
    let attempts = 0;
    const focusWhenVisible = () => {
      const target = document.querySelector<HTMLButtonElement>(
        '[data-heart-theme="' + activeThemeRef.current + '"]',
      );
      if (target && getComputedStyle(target).visibility === "visible") {
        restoreFocusPending.current = false;
        target.focus({ preventScroll: true });
        return;
      }
      if (attempts++ < 12) frame = requestAnimationFrame(focusWhenVisible);
    };
    frame = requestAnimationFrame(focusWhenVisible);
    return () => cancelAnimationFrame(frame);
  }, [focused, transitionPhase]);

  const changeTheme = useCallback((theme: ThemeId, source: ThemeSelectionSource = "select", origin?: ThemeZoomOrigin) => {
    if (transitionPhaseRef.current === "exiting") return;
    if (origin) setZoomOrigin(origin);
    onThemeChange(theme, source, origin);
  }, [onThemeChange]);

  useEffect(() => {
    if (!focused) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.repeat) return;
      event.preventDefault();
      event.stopPropagation();
      changeTheme(activeTheme, "select");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeTheme, changeTheme, focused]);

  const handleDockTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "clip-path") return;
    if (transitionPhaseRef.current === "revealing") setTransitionPhase("focused");
    if (transitionPhaseRef.current === "exiting") setTransitionPhase("overview");
  };

  const shellStyle = {
    "--zoom-x": zoomOrigin ? `${zoomOrigin.x}px` : "50vw",
    "--zoom-y": zoomOrigin ? `${zoomOrigin.y}px` : "50vh",
    "--zoom-size": `${Math.max(44, Math.min(110, (zoomOrigin?.size ?? 72) * 0.5))}px`,
    "--zoom-leaf-size": `${Math.max(60, Math.min(220, zoomOrigin?.size ?? 72))}px`,
    "--zoom-angle": `${zoomOrigin?.angle ?? 0}deg`,
    "--portal-accent": activeDefinition.accent,
    "--portal-leaf-color": themeConfig[activeTheme].leafColor,
    "--portal-ink": themeConfig[activeTheme].ink,
    "--world-open-duration": `${WORLD_REVEAL_DURATION_MS}ms`,
    "--world-close-duration": `${WORLD_RETURN_DURATION_MS}ms`,
  } as CSSProperties;
  const worldLayerVisible = focused || transitionPhase !== "overview";
  const worldInteractive = focused && transitionPhase === "focused";

  return (
    <div
      className="leaf-world-shell"
      data-mode={focused ? "focused" : "overview"}
      data-transition={transitionPhase}
      style={shellStyle}
    >
      <div className="leaf-world-shell__control" aria-hidden={worldLayerVisible} inert={worldLayerVisible}>
        <div className="leaf-world-shell__heading">
          <span className="sr-only">{copy.overviewAll}</span>
        </div>
        <Heartwheel
          activeTheme={activeTheme}
          focused={focused}
          onThemeChange={(theme, source, origin) => {
            changeTheme(theme, source, origin);
          }}
        />
      </div>

      {worldLayerVisible ? (
        <div
          className="leaf-world-shell__dock"
          aria-hidden={!worldInteractive}
          inert={!worldInteractive}
          onTransitionEnd={handleDockTransitionEnd}
        >
          {transitionPhase === "revealing" ? (
            <div className="leaf-world-shell__portal-effect" aria-hidden="true">
              <span className="leaf-world-shell__portal-bloom" />
              <svg className="leaf-world-shell__zoom-leaf" viewBox="-80 -155 160 160" aria-hidden="true">
                <g transform={`rotate(${zoomOrigin?.angle ?? 0} 0 0) translate(0 -3.2)`}>
                  <PaperHeart theme={activeTheme} />
                </g>
              </svg>
              {revealFibers.map((fiber, index) => (
                <i
                  key={`${activeTheme}-${index}`}
                  className="leaf-world-shell__fiber"
                  style={{
                    "--fiber-x": `${fiber.x}px`,
                    "--fiber-y": `${fiber.y}px`,
                    "--fiber-dx": `${fiber.dx}px`,
                    "--fiber-dy": `${fiber.dy}px`,
                    "--fiber-spin": `${fiber.spin}deg`,
                    "--fiber-delay": `${fiber.delay}ms`,
                    "--fiber-width": `${fiber.width}px`,
                    "--fiber-height": `${fiber.width > 3 ? .8 : 1.8}px`,
                    "--fiber-color": fiber.color,
                    "--fiber-opacity": fiber.opacity,
                  } as CSSProperties}
                />
              ))}
            </div>
          ) : null}
          <section
            ref={worldRef}
            className={isQuestionPage ? "leaf-world leaf-world--question" : "leaf-world"}
            tabIndex={-1}
            aria-labelledby="leaf-world-title"
          >
            <header className="leaf-world__header">
              <div className="leaf-world__header-top">
                {!isQuestionPage ? (
                  <p className="leaf-world__eyebrow">{copy.fourThemeIndex} / {activeDefinition.label}</p>
                ) : null}
                <div className="leaf-world__overlay-actions">
                  <LanguageSwitch />
                  <button className="leaf-world__back" type="button" onClick={() => changeTheme(activeTheme, "select")}>
                    <span aria-hidden="true">←</span><span>{copy.overview.replace(/^←\s*/, "")}</span>
                  </button>
                </div>
              </div>
              <h2 id="leaf-world-title" aria-live="polite">
                {isQuestionPage ? copy.questionPageTitle : activeDefinition.shortLabel}
              </h2>
              {!isQuestionPage ? (
                <p className="leaf-world__description">{activeDefinition.description}</p>
              ) : null}
              <nav className="leaf-world__world-nav" aria-label={copy.worldNavigation}>
                {themeOrder.map((theme) => {
                  const definition = themeText(theme, language);
                  const selected = theme === activeTheme;
                  return (
                    <button
                      key={theme}
                      type="button"
                      aria-current={selected ? "page" : undefined}
                      onClick={() => changeTheme(theme, "drag")}
                    >
                      {definition.label}
                    </button>
                  );
                })}
              </nav>
            </header>
            {themeEntries.length > 0 ? (
              <div className="leaf-world__cards">
                {themeEntries.map((entry, index) => (
                  <WorldCard key={entry.id} entry={entry} primary={index === 0} onOpen={(origin) => onProjectOpen(entry, origin)} />
                ))}
              </div>
            ) : (
              <p className="leaf-world__empty">{copy.noPublishedEntries}</p>
            )}
          </section>
        </div>
      ) : (
        <section
          className="leaf-world-shell__resting"
          aria-labelledby="leaf-resting-title"
        >
          <h2 id="leaf-resting-title">{copy.overviewTitle}</h2>
          <p>{copy.overviewDescription}</p>
        </section>
      )}
    </div>
  );
}
