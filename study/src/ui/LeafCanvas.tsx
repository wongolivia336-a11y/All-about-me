import { useMemo, type CSSProperties } from "react";
import { Heartwheel } from "../brand/Heartwheel";
import { library, type ArchiveEntry, type ThemeId } from "../data/library";
import { themeConfig, themeOrder } from "../data/themeConfig";
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
  const representatives = useMemo(() =>
    Object.fromEntries(themeOrder.map((theme) => [theme,
      library.find((entry) => entry.primaryTheme === theme &&
        (entry.status === "published" || entry.status === "prototype")),
    ])) as Record<ThemeId, ArchiveEntry | undefined>, []);

  const current = representatives[activeTheme];
  const definition = themeConfig[activeTheme];

  return (
    <div className="leaf-canvas" data-mode={focused ? "focused" : "overview"}>
      <div className="leaf-canvas__control">
        <div className="leaf-canvas__heading">
          <button
            className="leaf-canvas__overview"
            type="button"
            onClick={() => focused && onThemeChange(activeTheme, "select")}
            disabled={!focused}
            aria-label="返回四个主题概览"
          >
            {focused ? "← Overview" : "Overview · 4 themes"}
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
          <span>THE LIVING INDEX</span>
          <span>{focused ? `0${themeOrder.indexOf(activeTheme) + 1} / 04` : "01 — 04"}</span>
        </div>
        <div className="leaf-canvas__viewport" aria-label="四主题作品视觉索引">
          {themeOrder.map((theme, i) => {
            const entry = representatives[theme];
            const isCurrent = theme === activeTheme;
            const expanded = focused && isCurrent;
            const def = themeConfig[theme];
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
                  ? entry ? `查看项目详情：${entry.title}` : `${def.label} 暂无公开项目封面`
                  : `聚焦 ${def.label}，${entry?.title ?? "暂无公开封面"}`}
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
                    <span>PRIVATE INDEX</span>
                    <span>NO PUBLIC COVER</span>
                  </span>
                )}
                <span className="leaf-canvas__tile-shade" aria-hidden="true" />
                <span className="leaf-canvas__tile-marker">
                  <span>0{i + 1} / {def.label}</span>
                  <strong>{entry?.title ?? def.shortLabel}</strong>
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
                <h2 id="theme-title">{current?.title ?? definition.shortLabel}</h2>
                <p>{current?.summary ?? definition.description}</p>
              </div>
              <div className="leaf-canvas__actions">
                {current && <button type="button" onClick={() => onProjectOpen(current)}>Explore project ↗</button>}
                <button type="button" onClick={() => onViewAll(activeTheme)}>View all {definition.label} ↗</button>
              </div>
            </div>
          ) : (
            <div className="leaf-canvas__overview-copy">
              <div>
                <h2 id="theme-title">Four hearts. Four ways of seeing.</h2>
                <p>A selection of real projects, questions, experiments and things worth keeping.</p>
              </div>
            </div>
          )}
        </div>
        <span className="sr-only" role="status">
          {focused ? `${definition.label} 已展开。再次选择该叶片返回概览。` : "四主题概览已打开。"}
        </span>
      </div>
    </div>
  );
}
