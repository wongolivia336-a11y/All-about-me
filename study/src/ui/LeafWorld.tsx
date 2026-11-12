import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Heartwheel, type ThemeZoomOrigin } from "../brand/Heartwheel";
import { library, type ArchiveEntry, type ThemeId } from "../data/library";
import { themeOrder } from "../data/themeConfig";
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

function ThemePreview({ theme, entry, onEnter }: { theme: ThemeId; entry?: ArchiveEntry; onEnter: (origin: ThemeZoomOrigin) => void }) {
  const { copy, language } = useLanguage();
  const definition = themeText(theme, language);
  const localized = entry ? projectText(entry, language) : null;
  return (
    <article
      className="leaf-preview"
      data-theme={theme}
      style={{ "--preview-accent": definition.accent, "--preview-ink": definition.ink } as CSSProperties}
    >
      <button
        className="leaf-preview__button"
        type="button"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          onEnter({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
        }}
      >
        <span className="leaf-preview__visual">
          {entry?.cover ? <img src={entry.detailCover ?? entry.cover} alt="" width="1600" height="1000" /> : <span className="leaf-preview__empty">{copy.noPublicCover}</span>}
          <span className="leaf-preview__stamp">{definition.label} / 01</span>
        </span>
        <span className="leaf-preview__body">
          <span className="leaf-preview__eyebrow">{definition.descriptor}</span>
          <strong>{localized?.title ?? definition.shortLabel}</strong>
          <span>{localized?.summary ?? definition.description}</span>
          <span className="leaf-preview__cta">{copy.enterWorld}</span>
        </span>
      </button>
    </article>
  );
}

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
  const { language, copy } = useLanguage();
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<"overview" | "entering" | "focused" | "exiting">(focused ? "focused" : "overview");
  const [zoomOrigin, setZoomOrigin] = useState<ThemeZoomOrigin | null>(null);
  const previousFocused = useRef(focused);
  const restoreFocusPending = useRef(false);
  const activeThemeRef = useRef(activeTheme);
  activeThemeRef.current = activeTheme;
  const dockRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLElement | null>(null);
  const representatives = useMemo(() =>
    Object.fromEntries(themeOrder.map((theme) => [theme,
      visibleEntries.find((entry) => entry.primaryTheme === theme),
    ])) as Record<ThemeId, ArchiveEntry | undefined>, []);
  const themeEntries = useMemo(
    () => visibleEntries.filter((entry) => entry.primaryTheme === activeTheme),
    [activeTheme],
  );
  const previewEntry = previewTheme ? representatives[previewTheme] : undefined;
  const activeDefinition = themeText(activeTheme, language);

  useEffect(() => {
    if (focused === previousFocused.current) return;
    previousFocused.current = focused;

    if (focused) {
      restoreFocusPending.current = false;
      setTransitionPhase("entering");
      const frame = requestAnimationFrame(() => {
        setTransitionPhase("focused");
        worldRef.current?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(frame);
    }

    restoreFocusPending.current = true;
    setTransitionPhase("exiting");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setTransitionPhase("overview");
    }, reducedMotion ? 0 : 540);
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
    if (origin) setZoomOrigin(origin);
    onThemeChange(theme, source, origin);
  };

  const shellStyle = {
      "--zoom-x": zoomOrigin ? `${zoomOrigin.x}px` : "50vw",
      "--zoom-y": zoomOrigin ? `${zoomOrigin.y}px` : "50vh",
  } as CSSProperties;

  return (
    <div
      className="leaf-world-shell"
      data-mode={focused ? "focused" : "overview"}
      data-transition={transitionPhase}
      style={shellStyle}
    >
        <div className="leaf-world-shell__control" aria-hidden={focused || transitionPhase === "exiting"}>
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
            setPreviewTheme(null);
            changeTheme(theme, source, origin);
          }}
          onThemeHover={(theme) => {
            if (!focused) setPreviewTheme(theme);
          }}
        />
        <p className="leaf-world-shell__selected-label">
          {focused ? `${activeDefinition.label} / ${activeDefinition.shortLabel}` : copy.portfolioMapAria}
        </p>
      </div>

      <div ref={dockRef} className="leaf-world-shell__dock" aria-live="polite">
        {!focused ? (
          <ThemePreview
            theme={previewTheme ?? activeTheme}
            entry={previewTheme ? previewEntry : representatives[activeTheme]}
            onEnter={(origin) => changeTheme(previewTheme ?? activeTheme, "select", origin)}
          />
        ) : focused ? (
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
        ) : (
          <section className="leaf-world-shell__resting" aria-labelledby="leaf-resting-title">
            <p className="leaf-world-shell__eyebrow">{copy.resumeEyebrow}</p>
            <h2 id="leaf-resting-title">{copy.selectedWorkTitle}</h2>
            <p>{copy.selectedWorkBody}</p>
            <div className="leaf-world-shell__facts">
              <p><span>{language === "zh" ? "实习" : "Experience"}</span>{copy.experienceTitle}</p>
              <p><span>{language === "zh" ? "教育" : "Education"}</span>{copy.educationTitle}</p>
            </div>
            <div className="leaf-world-shell__resting-links">
              <button type="button" onClick={() => changeTheme("build", "select")}>{copy.openExperience} ↗</button>
              <button type="button" onClick={() => changeTheme("question", "select")}>{copy.openEducation} ↗</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
