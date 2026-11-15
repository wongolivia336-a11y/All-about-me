import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { library } from "../data/library";
import { projectText, type Language } from "../i18n";
import "./LaptopDesktop.css";

const SCREEN_WIDTH = 548;
const SCREEN_HEIGHT = 352;
const DESKTOP_VIEWPORT = 1024;
const NOTE_KEY = "four-hearts-desktop-note";
const SKIN_KEY = "four-hearts-desktop-skin";

const websites = library.flatMap((entry) => {
  const website = entry.links.find((link) => /^https:\/\//.test(link.url) && !link.url.includes("github.com"))?.url;
  const github = entry.links.find((link) => link.url.includes("github.com"))?.url;
  return website ? [{ entry, website, github }] : [];
}).slice(0, 7);

type Project = (typeof websites)[number];
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

const appGlyphs: Record<AppKind, string> = {
  browser: "▣",
  finder: "▤",
  notes: "✎",
  settings: "⚙",
  about: "✿",
};

function readStored(key: string, fallback: string) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

/**
 * Keep a real desktop-sized viewport inside the little physical laptop.
 * The visitor can switch to the native responsive viewport at any time.
 */
function WebsiteFrame({ project, mode, revision, language }: {
  project: Project;
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
  const highestZ = useRef(5);
  const gesture = useRef<Gesture | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { try { window.localStorage.setItem(SKIN_KEY, skin); } catch { /* optional preference */ } }, [skin]);
  useEffect(() => { try { window.localStorage.setItem(NOTE_KEY, note); } catch { /* ephemeral note */ } }, [note]);

  const active = useMemo(() => [...windows].filter((item) => !item.minimized).sort((a, b) => b.z - a.z)[0], [windows]);
  const sorted = useMemo(() => [...windows].sort((a, b) => a.z - b.z), [windows]);
  const selectedProject = (id?: string) => websites.find((item) => item.entry.id === id);

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
      const titles = { finder: "Projects", notes: "Studio Notes", settings: "Control Panel", about: "About FOUR HEARTS", browser: project?.entry.title ?? "Web" };
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

  const closeWindow = (id: string) => setWindows((items) => items.filter((item) => item.id !== id));
  const beginGesture = (event: PointerEvent<HTMLDivElement>, item: WindowState, mode: Gesture["mode"]) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button") || item.maximized) return;
    raiseWindow(item.id);
    gesture.current = {
      id: item.id, mode, pointerId: event.pointerId,
      x: event.clientX, y: event.clientY,
      left: item.x, top: item.y, width: item.width, height: item.height,
    };
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
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* capture already lost */ }
    event.stopPropagation();
  };

  const projectList = websites.filter(({ entry }) => `${entry.title} ${entry.tags.join(" ")}`.toLowerCase().includes(finderQuery.toLowerCase()));

  return (
    <div
      className="laptop-os"
      data-skin={skin}
      role="application"
      aria-label={zh ? "3D 电脑中的 FOUR HEARTS 桌面" : "FOUR HEARTS desktop inside the 3D laptop"}
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
      <div className="laptop-os__wallpaper" aria-hidden="true" />
      <header className="laptop-os__menubar">
        <button type="button" className="laptop-os__brand" onClick={() => setStartOpen((open) => !open)} aria-expanded={startOpen}>✿ <strong>FOUR HEARTS</strong></button>
        <button type="button" onClick={() => openApp("finder")}>{zh ? "文件" : "File"}</button>
        <button type="button" onClick={() => openApp("settings")}>{zh ? "视图" : "View"}</button>
        <button type="button" onClick={() => openApp("about")}>{zh ? "帮助" : "Help"}</button>
        <time dateTime={clock.toISOString()}>{clock.toLocaleTimeString(language === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</time>
      </header>

      <div className="laptop-os__shortcuts">
        {websites.map(({ entry }, index) => (
          <button key={entry.id} type="button" className="laptop-os__shortcut" onClick={() => openApp("browser", entry.id)} title={projectText(entry, language).title}>
            <span className="laptop-os__project-icon" style={{ "--icon-tone": ["#9cc3bd", "#c8b8a6", "#a2b9ce", "#d6b9ba", "#b2baa5", "#a8b5b7", "#d7c6a6"][index] } as CSSProperties} aria-hidden="true"><span>✳</span></span>
            <span>{projectText(entry, language).title}</span>
          </button>
        ))}
      </div>
      <div className="laptop-os__utilities">
        {(["finder", "notes", "settings"] as const).map((app) => (
          <button key={app} type="button" className="laptop-os__utility" onClick={() => openApp(app)}>
            <span aria-hidden="true">{appGlyphs[app]}</span>
            <small>{app === "finder" ? (zh ? "项目" : "Projects") : app === "notes" ? (zh ? "便签" : "Notes") : (zh ? "设置" : "Settings")}</small>
          </button>
        ))}
      </div>
      <div className="laptop-os__wallpaper-signature" aria-hidden="true"><strong>four hearts.</strong><span>an archive of little things</span></div>

      {sorted.map((item) => {
        if (item.minimized) return null;
        const project = selectedProject(item.projectId);
        return (
          <section
            key={item.id}
            className={["laptop-os__window", item.maximized && "laptop-os__window--max", active?.id === item.id && "laptop-os__window--active"].filter(Boolean).join(" ")}
            style={item.maximized ? { zIndex: item.z } : { zIndex: item.z, left: item.x, top: item.y, width: item.width, height: item.height }}
            aria-label={item.title}
            onPointerDown={() => { if (active?.id !== item.id) raiseWindow(item.id); }}
          >
            <div className="laptop-os__titlebar" onPointerDown={(event) => beginGesture(event, item, "move")} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("button")) updateWindow(item.id, { maximized: !item.maximized }); }}>
              <span className="laptop-os__title-icon" aria-hidden="true">{appGlyphs[item.app]}</span>
              <strong>{item.title}</strong>
              <div className="laptop-os__window-actions">
                <button type="button" onClick={() => updateWindow(item.id, { minimized: true })} aria-label={zh ? "最小化" : "Minimize"} title={zh ? "最小化" : "Minimize"}>_</button>
                <button type="button" onClick={() => updateWindow(item.id, { maximized: !item.maximized })} aria-label={zh ? "放大或还原窗口" : "Maximize or restore"} title={zh ? "放大或还原" : "Maximize or restore"}>{item.maximized ? "◱" : "□"}</button>
                <button type="button" onClick={() => closeWindow(item.id)} aria-label={zh ? "关闭窗口" : "Close window"} title={zh ? "关闭" : "Close"}>×</button>
              </div>
            </div>

            {item.app === "browser" && project && <>
              <nav className="laptop-os__browser-bar" aria-label={zh ? "浏览器工具栏" : "Browser toolbar"}>
                <button type="button" className="laptop-os__browser-tab" aria-pressed={item.tab === "web"} onClick={() => updateWindow(item.id, { tab: "web" })}>{zh ? "网页" : "Web"}</button>
                <button type="button" className="laptop-os__browser-tab" aria-pressed={item.tab === "info"} onClick={() => updateWindow(item.id, { tab: "info" })}>{zh ? "档案" : "Info"}</button>
                <span className="laptop-os__address" title={project.website}>⌁ {project.website.replace(/^https?:\/\//, "")}</span>
                <button type="button" title={zh ? "刷新" : "Reload"} aria-label={zh ? "刷新网页" : "Reload website"} onClick={() => updateWindow(item.id, { revision: item.revision + 1, tab: "web" })}>↻</button>
                <button type="button" className="laptop-os__viewport-toggle" onClick={() => setWebMode((mode) => mode === "desktop" ? "fluid" : "desktop")} aria-label={zh ? "切换网页视口" : "Switch website viewport"} title={zh ? "切换桌面/自适应视口" : "Desktop / responsive viewport"}>{webMode === "desktop" ? "1024" : "AUTO"}</button>
              </nav>
              <div className="laptop-os__window-body">
                {item.tab === "web"
                  ? <WebsiteFrame project={project} mode={webMode} revision={item.revision} language={language} />
                  : <div className="laptop-os__project-info">
                    {project.entry.cover && <img src={project.entry.cover} alt="" />}
                    <span className="laptop-os__eyebrow">{project.entry.year} / {project.entry.collection.toUpperCase()}</span>
                    <h3>{projectText(project.entry, language).title}</h3>
                    <p>{projectText(project.entry, language).summary}</p>
                    <div className="laptop-os__project-links"><a href={project.website} target="_blank" rel="noopener noreferrer">{zh ? "在独立窗口查看 ↗" : "Open full website ↗"}</a>{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</div>
                    <small>{zh ? "如果嵌入网站限制显示，可以在独立窗口打开。" : "If the embedded page is restricted, open the full website."}</small>
                  </div>}
              </div>
              <footer className="laptop-os__statusbar"><span>{webMode === "desktop" ? "DESKTOP 1024 PX" : "RESPONSIVE VIEW"}</span><span>{zh ? "你仍在 Room 中" : "Still inside the Room"}</span></footer>
            </>}

            {item.app === "finder" && <div className="laptop-os__app-content laptop-os__finder">
              <div className="laptop-os__finder-sidebar"><span>✿</span><strong>Olivia</strong><small>{zh ? "我的项目" : "My projects"}</small><small>{websites.length} {zh ? "个站点" : "websites"}</small></div>
              <div className="laptop-os__finder-main"><label><span>⌕</span><input value={finderQuery} onChange={(event) => setFinderQuery(event.target.value)} placeholder={zh ? "搜索项目" : "Find a project"} /></label><div className="laptop-os__finder-list">{projectList.map(({ entry }) => <button type="button" key={entry.id} onClick={() => openApp("browser", entry.id)}><span className="laptop-os__file-icon">▣</span><span><strong>{projectText(entry, language).title}</strong><small>{entry.year} · {entry.collection}</small></span><span>↗</span></button>)}</div></div>
            </div>}

            {item.app === "notes" && <div className="laptop-os__app-content laptop-os__notes"><div className="laptop-os__notes-heading">{zh ? "一张留在桌上的便签" : "A note left on the desktop"}<span>● {zh ? "已自动保存" : "Auto-saved"}</span></div><textarea aria-label={zh ? "编辑桌面便签" : "Edit desktop note"} spellCheck={false} value={note} onChange={(event) => setNote(event.target.value)} /><span className="laptop-os__notes-foot">OLIVIA WONG · FOUR HEARTS</span></div>}

            {item.app === "settings" && <div className="laptop-os__app-content laptop-os__settings"><p>{zh ? "桌面外观" : "Desktop appearance"}</p><div className="laptop-os__skin-options">{(["win98", "system7", "aqua"] as const).map((option) => <button key={option} type="button" onClick={() => setSkin(option)} aria-pressed={skin === option}><span className={`laptop-os__skin-swatch laptop-os__skin-swatch--${option}`} /><strong>{option === "win98" ? "Windows 98" : option === "system7" ? "System 7" : "Aqua"}</strong></button>)}</div><p>{zh ? "网页显示" : "Web preview"}</p><div className="laptop-os__view-options"><button type="button" aria-pressed={webMode === "desktop"} onClick={() => setWebMode("desktop")}>{zh ? "桌面布局 · 1024" : "Desktop · 1024"}</button><button type="button" aria-pressed={webMode === "fluid"} onClick={() => setWebMode("fluid")}>{zh ? "自适应布局" : "Responsive"}</button></div></div>}

            {item.app === "about" && <div className="laptop-os__app-content laptop-os__about"><span className="laptop-os__about-mark">✿</span><div><span className="laptop-os__eyebrow">DESKTOP EDITION · 2026</span><h3>FOUR HEARTS OS</h3><p>{zh ? "王心蕊的迷你数字工作室。浏览作品、留下便签、切换外观。" : "Olivia Wong's little digital studio. Open projects, leave a note, change the atmosphere."}</p><small>{zh ? "这是一个存在于 3D Room 的可交互桌面。" : "An interactive computer living inside the 3D Room."}</small></div></div>}

            {!item.maximized && <div className="laptop-os__resize-handle" role="separator" aria-label={zh ? "拖动调整窗口大小" : "Drag to resize window"} onPointerDown={(event) => beginGesture(event, item, "resize")} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture} />}
          </section>
        );
      })}

      {startOpen && <div className="laptop-os__start-menu" role="menu" aria-label={zh ? "开始菜单" : "Start menu"}>
        <div className="laptop-os__start-heading">✿ FOUR HEARTS <span>OS</span></div>
        {(["finder", "notes", "settings", "about"] as const).map((app) => <button key={app} type="button" role="menuitem" onClick={() => openApp(app)}><span>{appGlyphs[app]}</span>{app === "finder" ? (zh ? "项目文件夹" : "Projects") : app === "notes" ? (zh ? "工作室便签" : "Studio Notes") : app === "settings" ? (zh ? "控制面板" : "Control Panel") : (zh ? "关于这台电脑" : "About this computer")}</button>)}
        <div className="laptop-os__menu-caption">{zh ? "留在房间里，去别的世界看看。" : "A room with a window to other worlds."}</div>
      </div>}

      <footer className="laptop-os__taskbar">
        <button type="button" className="laptop-os__start" onClick={() => setStartOpen((open) => !open)} aria-expanded={startOpen}>✿ <span>{zh ? "开始" : "START"}</span></button>
        <div className="laptop-os__tasks">{windows.map((item) => <button key={item.id} type="button" className={active?.id === item.id ? "laptop-os__task laptop-os__task--active" : "laptop-os__task"} onClick={() => active?.id === item.id ? updateWindow(item.id, { minimized: true }) : raiseWindow(item.id)} title={item.title}>{appGlyphs[item.app]} {item.title}</button>)}</div>
        <span className="laptop-os__clock">✿ {clock.toLocaleTimeString(language === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
      </footer>
    </div>
  );
}
