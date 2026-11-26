import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { library } from "../data/library";
import { GITHUB_USER } from "../data/links";
import { projectText, type Language } from "../i18n";
import { HAPPY_MAC_BITMAP } from "./theme";
import "./LaptopDesktop.css";

const SCREEN_WIDTH = 548;
const SCREEN_HEIGHT = 352;
const DESKTOP_VIEWPORT = 1024;
const NOTE_KEY = "four-hearts-desktop-note";
const SKIN_KEY = "four-hearts-desktop-skin";
const ICON_POSITION_KEY = "four-hearts-desktop-icon-positions";

type Project = {
  entry: (typeof library)[number];
  website?: string;
  github?: string;
};
type WebsiteProject = Project & { website: string };

const projects: Project[] = library
  .filter((entry) => entry.portfolioOrder !== undefined)
  .sort((a, b) => (a.portfolioOrder ?? 99) - (b.portfolioOrder ?? 99))
  .map((entry) => ({
    entry,
    website: entry.links.find((link) => /^https:\/\//.test(link.url) && !/github\.com/i.test(link.url))?.url,
    github: entry.links.find((link) => /github\.com/i.test(link.url))?.url,
  }));

const defaultIconPosition = (index: number): IconPosition => ({
  x: 12 + (index % 3) * 94,
  y: 4 + Math.floor(index / 3) * 68,
});
type Skin = "win98" | "system7" | "aqua";
type AppKind = "browser" | "finder" | "notes" | "settings" | "about";
type WindowTab = "web" | "info";
type WindowState = {
  id: string;
  app: AppKind;
  projectId?: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  tab: WindowTab;
  revision: number;
};
type Gesture = {
  pointerId: number;
  id: string;
  mode: "move" | "resize";
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
};
type IconPosition = { x: number; y: number };
type IconGesture = { id: string; pointerId: number; x: number; y: number; left: number; top: number; moved: boolean };

const appGlyphs: Record<AppKind, string> = {
  browser: "▣",
  finder: "▤",
  notes: "✎",
  settings: "⚙",
  about: "✿",
};

function HappyMacMark() {
  return (
    <svg className="laptop-os__happy-mac" viewBox="0 0 16 14" aria-hidden="true" shapeRendering="crispEdges">
      {HAPPY_MAC_BITMAP.flatMap((row, y) => Array.from(row).flatMap((mark, x) => (
        mark === "#" ? [<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />] : []
      )))}
    </svg>
  );
}

function readStored(key: string, fallback: string) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function readIconPositions(): Record<string, IconPosition> {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(ICON_POSITION_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([id, value]) => {
      if (!value || typeof value !== "object") return [];
      const { x, y } = value as Partial<IconPosition>;
      return Number.isFinite(x) && Number.isFinite(y) ? [[id, { x: x!, y: y! }]] : [];
    }));
  } catch { return {}; }
}

/**
 * Keep a real desktop-sized viewport inside the little physical laptop.
 * The visitor can switch to the native responsive viewport at any time.
 */
function WebsiteFrame({ project, mode, revision, language }: {
  project: WebsiteProject;
  mode: "desktop" | "fluid";
  revision: number;
  language: Language;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 480, height: 190 });
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setLoading(true); }, [project.website, revision, mode]);

  const scale = Math.max(size.width / DESKTOP_VIEWPORT, .1);
  const virtualHeight = Math.max(size.height / scale, 720);
  const frameStyle: CSSProperties = mode === "desktop"
    ? {
      width: DESKTOP_VIEWPORT,
      // A short laptop pane must not make source sites lay out as a
      // 1024 × 350 desktop; many full-page compositions use viewport height.
      // Keep a normal desktop height and let the physical screen crop/scroll.
      height: virtualHeight,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    }
    : { width: "100%", height: "100%" };

  return (
    <div className="laptop-os__web-viewport" ref={containerRef}>
      {loading && <div className="laptop-os__loading" role="status">{language === "zh" ? "正在连接作品…" : "Connecting to project…"}</div>}
      <div
        className="laptop-os__iframe-canvas"
        style={mode === "desktop" ? { width: size.width, height: virtualHeight * scale } : undefined}
      >
        <iframe
          key={`${project.entry.id}-${revision}-${mode}`}
          title={projectText(project.entry, language).title}
          src={project.website}
          loading="eager"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={frameStyle}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}

