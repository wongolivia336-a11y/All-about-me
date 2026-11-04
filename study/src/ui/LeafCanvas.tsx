import { useMemo, type CSSProperties } from "react";
import { Heartwheel } from "../brand/Heartwheel";
import { library, type ArchiveEntry, type ThemeId } from "../data/library";
import { themeConfig, themeOrder } from "../data/themeConfig";
import { projectText, themeText, useLanguage } from "../i18n";
import "./LeafCanvas.css";

export type ThemeSelectionSource = "select" | "drag";

interface LeafCanvasProps {
  activeTheme: ThemeId;
  focused: boolean;
  onThemeChange: (theme: ThemeId, source?: ThemeSelectionSource) => void;
  onProjectOpen: (entry: ArchiveEntry) => void;
  onViewAll: (theme: ThemeId) => void;
}

/**
 * Four image surfaces, one unmount-free spatial system.
 * Each tile stays mounted in both overview and focus. Its transform makes the
 * existing contact-sheet image become the main canvas, so there is no image
 * replacement, layout shift or fake project content during the transition.
 */
export function LeafCanvas({
  activeTheme, focused, onThemeChange, onProjectOpen, onViewAll,
}: LeafCanvasProps) {
  const { language, copy } = useLanguage();
  const representatives = useMemo(() =>
    Object.fromEntries(themeOrder.map((theme) => [theme,
      library.find((entry) => entry.primaryTheme === theme &&
        (entry.status === "published" || entry.status === "prototype")),
    ])) as Record<ThemeId, ArchiveEntry | undefined>, []);

  const current = representatives[activeTheme];
  const definition = themeText(activeTheme, language);

  return (
    <div className="leaf-canvas" data-mode={focused ? "focused" : "overview"}>
      <div className="leaf-canvas__control">
        <div className="leaf-canvas__heading">
          <button
            className="leaf-canvas__overview"
            type="button"
            onClick={() => focused && onThemeChange(activeTheme, "select")}
            disabled={!focused}
            aria-label={copy.overviewAria}
          >
            {focused ? copy.overview : copy.overviewAll}
          </button>
        </div>
        <Heartwheel
          activeTheme={activeTheme}
          focused={focused}
          onThemeChange={onThemeChange}
        />
      </div>

      <div className="leaf-canvas__content">
        <div className="leaf-canvas__topline">
          <span>{copy.fourThemeIndex}</span>
          <span>{focused ? `0${themeOrder.indexOf(activeTheme) + 1} / 04` : "01 — 04"}</span>
        </div>
        <div className="leaf-canvas__viewport" aria-label={copy.portfolioMapAria}>
          {themeOrder.map((theme, i) => {
            const entry = representatives[theme];
            const isCurrent = theme === activeTheme;
            const expanded = focused && isCurrent;
            const def = themeConfig[theme];
            const localizedTheme = themeText(theme, language);
            const localizedEntry = entry ? projectText(entry, language) : null;
            return (
              <button
                type="button"
                key={theme}
                className={`leaf-canvas__tile leaf-canvas__tile--${theme}`}
                data-active={expanded ? "true" : "false"}
                data-hidden={focused && !isCurrent ? "true" : "false"}
                tabIndex={focused && !isCurrent ? -1 : 0}
                aria-hidden={focused && !isCurrent ? true : undefined}
                aria-label={expanded
                  ? entry ? `${copy.seeProject}${localizedEntry?.title}` : `${localizedTheme.label} · ${copy.noThemeCover}`
                  : `${copy.focusTheme}${localizedTheme.label}, ${localizedEntry?.title ?? copy.noPublicCover}`}
                data-project-entry={entry?.id}
                data-project-context="theme-tile"
                onClick={() => {
                  if (expanded) {
                    if (entry) onProjectOpen(entry);
                  } else {
                    onThemeChange(theme, "select");
                  }
                }}
                style={{
                  "--tile-column": i % 2,
                  "--tile-row": Math.floor(i / 2),
                  "--tile-shift-x": i % 2 ? "-100%" : "0%",
                  "--tile-shift-y": i >= 2 ? "-100%" : "0%",
                  "--tile-accent": def.accent,
                } as CSSProperties}
              >
                {entry?.cover ? (
                  <img src={entry.cover} alt="" width="1800" height="630" loading="eager" decoding="async" />
                ) : (
                  <span className="leaf-canvas__cover-empty" aria-hidden="true">
                    <span>{copy.privateIndex}</span>
                    <span>{copy.noPublicCover}</span>
                  </span>
                )}
                <span className="leaf-canvas__tile-shade" aria-hidden="true" />
                <span className="leaf-canvas__tile-marker">
                  <span>0{i + 1} / {localizedTheme.label}</span>
                  <strong>{localizedEntry?.title ?? localizedTheme.shortLabel}</strong>
                </span>
                <span className="leaf-canvas__tile-corner" aria-hidden="true">↗</span>
              </button>
            );
          })}
        </div>

        <div className="leaf-canvas__caption" aria-live="polite" aria-atomic="true">
          {focused ? (
            <div className="leaf-canvas__focus-copy" key={activeTheme}>
              <div>
                <p className="leaf-canvas__eyebrow">{definition.label} / {definition.shortLabel}</p>
                <h2 id="theme-title">{current ? projectText(current, language).title : definition.shortLabel}</h2>
                <p>{current ? projectText(current, language).summary : definition.description}</p>
              </div>
              <div className="leaf-canvas__actions">
                {current && <button type="button" onClick={() => onProjectOpen(current)}>{copy.exploreProject}</button>}
                <button type="button" onClick={() => onViewAll(activeTheme)}>{copy.viewAllTheme}{definition.label} ↗</button>
              </div>
            </div>
          ) : (
            <div className="leaf-canvas__overview-copy">
              <div>
                <h2 id="theme-title">{copy.overviewTitle}</h2>
                <p>{copy.overviewDescription}</p>
              </div>
            </div>
          )}
        </div>
        <span className="sr-only" role="status">
          {focused ? `${definition.label}${copy.focusAnnouncement}` : copy.overviewAnnouncement}
        </span>
      </div>
    </div>
  );
}
