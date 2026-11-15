import { useState, type CSSProperties } from "react";
import { library, type ArchiveEntry } from "../data/library";
import { projectText, type Language } from "../i18n";
import "./LaptopDesktop.css";

const desktopProjects = library
  .map((entry) => ({
    entry,
    website: entry.links.find((link) => /^https:\/\//.test(link.url) && !link.url.includes("github.com"))?.url,
    github: entry.links.find((link) => link.url.includes("github.com"))?.url,
  }))
  .filter((item): item is { entry: ArchiveEntry; website: string; github: string | undefined } => Boolean(item.website))
  .slice(0, 6);

const iconColors = ["#467d90", "#ab765a", "#678c73", "#7589ad", "#b59660", "#8a7d9c"];

/** The screen is physically parented to the laptop lid, not a full-screen modal. */
export function LaptopDesktop({ language }: { language: Language }) {
  const zh = language === "zh";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"web" | "info">("web");
  const [loading, setLoading] = useState(false);
  const selected = desktopProjects.find(({ entry }) => entry.id === selectedId);

  const open = (id: string) => {
    setSelectedId(id);
    setView("web");
    setLoading(true);
  };

  return (
    <div
      className="laptop-os"
      role="application"
      aria-label={zh ? "3D 电脑中的作品桌面" : "Project desktop on the 3D laptop"}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="laptop-os__desktop">
        <div className="laptop-os__system-mark" aria-hidden="true">◈ FOUR HEARTS <span>98</span></div>
        <div className="laptop-os__shortcuts">
          {desktopProjects.map(({ entry }, index) => (
            <button
              key={entry.id}
              type="button"
              className={"laptop-os__shortcut" + (selectedId === entry.id ? " laptop-os__shortcut--selected" : "")}
              onClick={() => open(entry.id)}
              aria-label={(zh ? "在电脑中打开 " : "Open on laptop ") + projectText(entry, language).title}
            >
              <span className="laptop-os__shortcut-icon" style={{ "--shortcut-color": iconColors[index % iconColors.length] } as CSSProperties} aria-hidden="true">
                <span className="laptop-os__shortcut-screen" />
              </span>
              <span>{entry.title}</span>
            </button>
          ))}
        </div>
        <p className="laptop-os__hint">{zh ? "单击图标，在这台电脑中浏览" : "Click an icon to explore here"}</p>
      </div>

      {selected && (
        <section className="laptop-os__window" aria-label={projectText(selected.entry, language).title}>
          <div className="laptop-os__titlebar">
            <span className="laptop-os__title-icon" aria-hidden="true">◈</span>
            <strong>{selected.entry.title} — {view === "web" ? "Web" : "Info"}</strong>
            <button type="button" className="laptop-os__window-close" onClick={() => setSelectedId(null)} aria-label={zh ? "关闭窗口" : "Close window"}>×</button>
          </div>
          <div className="laptop-os__browser-bar">
            <button type="button" aria-pressed={view === "web"} onClick={() => setView("web")}>{zh ? "网页" : "WEB"}</button>
            <button type="button" aria-pressed={view === "info"} onClick={() => setView("info")}>{zh ? "档案" : "INFO"}</button>
            <span aria-label={selected.website}>{selected.website.replace(/^https?:\/\//, "")}</span>
          </div>
          <div className="laptop-os__window-body">
            {view === "web" ? (
              <>
                {loading && <span className="laptop-os__loading" role="status">{zh ? "正在载入网页…" : "Loading website…"}</span>}
                <iframe
                  key={selected.entry.id}
                  title={selected.entry.title}
                  src={selected.website}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={() => setLoading(false)}
                />
              </>
            ) : (
              <div className="laptop-os__project-info">
                {selected.entry.cover && <img src={selected.entry.cover} alt="" />}
                <strong>{projectText(selected.entry, language).title}</strong>
                <p>{projectText(selected.entry, language).summary}</p>
                <div className="laptop-os__project-links">
                  <a href={selected.website} target="_blank" rel="noopener noreferrer">{zh ? "独立打开 ↗" : "Open separately ↗"}</a>
                  {selected.github && <a href={selected.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
                </div>
              </div>
            )}
          </div>
          <div className="laptop-os__statusbar">
            <span>{zh ? "本机 · FOUR HEARTS" : "Local desktop · FOUR HEARTS"}</span>
            <span>{zh ? "留在 Room 中" : "Inside the Room"}</span>
          </div>
        </section>
      )}
      <div className="laptop-os__taskbar">
        <button type="button" className="laptop-os__start" onClick={() => setSelectedId(null)}>✿ <span>START</span></button>
        {selected && <button type="button" className="laptop-os__task" onClick={() => setView("web")}>{selected.entry.title}</button>}
        <span className="laptop-os__clock">OLIVIA OS</span>
      </div>
    </div>
  );
}