function ProjectPlaceholder({ project, language }: { project: Project; language: Language }) {
  const zh = language === "zh";
  const localized = projectText(project.entry, language);
  return (
    <div className="laptop-os__project-placeholder">
      <span className="laptop-os__eyebrow">FOUR HEARTS PROJECT FILE / {String(project.entry.portfolioOrder ?? 0).padStart(2, "0")}</span>
      <span className="laptop-os__placeholder-mark" aria-hidden="true">✳</span>
      <h3>{localized.title}</h3>
      <p>{localized.summary}</p>
      {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">{zh ? "打开 GitHub 项目 ↗" : "Open project on GitHub ↗"}</a>}
      <small>{zh ? "独立网页入口暂未添加；这里先收好项目说明和源码入口。" : "A standalone site is not listed yet. The project notes and source link are here for now."}</small>
    </div>
  );
}

export function LaptopDesktop({ language }: { language: Language }) {
  const zh = language === "zh";
  const [skin, setSkin] = useState<Skin>(() => {
    const stored = readStored(SKIN_KEY, "win98");
    return stored === "system7" || stored === "aqua" ? stored : "win98";
  });
  const [note, setNote] = useState(() => readStored(NOTE_KEY, "Make things that feel alive.\n\nA little studio inside a little room."));
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [finderQuery, setFinderQuery] = useState("");
  const [webMode, setWebMode] = useState<"desktop" | "fluid">("desktop");
  const [clock, setClock] = useState(() => new Date());
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>(readIconPositions);
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [windowGesture, setWindowGesture] = useState<{ id: string; mode: Gesture["mode"] } | null>(null);
  const [easterEgg, setEasterEgg] = useState("");
  const highestZ = useRef(5);
  const gesture = useRef<Gesture | null>(null);
  const iconGesture = useRef<IconGesture | null>(null);
  const suppressIconClick = useRef(false);
  const logoClicks = useRef<number[]>([]);
  const easterTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { try { window.localStorage.setItem(SKIN_KEY, skin); } catch { /* optional preference */ } }, [skin]);
  useEffect(() => { try { window.localStorage.setItem(NOTE_KEY, note); } catch { /* ephemeral note */ } }, [note]);
  useEffect(() => { try { window.localStorage.setItem(ICON_POSITION_KEY, JSON.stringify(iconPositions)); } catch { /* optional preference */ } }, [iconPositions]);

  const active = useMemo(() => [...windows].filter((item) => !item.minimized).sort((a, b) => b.z - a.z)[0], [windows]);
  const sorted = useMemo(() => [...windows].sort((a, b) => a.z - b.z), [windows]);
  const selectedProject = (id?: string) => projects.find((item) => item.entry.id === id);

  const updateWindow = (id: string, patch: Partial<WindowState>) => {
    setWindows((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const raiseWindow = (id: string) => {
    const z = ++highestZ.current;
    updateWindow(id, { z, minimized: false });
    setStartOpen(false);
  };

  const openApp = (app: AppKind, projectId?: string) => {
    const project = selectedProject(projectId);
    const id = app === "browser" && project ? `browser-${projectId}` : app;
    if (app === "browser" && !project) return;
    const z = ++highestZ.current;
    setWindows((items) => {
      if (items.some((item) => item.id === id)) {
        return items.map((item) => item.id === id ? { ...item, minimized: false, z } : item);
      }
      const offset = items.length % 3;
      const titles = { finder: "Projects", notes: "Studio Notes", settings: "Control Panel", about: "About FOUR HEARTS", browser: project ? projectText(project.entry, language).title : "Web" };
      return [...items, {
        id, app, projectId,
        title: titles[app],
        x: 35 + offset * 16,
        y: 42 + offset * 10,
        width: app === "browser" ? 476 : app === "settings" ? 400 : 450,
        height: app === "browser" ? 251 : 230,
        z, minimized: false,
        maximized: app === "browser",
        tab: "web", revision: 0,
      }];
    });
    setStartOpen(false);
  };

  const showEasterEgg = (message: string) => {
    setEasterEgg(message);
    if (easterTimer.current !== null) window.clearTimeout(easterTimer.current);
    easterTimer.current = window.setTimeout(() => setEasterEgg(""), 2800);
  };
  const handleBrandClick = () => {
    setStartOpen((open) => !open);
    const now = Date.now();
    logoClicks.current = [...logoClicks.current.filter((time) => now - time < 1400), now];
    if (logoClicks.current.length >= 4) {
      logoClicks.current = [];
      showEasterEgg(zh ? "Hello，从这台小小的 Macintosh 发来问候。" : "Hello from this little Macintosh.");
    }
  };
  const beginIconDrag = (event: PointerEvent<HTMLButtonElement>, id: string, index: number) => {
    if (event.button !== 0) return;
    const position = iconPositions[id] ?? defaultIconPosition(index);
    iconGesture.current = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: position.x, top: position.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.stopPropagation();
  };
  const moveIconDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = iconGesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.hypot(dx, dy) > 4) {
      current.moved = true;
      setDraggingIcon(current.id);
      setIconPositions((items) => ({
        ...items,
        [current.id]: {
          x: Math.max(3, Math.min(SCREEN_WIDTH - 95, current.left + dx)),
          y: Math.max(2, Math.min(SCREEN_HEIGHT - 131, current.top + dy)),
        },
      }));
    }
    event.stopPropagation();
  };
  const endIconDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = iconGesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.moved) {
      suppressIconClick.current = true;
      window.setTimeout(() => { suppressIconClick.current = false; }, 300);
    }
    iconGesture.current = null;
    setDraggingIcon(null);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* capture already released */ }
    event.stopPropagation();
  };

  const closeWindow = (id: string) => setWindows((items) => items.filter((item) => item.id !== id));
  const beginGesture = (event: PointerEvent<HTMLDivElement>, item: WindowState, mode: Gesture["mode"]) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button") || item.maximized) return;
    raiseWindow(item.id);
    gesture.current = {
      id: item.id, mode, pointerId: event.pointerId,
      x: event.clientX, y: event.clientY,
      left: item.x, top: item.y, width: item.width, height: item.height,
    };
    setWindowGesture({ id: item.id, mode });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.stopPropagation();
  };
  const moveGesture = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.mode === "move") {
      updateWindow(current.id, {
        x: Math.max(0, Math.min(SCREEN_WIDTH - 110, current.left + dx)),
        y: Math.max(25, Math.min(SCREEN_HEIGHT - 65, current.top + dy)),
      });
    } else {
      updateWindow(current.id, {
        width: Math.max(275, Math.min(SCREEN_WIDTH - current.left - 4, current.width + dx)),
        height: Math.max(152, Math.min(SCREEN_HEIGHT - current.top - 28, current.height + dy)),
      });
    }
    event.stopPropagation();
  };
  const endGesture = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    setWindowGesture(null);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* capture already lost */ }
    event.stopPropagation();
  };

  const projectList = projects.filter(({ entry }) => {
    const localized = projectText(entry, language);
    return `${localized.title} ${localized.summary} ${localized.tags.join(" ")}`.toLowerCase().includes(finderQuery.toLowerCase());
  });

  return (
    <div
      className="laptop-os"
      data-skin={skin}
      role="application"
      aria-label={zh ? "3D Macintosh 中的 FOUR HEARTS 桌面" : "FOUR HEARTS desktop inside the 3D Macintosh"}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        if (startOpen) { setStartOpen(false); event.stopPropagation(); }
        else if (active) { closeWindow(active.id); event.stopPropagation(); }
      }}
    >
      <div className="laptop-os__wallpaper" aria-hidden="true">
        <HappyMacMark />
      </div>
      <a
        className="laptop-os__github-link"
        href={`https://github.com/${GITHUB_USER}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open GitHub profile ${GITHUB_USER} in a new tab`}
      >
        github.com/{GITHUB_USER} <span aria-hidden="true">↗</span>
      </a>
      <header className="laptop-os__menubar">
        <button type="button" className="laptop-os__brand" onClick={handleBrandClick} aria-expanded={startOpen} title={zh ? "快速点四下，听听机器的问候" : "Tap four times for a little hello"}>✿ <strong>FOUR HEARTS</strong></button>
        <button type="button" onClick={() => openApp("finder")}>{zh ? "文件" : "File"}</button>
        <button type="button" onClick={() => openApp("settings")}>{zh ? "视图" : "View"}</button>
        <button type="button" onClick={() => openApp("about")}>{zh ? "帮助" : "Help"}</button>
        <time dateTime={clock.toISOString()}>{clock.toLocaleTimeString(language === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</time>
      </header>

      <div className="laptop-os__shortcuts">
        {projects.map(({ entry }, index) => {
          const position = iconPositions[entry.id] ?? defaultIconPosition(index);
          return <button
            key={entry.id}
            type="button"
            className="laptop-os__shortcut"
            data-dragging={draggingIcon === entry.id || undefined}
            style={{ left: position.x, top: position.y }}
            onPointerDown={(event) => beginIconDrag(event, entry.id, index)}
            onPointerMove={moveIconDrag}
            onPointerUp={endIconDrag}
            onPointerCancel={endIconDrag}
            onClick={(event) => {
              if (suppressIconClick.current) { suppressIconClick.current = false; event.preventDefault(); return; }
              openApp("browser", entry.id);
            }}
            title={zh ? `${projectText(entry, language).title} · 拖动图标，点击打开` : `${projectText(entry, language).title} · Drag to move, click to open`}
          >
            <img className="laptop-os__project-icon" src={entry.desktopIcon} alt="" aria-hidden="true" draggable={false} />
            <span>{projectText(entry, language).title}</span>
          </button>;
        })}
      </div>
      <div className="laptop-os__utilities">
        {(["finder", "notes", "settings"] as const).map((app) => (
          <button key={app} type="button" className="laptop-os__utility" onClick={() => openApp(app)}>
            <span aria-hidden="true">{appGlyphs[app]}</span>
            <small>{app === "finder" ? (zh ? "项目" : "Projects") : app === "notes" ? (zh ? "便签" : "Notes") : (zh ? "设置" : "Settings")}</small>
          </button>
        ))}
      </div>
      {sorted.map((item) => {
        const project = selectedProject(item.projectId);
        return (
          <section
            key={item.id}
            className={["laptop-os__window", item.maximized && "laptop-os__window--max", item.minimized && "laptop-os__window--minimized", active?.id === item.id && "laptop-os__window--active", windowGesture?.id === item.id && `laptop-os__window--${windowGesture.mode}`].filter(Boolean).join(" ")}
            style={item.maximized ? { zIndex: item.z } : { zIndex: item.z, left: item.x, top: item.y, width: item.width, height: item.height }}
            aria-label={item.title}
            aria-hidden={item.minimized}
            inert={item.minimized}
            onPointerDown={() => { if (active?.id !== item.id) raiseWindow(item.id); }}
          >
            <div className="laptop-os__titlebar" onPointerDown={(event) => beginGesture(event, item, "move")} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("button")) updateWindow(item.id, { maximized: !item.maximized }); }}>
              <span className="laptop-os__title-icon" aria-hidden="true">{appGlyphs[item.app]}</span>
              <strong>{item.title}</strong>
              <div className="laptop-os__window-actions">
                <button type="button" onClick={() => updateWindow(item.id, { minimized: true })} aria-label={zh ? "最小化" : "Minimize"} title={zh ? "最小化" : "Minimize"}>
                  <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8.5h8" /></svg>
                </button>
                <button type="button" onClick={() => updateWindow(item.id, { maximized: !item.maximized })} aria-label={zh ? "放大或还原窗口" : "Maximize or restore"} title={zh ? "放大或还原" : "Maximize or restore"}>
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    {item.maximized ? <><path d="M4.5 2.5h5v5" /><path d="M7.5 4.5v5h-5v-5z" /></> : <rect x="2.5" y="2.5" width="7" height="7" />}
                  </svg>
                </button>
                <button type="button" onClick={() => closeWindow(item.id)} aria-label={zh ? "关闭窗口" : "Close window"} title={zh ? "关闭" : "Close"}>
                  <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6m0-6-6 6" /></svg>
                </button>
              </div>
            </div>

            {item.app === "browser" && project && <>
              <nav className="laptop-os__browser-bar" aria-label={zh ? "浏览器工具栏" : "Browser toolbar"}>
                <button type="button" className="laptop-os__browser-tab" aria-pressed={item.tab === "web"} onClick={() => updateWindow(item.id, { tab: "web" })}>{project.website ? (zh ? "网页" : "Web") : (zh ? "项目" : "Project")}</button>
                <button type="button" className="laptop-os__browser-tab" aria-pressed={item.tab === "info"} onClick={() => updateWindow(item.id, { tab: "info" })}>{zh ? "档案" : "Info"}</button>
                <span className="laptop-os__address" title={project.website ?? project.github ?? projectText(project.entry, language).title}>
                  ⌁ {project.website ? project.website.replace(/^https?:\/\//, "") : project.github ? project.github.replace(/^https?:\/\//, "") : projectText(project.entry, language).title}
                </span>
                {project.website && <button type="button" title={zh ? "刷新" : "Reload"} aria-label={zh ? "刷新网页" : "Reload website"} onClick={() => updateWindow(item.id, { revision: item.revision + 1, tab: "web" })}>↻</button>}
                {project.website && <button type="button" className="laptop-os__viewport-toggle" onClick={() => setWebMode((mode) => mode === "desktop" ? "fluid" : "desktop")} aria-label={zh ? "切换网页视口" : "Switch website viewport"} title={zh ? "切换桌面/自适应视口" : "Desktop / responsive viewport"}>{webMode === "desktop" ? "1024" : "AUTO"}</button>}
              </nav>
              <div className="laptop-os__window-body">
                {item.tab === "web"
                  ? project.website
                    ? <WebsiteFrame project={{ ...project, website: project.website }} mode={webMode} revision={item.revision} language={language} />
                    : <ProjectPlaceholder project={project} language={language} />
                  : <div className="laptop-os__project-info">
                    {project.entry.cover && <img src={project.entry.cover} alt="" />}
                    <span className="laptop-os__eyebrow">{project.entry.year} / {project.entry.collection.toUpperCase()}</span>
                    <h3>{projectText(project.entry, language).title}</h3>
                    <p>{projectText(project.entry, language).summary}</p>
                    <div className="laptop-os__project-links">{project.entry.links.map((link, index) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{projectText(project.entry, language).links[index]} ↗</a>)}</div>
                    <small>{project.website
                      ? (zh ? "如果嵌入网站限制显示，可以在独立窗口打开。" : "If the embedded page is restricted, open the full website.")
                      : (zh ? "独立网页入口暂未添加；可先从 GitHub 查看项目资料。" : "A standalone site is not listed yet. Open the GitHub source for now.")}</small>
                  </div>}
              </div>
              <footer className="laptop-os__statusbar"><span>{project.website ? (webMode === "desktop" ? "DESKTOP 1024 PX" : "RESPONSIVE VIEW") : (zh ? "项目说明 / 源码入口" : "PROJECT NOTES / SOURCE")}</span><span>{zh ? "你仍在 Room 中" : "Still inside the Room"}</span></footer>
            </>}

            {item.app === "finder" && <div className="laptop-os__app-content laptop-os__finder">
              <div className="laptop-os__finder-sidebar"><span>✿</span><strong>Olivia</strong><small>{zh ? "我的项目" : "My projects"}</small><small>{projects.length} {zh ? "个项目" : "projects"}</small></div>
              <div className="laptop-os__finder-main"><label><span>⌕</span><input value={finderQuery} onChange={(event) => setFinderQuery(event.target.value)} placeholder={zh ? "搜索项目" : "Find a project"} /></label><div className="laptop-os__finder-list">{projectList.map(({ entry }) => <button type="button" key={entry.id} onClick={() => openApp("browser", entry.id)}><span className="laptop-os__file-icon">▣</span><span><strong>{projectText(entry, language).title}</strong><small>{entry.year} · {entry.collection}</small></span><span>↗</span></button>)}</div></div>
            </div>}

            {item.app === "notes" && <div className="laptop-os__app-content laptop-os__notes"><div className="laptop-os__notes-heading">{zh ? "一张留在桌上的便签" : "A note left on the desktop"}<span>● {zh ? "已自动保存" : "Auto-saved"}</span></div><textarea aria-label={zh ? "编辑桌面便签" : "Edit desktop note"} spellCheck={false} value={note} onChange={(event) => setNote(event.target.value)} /><img className="laptop-os__notes-art" src="/visuals/quick-read/studio/studio-notes-collage.png" alt="" aria-hidden="true" decoding="async" /><span className="laptop-os__notes-foot">OLIVIA WONG · FOUR HEARTS</span></div>}

            {item.app === "settings" && <div className="laptop-os__app-content laptop-os__settings"><p>{zh ? "桌面外观" : "Desktop appearance"}</p><div className="laptop-os__skin-options">{(["win98", "system7", "aqua"] as const).map((option) => <button key={option} type="button" onClick={() => setSkin(option)} aria-pressed={skin === option}><span className={`laptop-os__skin-swatch laptop-os__skin-swatch--${option}`} /><strong>{option === "win98" ? "Windows 98" : option === "system7" ? "System 7" : "Aqua"}</strong></button>)}</div><p>{zh ? "网页显示" : "Web preview"}</p><div className="laptop-os__view-options"><button type="button" aria-pressed={webMode === "desktop"} onClick={() => setWebMode("desktop")}>{zh ? "桌面布局 · 1024" : "Desktop · 1024"}</button><button type="button" aria-pressed={webMode === "fluid"} onClick={() => setWebMode("fluid")}>{zh ? "自适应布局" : "Responsive"}</button></div></div>}

            {item.app === "about" && <div className="laptop-os__app-content laptop-os__about"><button type="button" className="laptop-os__about-mark" aria-label={zh ? "发现一个 Macintosh 小彩蛋" : "Find a Macintosh Easter egg"} onClick={() => showEasterEgg(zh ? "这台小机器里，装着一个更大的世界。" : "A bigger world lives inside this little machine.")}>✿</button><div><span className="laptop-os__eyebrow">MACINTOSH DESK EDITION · 2026</span><h3>FOUR HEARTS OS</h3><p>{zh ? "王心蕊的迷你数字工作室。浏览作品、留下便签、切换外观。" : "Olivia Wong's little digital studio. Open projects, leave a note, change the atmosphere."}</p><small>{zh ? "这是一个存在于 3D Room 的可交互桌面。" : "An interactive computer living inside the 3D Room."}</small></div></div>}

            {!item.maximized && <div className="laptop-os__resize-handle" role="separator" aria-label={zh ? "拖动调整窗口大小" : "Drag to resize window"} onPointerDown={(event) => beginGesture(event, item, "resize")} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture} />}
          </section>
        );
      })}

      {startOpen && <div className="laptop-os__start-menu" role="menu" aria-label={zh ? "开始菜单" : "Start menu"}>
        <div className="laptop-os__start-heading">✿ FOUR HEARTS <span>OS</span></div>
        {(["finder", "notes", "settings", "about"] as const).map((app) => <button key={app} type="button" role="menuitem" onClick={() => openApp(app)}><span>{appGlyphs[app]}</span>{app === "finder" ? (zh ? "项目文件夹" : "Projects") : app === "notes" ? (zh ? "工作室便签" : "Studio Notes") : app === "settings" ? (zh ? "控制面板" : "Control Panel") : (zh ? "关于这台电脑" : "About this computer")}</button>)}
        <div className="laptop-os__menu-caption">{zh ? "留在房间里，去别的世界看看。" : "A room with a window to other worlds."}</div>
      </div>}

      {easterEgg && <div className="laptop-os__easter-egg" role="status" aria-live="polite"><span aria-hidden="true">✿</span>{easterEgg}</div>}

      <footer className="laptop-os__taskbar">
        <button type="button" className="laptop-os__start" onClick={() => setStartOpen((open) => !open)} aria-expanded={startOpen}>✿ <span>{zh ? "开始" : "START"}</span></button>
        <div className="laptop-os__tasks">{windows.map((item) => <button key={item.id} type="button" className={active?.id === item.id ? "laptop-os__task laptop-os__task--active" : "laptop-os__task"} onClick={() => active?.id === item.id ? updateWindow(item.id, { minimized: true }) : raiseWindow(item.id)} title={item.title}>{appGlyphs[item.app]} {item.title}</button>)}</div>
        <span className="laptop-os__clock">✿ {clock.toLocaleTimeString(language === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
      </footer>
    </div>
  );
}
