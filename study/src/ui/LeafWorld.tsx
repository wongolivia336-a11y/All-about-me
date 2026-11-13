import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Heartwheel, type ThemeZoomOrigin } from "../brand/Heartwheel";
import { HEART_PATH } from "../brand/HeartTextTexture";
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
const PORTAL_OPEN_DURATION_MS = 2480;
const PORTAL_CLOSE_DURATION_MS = 2000;

function WorldCard({ entry, primary, onOpen }: { entry: ArchiveEntry; primary?: boolean; onOpen: (origin: ThemeZoomOrigin) => void }) {
  const { language, copy } = useLanguage();
  const definition = themeText(entry.primaryTheme, language);
  const localized = projectText(entry, language);
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
          <span className="leaf-world__card-meta">{definition.label} · {entry.year}</span>
          <strong>{localized.title}</strong>
          <span>{localized.summary}</span>
        </span>
      </button>
    </article>
  );
}

export function LeafWorld({ activeTheme, focused, onThemeChange, onProjectOpen }: LeafWorldProps) {
  const { copy, language } = useLanguage();
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<"overview" | "entering" | "focused" | "exiting">(focused ? "focused" : "overview");
  const [zoomOrigin, setZoomOrigin] = useState<ThemeZoomOrigin | null>(null);
  const previousFocused = useRef(focused);
  const restoreFocusPending = useRef(false);
  const activeThemeRef = useRef(activeTheme);
  activeThemeRef.current = activeTheme;
  const worldRef = useRef<HTMLElement | null>(null);
  const themeEntries = useMemo(
    () => visibleEntries.filter((entry) => entry.primaryTheme === activeTheme),
    [activeTheme],
  );
  const activeDefinition = themeText(activeTheme, language);
  const previewDefinition = themeText(previewTheme ?? activeTheme, language);

  useLayoutEffect(() => {
    if (focused === previousFocused.current) return;
    previousFocused.current = focused;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (focused) {
      restoreFocusPending.current = false;
      setTransitionPhase(reducedMotion ? "focused" : "entering");
      const frame = requestAnimationFrame(() => {
        if (!reducedMotion) setTransitionPhase("focused");
      });
      const focusTimer = window.setTimeout(() => {
        worldRef.current?.focus({ preventScroll: true });
      }, reducedMotion ? 0 : PORTAL_OPEN_DURATION_MS + 32);
      return () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(focusTimer);
      };
    }

    restoreFocusPending.current = true;
    if (reducedMotion) {
      setTransitionPhase("overview");
      return;
    }
    setTransitionPhase("exiting");
    const timer = window.setTimeout(() => {
      setTransitionPhase("overview");
    }, PORTAL_CLOSE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [focused]);

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

  const changeTheme = (theme: ThemeId, source: ThemeSelectionSource = "select", origin?: ThemeZoomOrigin) => {
    setPreviewTheme(null);
    if (origin) setZoomOrigin(origin);
    onThemeChange(theme, source, origin);
  };

  const shellStyle = {
    "--zoom-x": zoomOrigin ? `${zoomOrigin.x}px` : "50vw",
    "--zoom-y": zoomOrigin ? `${zoomOrigin.y}px` : "50vh",
    "--zoom-size": `${Math.max(28, Math.min(86, (zoomOrigin?.size ?? 72) * 0.44))}px`,
    "--zoom-leaf-size": `${Math.max(44, Math.min(96, zoomOrigin?.size ?? 72))}px`,
    "--zoom-angle": `${zoomOrigin?.angle ?? 0}deg`,
    "--portal-accent": activeDefinition.accent,
    "--portal-leaf-color": themeConfig[activeTheme].leafColor,
  } as CSSProperties;
  const worldLayerVisible = focused || transitionPhase !== "overview";

  return (
    <div
      className="leaf-world-shell"
      data-mode={focused ? "focused" : "overview"}
      data-transition={transitionPhase}
      style={shellStyle}
    >
      <div className="leaf-world-shell__control" aria-hidden={worldLayerVisible} inert={worldLayerVisible}>
        <div className="leaf-world-shell__heading">
          <button
            className="leaf-world-shell__overview"
            type="button"
            onClick={() => focused && changeTheme(activeTheme, "select")}
            disabled={!focused}
            aria-label={copy.overviewAria}
          >
            {focused ? copy.overview : copy.overviewAll}
          </button>
          <span>{focused ? `0${themeOrder.indexOf(activeTheme) + 1} / 04` : "01 — 04"}</span>
        </div>
        <Heartwheel
          activeTheme={activeTheme}
          focused={focused}
          previewTheme={previewTheme}
          onThemeChange={(theme, source, origin) => {
            changeTheme(theme, source, origin);
          }}
          onThemeHover={(theme) => {
            if (!focused) setPreviewTheme(theme);
          }}
        />
        <p className="leaf-world-shell__selected-label">
          {focused
            ? `${activeDefinition.label} / ${activeDefinition.shortLabel}`
            : previewTheme
              ? `${previewDefinition.label} / ${previewDefinition.shortLabel}`
              : copy.portfolioMapAria}
        </p>
      </div>

      {worldLayerVisible ? (
        <div className="leaf-world-shell__dock" aria-live="polite">
          <div className="leaf-world-shell__portal-effect" aria-hidden="true">
            <span className="leaf-world-shell__portal-film" />
            {zoomOrigin ? (
              <span className="leaf-world-shell__portal-leaf">
                <svg viewBox="-80 -155 160 160" aria-hidden="true">
                  <path d={HEART_PATH} />
                </svg>
              </span>
            ) : null}
          </div>
          <section ref={worldRef} className="leaf-world" tabIndex={-1} aria-labelledby="leaf-world-title">
            <header className="leaf-world__header">
              <div className="leaf-world__header-top">
                <p className="leaf-world__eyebrow">{copy.fourThemeIndex} / {activeDefinition.label}</p>
                <div className="leaf-world__overlay-actions">
                  <LanguageSwitch />
                  <button type="button" onClick={() => changeTheme(activeTheme, "select")}>
                    {copy.overview}
                  </button>
                </div>
              </div>
              <h2 id="leaf-world-title">{activeDefinition.shortLabel}</h2>
              <p className="leaf-world__description">{activeDefinition.description}</p>
              <nav className="leaf-world__world-nav" aria-label={copy.worldNavigation}>
                {themeOrder.map((theme, index) => {
                  const definition = themeText(theme, language);
                  const selected = theme === activeTheme;
                  return (
                    <button
                      key={theme}
                      type="button"
                      aria-current={selected ? "page" : undefined}
                      onClick={() => changeTheme(theme, "drag")}
                    >
                      <span aria-hidden="true">0{index + 1}</span>
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
          style={{ "--intro-accent": previewDefinition.accent, "--intro-ink": previewDefinition.ink } as CSSProperties}
        >
          <p className="leaf-world-shell__eyebrow">
            {previewTheme ? previewDefinition.descriptor : copy.fourThemeIndex}
          </p>
          <h2 id="leaf-resting-title">
            {previewTheme ? previewDefinition.shortLabel : copy.overviewTitle}
          </h2>
          <p>{previewTheme ? previewDefinition.description : copy.overviewDescription}</p>
          <span className="leaf-world-shell__hint">
            {previewTheme ? copy.enterWorld : copy.selectLeafHint}
          </span>
        </section>
      )}
    </div>
  );
}
