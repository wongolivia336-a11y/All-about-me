import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { ArchiveEntry } from "../data/library";
import { quickReadPageIds, type QuickReadPageId } from "../data/quickRead";
import { projectText, themeText, useLanguage } from "../i18n";
import type { ThemeZoomOrigin } from "../brand/Heartwheel";
import { LanguageSwitch } from "./LanguageSwitch";
import { ExperienceBadgeScene, type BadgeItem } from "./ExperienceBadgeScene";
import "./QuickReadPage.css";

const pageIndex: Record<QuickReadPageId, number> = { experience: 1, education: 2, work: 3 };

type QuickReadPageProps = {
  pageId: QuickReadPageId;
  entries: ArchiveEntry[];
  onBack: () => void;
  onNavigate: (pageId: QuickReadPageId) => void;
  onProjectOpen: (entry: ArchiveEntry, origin?: ThemeZoomOrigin) => void;
};

function ExperiencePage({ language }: { language: "en" | "zh" }) {
  const [selected, setSelected] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const zh = language === "zh";
  const items = useMemo<BadgeItem[]>(() => zh
    ? [
        { title: "BioAZ", role: "AI 产品与 Agent 工作流设计", accent: "#bb8d8c", illustration: "/visuals/quick-read/experience/bioaz-workflow.png" },
        { title: "第二段经历", role: "公司、职位与时间待补充", accent: "#849eac", placeholder: true },
        { title: "第三段经历", role: "公司、职位与时间待补充", accent: "#9aa98e", placeholder: true },
      ]
    : [
        { title: "BioAZ", role: "AI product and agent workflow design", accent: "#bb8d8c", illustration: "/visuals/quick-read/experience/bioaz-workflow.png" },
        { title: "Next chapter", role: "Company, role and dates to be added", accent: "#849eac", placeholder: true },
        { title: "Another chapter", role: "Company, role and dates to be added", accent: "#9aa98e", placeholder: true },
      ], [zh]);

  const active = items[selected];
  return (
    <div className="quick-read-page__content quick-read-page__content--experience">
      <div className="quick-read-page__intro">
        <p className="quick-read-page__eyebrow">01 / {zh ? "实习经历 · 工牌档案" : "EXPERIENCE · BADGE ARCHIVE"}</p>
        <h1 id="quick-read-title" tabIndex={-1}>{zh ? "三张工牌，几段正在发生的工作。" : "Three badges, a few chapters of work."}</h1>
        <p>{zh ? "把经历做成可以轻轻拨动的实体工牌。悬停会摆动，点一下会晃一晃；两段信息先留出位置，等你补充。" : "A small, tactile archive of work. Hover to set each badge swinging; tap to give it a little momentum. Two entries are ready for your details."}</p>
      </div>

      <div className="quick-read-page__badge-stage" aria-label={zh ? "可交互的三张实习工牌" : "Three interactive internship badges"}>
        <span className="quick-read-page__stage-note" aria-hidden="true">{zh ? "轻轻碰一下" : "GIVE ONE A NUDGE"} <span>↗</span></span>
        <ExperienceBadgeScene items={items} selectedIndex={selected} onSelect={setSelected} reducedMotion={reducedMotion} />
        <div className="quick-read-page__badge-list" role="group" aria-label={zh ? "选择一段经历" : "Choose an experience"}>
          {items.map((item, index) => (
            <button
              type="button"
              key={item.title}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              style={{ "--item-accent": item.accent } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{item.title}
            </button>
          ))}
        </div>
      </div>

      <article className="quick-read-page__badge-detail" style={{ "--item-accent": active.accent } as CSSProperties}>
        <p className="quick-read-page__eyebrow">{zh ? `工牌 ${String(selected + 1).padStart(2, "0")} / 03` : `BADGE ${String(selected + 1).padStart(2, "0")} / 03`}</p>
        <h2>{active.title}</h2>
        <p className="quick-read-page__badge-role">{active.role}</p>
        <p>{selected === 0
          ? zh
            ? "参与 AI 产品界面与 Agent workflow 原型设计，关注信息如何被整理、审阅与交接。具体公司介绍、职位与时间可后续补齐。"
            : "Worked across AI product UI and agent workflow prototypes, with attention to how information is organized, reviewed and handed off. Company, title and dates can be added next."
          : zh
            ? "这一格保留给你补充真实经历；补上公司、职位、时间和一件最能代表你的具体成果即可。"
            : "This space is reserved for a real chapter. Add the company, role, dates and one concrete piece of work that best represents it."}</p>
        {selected > 0 && <span className="quick-read-page__pending">{zh ? "待补充" : "DETAILS TO COME"}</span>}
      </article>
    </div>
  );
}

function EducationPage({ language }: { language: "en" | "zh" }) {
  const [selected, setSelected] = useState(0);
  const folderInteractionRef = useRef(false);
  const [folderOpen, setFolderOpen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [sheetPulled, setSheetPulled] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        if (!folderInteractionRef.current) setFolderOpen(true);
      }, 160);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);
  const zh = language === "zh";
  const folios = zh
    ? [
        { kind: "degree", title: "同济大学", subtitle: "人工智能与数据设计", meta: "研究生 · 设计创意学院", note: "本科主修工业设计，辅修汉语言文学。研究生阶段转向 AI 与数据设计。", mark: "§", visual: "/visuals/quick-read/education/ai-data-design.png" },
        { kind: "field", title: "Gamma QGIS", subtitle: "大学路 · 街道智能体", meta: "Grasshopper / 空间研究", note: "围绕大学路展开街道空间与智能体的概念探索；具体调研材料可以补充进这本田野笔记。", mark: "↗", visual: "/visuals/quick-read/education/university-road-agents.png" },
        { kind: "paper", title: "论文与调研", subtitle: "留给下一份研究档案", meta: "论文题目与年份待补", note: "这里预留给论文、课程研究或田野调研。补上题目、方法与一张关键图表，就能成为完整的第三份档案。", mark: "＋", pending: true, visual: "/visuals/quick-read/education/paper-field-notes.png" },
      ]
    : [
        { kind: "degree", title: "Tongji University", subtitle: "AI & Data Design", meta: "Graduate study · College of Design and Innovation", note: "Undergraduate study in Industrial Design, with a minor in Chinese Language and Literature; graduate work in AI and Data Design.", mark: "§", visual: "/visuals/quick-read/education/ai-data-design.png" },
        { kind: "field", title: "Gamma QGIS", subtitle: "University Road · street agents", meta: "Grasshopper / spatial research", note: "A concept exploration of street space and urban agents around University Road. Field materials can be added to this notebook later.", mark: "↗", visual: "/visuals/quick-read/education/university-road-agents.png" },
        { kind: "paper", title: "Papers & field notes", subtitle: "Room for another research folio", meta: "Title and year to be added", note: "Reserved for a thesis, course research or field study. Add a title, method and one key diagram to complete the third folio.", mark: "+", pending: true, visual: "/visuals/quick-read/education/paper-field-notes.png" },
      ];
  const active = folios[selected];

  return (
    <div className="quick-read-page__content quick-read-page__content--education">
      <div className="quick-read-page__intro">
        <p className="quick-read-page__eyebrow">02 / {zh ? "教育经历 · 研究档案" : "EDUCATION · RESEARCH FOLIOS"}</p>
        <h1 id="quick-read-title" tabIndex={-1}>{zh ? "把教育经历，摊开成三份研究资料。" : "Education, opened as three research folios."}</h1>
        <p>{zh ? "一页写学习路径，一页放空间调研，一页留给论文与新的问题。" : "One folio for the path of study, one for spatial inquiry, and one waiting for a paper or a new question."}</p>
      </div>

      <div className="quick-read-page__folios" role="group" aria-label={zh ? "选择一份教育与研究档案" : "Choose an education and research folio"}>
        {folios.map((folio, index) => (
          <button
            className="quick-read-page__folio"
            data-kind={folio.kind}
            data-has-art="true"
            data-selected={selected === index ? "true" : "false"}
            data-open={selected === index && folderOpen ? "true" : "false"}
            data-pulled={selected === index && sheetPulled ? "true" : "false"}
            type="button"
            key={folio.title}
            aria-pressed={selected === index}
            aria-expanded={selected === index && folderOpen}
            aria-controls={`quick-read-folio-sheet-${index}`}
            aria-label={`${folio.title}: ${selected === index && folderOpen ? (zh ? "收起文件夹" : "Close folder") : (zh ? "打开文件夹" : "Open folder")}`}
            onClick={() => {
              folderInteractionRef.current = true;
              if (selected === index) {
                setFolderOpen((open) => !open);
                setSheetPulled(false);
                return;
              }
              setSelected(index);
              setFolderOpen(true);
              setSheetPulled(false);
            }}
          >
            <span className="quick-read-page__folio-back" />
            <span className="quick-read-page__folio-sheet" id={`quick-read-folio-sheet-${index}`}>
              <span className="quick-read-page__folio-paper">
                <span className="quick-read-page__folio-index">{String(index + 1).padStart(2, "0")} <i>·</i> {zh ? "研究资料" : "RESEARCH"}</span>
                <strong>{folio.title}</strong>
                <span className="quick-read-page__folio-subtitle">{folio.subtitle}</span>
                <img className="quick-read-page__folio-art" src={folio.visual} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                <span className="quick-read-page__folio-lines" aria-hidden="true"><i /><i /><i /></span>
                <span className="quick-read-page__folio-mark" aria-hidden="true">{folio.mark}</span>
                <small>{folio.meta}</small>
              </span>
            </span>
            <span className="quick-read-page__folio-sheet quick-read-page__folio-sheet--secondary" aria-hidden="true" />
            <span className="quick-read-page__folio-tab" aria-hidden="true" />
            <span className="quick-read-page__folio-front" aria-hidden="true">
              <strong>{folio.title}</strong>
              <small>{zh ? "研究档案 · 轻轻打开" : "RESEARCH FOLIO · OPEN GENTLY"}</small>
            </span>
          </button>
        ))}
      </div>

      <article className="quick-read-page__folio-detail" data-pending={active.pending ? "true" : "false"} data-folder-open={folderOpen ? "true" : "false"}>
        <p className="quick-read-page__eyebrow">{zh ? "当前打开" : "OPEN FOLIO"} / {String(selected + 1).padStart(2, "0")}</p>
        <h2>{active.title}</h2>
        <p className="quick-read-page__folio-meta">{active.meta}</p>
        <p>{active.note}</p>
        {active.pending && <span className="quick-read-page__pending">{zh ? "待补充题目与材料" : "TITLE & MATERIALS TO COME"}</span>}
        <button
          className="quick-read-page__folio-pull"
          type="button"
          disabled={!folderOpen}
          aria-expanded={sheetPulled}
          aria-controls={`quick-read-folio-sheet-${selected}`}
          onClick={() => setSheetPulled((pulled) => !pulled)}
        >
          {sheetPulled ? (zh ? "推回内页" : "Return sheet") : (zh ? "抽出内页" : "Pull out sheet")}
          <span aria-hidden="true">{sheetPulled ? "↙" : "↗"}</span>
        </button>
      </article>
    </div>
  );
}

function WorkPage({ language, entries, onProjectOpen }: {
  language: "en" | "zh";
  entries: ArchiveEntry[];
  onProjectOpen: QuickReadPageProps["onProjectOpen"];
}) {
  const zh = language === "zh";
  const featuredEntries = entries.slice(0, 3);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const posterRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const illustrations: Record<string, string> = {
    "bioaz-agent-workbench": "/visuals/quick-read/work/bioaz-agent-workbench.png",
    "knock-knock": "/visuals/quick-read/work/knock-knock-care.png",
    qiaopi: "/visuals/quick-read/work/qiaopi-letter-routes.png",
  };
  const selectedEntry = featuredEntries[selectedIndex];
  const selectedText = selectedEntry ? projectText(selectedEntry, language) : null;
  const selectedTheme = selectedEntry ? themeText(selectedEntry.primaryTheme, language) : null;
  const selectPoster = (index: number) => {
    if (!featuredEntries.length) return;
    setSelectedIndex((index + featuredEntries.length) % featuredEntries.length);
  };
  return (
    <div className="quick-read-page__content quick-read-page__content--work">
      <div className="quick-read-page__intro">
        <p className="quick-read-page__eyebrow">03 / {zh ? "精选作品 · 海报墙" : "SELECTED WORK · POSTER WALL"}</p>
        <h1 id="quick-read-title" tabIndex={-1}>{zh ? "三张海报，三种不同的靠近方式。" : "Three posters, three ways of getting closer."}</h1>
        <p>{zh ? "选中海报预览故事，用箭头或方向键翻阅，再打开档案进入完整项目。" : "Select a poster to preview its story. Browse with the arrows or poster keys, then open its project file."}</p>
      </div>

      <div className="quick-read-page__poster-grid">
        {featuredEntries.map((entry, index) => {
          const localized = projectText(entry, language);
          const definition = themeText(entry.primaryTheme, language);
          const illustration = illustrations[entry.id];
          return (
              <article className="quick-read-page__poster-card" key={entry.id} style={{ "--poster-accent": definition.accent } as CSSProperties}>
              <button
                ref={(node) => { posterRefs.current[index] = node; }}
                type="button"
                className="quick-read-page__poster-open"
                data-selected={selectedIndex === index ? "true" : "false"}
                aria-pressed={selectedIndex === index}
                aria-label={`${localized.title} — ${selectedIndex === index ? (zh ? "当前选中海报" : "Selected poster") : (zh ? "选择海报" : "Select poster")}`}
                onClick={() => selectPoster(index)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const next = (index + (event.key === "ArrowRight" ? 1 : -1) + featuredEntries.length) % featuredEntries.length;
                  selectPoster(next);
                  posterRefs.current[next]?.focus();
                }}
              >
                <span className="quick-read-page__poster-art" data-art={illustration ? "cutout" : "cover"}>
                  {illustration
                    ? <img className="quick-read-page__poster-cutout" src={illustration} alt="" loading="lazy" decoding="async" />
                    : entry.cover
                      ? <img src={entry.cover} alt="" loading="lazy" decoding="async" />
                      : <span className="quick-read-page__poster-fallback">{definition.shortLabel}</span>}
                  <span className="quick-read-page__poster-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="quick-read-page__poster-open-label">{zh ? "查看故事" : "VIEW STORY"} <i aria-hidden="true">↗</i></span>
                </span>
                <span className="quick-read-page__poster-meta"><span>{definition.label}</span><span>{entry.year}</span></span>
                <strong>{localized.title}</strong>
                <span className="quick-read-page__poster-summary">{localized.summary}</span>
              </button>
            </article>
          );
        })}
      </div>

      {selectedEntry && selectedText && selectedTheme && (
        <section className="quick-read-page__work-detail" aria-live="polite" aria-atomic="true">
          <div className="quick-read-page__work-story">
            <p className="quick-read-page__eyebrow">{String(selectedIndex + 1).padStart(2, "0")} / {selectedTheme.label} · {selectedEntry.year}</p>
            <h2>{selectedText.title}</h2>
            <p>{selectedText.summary}</p>
          </div>
          <div className="quick-read-page__work-controls" aria-label={zh ? "浏览精选项目" : "Browse selected projects"}>
            <button type="button" className="quick-read-page__work-turn" onClick={() => selectPoster(selectedIndex - 1)} aria-label={zh ? "上一张海报" : "Previous poster"}>←</button>
            <span>{String(selectedIndex + 1).padStart(2, "0")} / {String(featuredEntries.length).padStart(2, "0")}</span>
            <button type="button" className="quick-read-page__work-turn" onClick={() => selectPoster(selectedIndex + 1)} aria-label={zh ? "下一张海报" : "Next poster"}>→</button>
            <button
              type="button"
              className="quick-read-page__work-open"
              data-project-entry={selectedEntry.id}
              data-project-context="quick-read"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                onProjectOpen(selectedEntry, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
              }}
            >
              {zh ? "打开项目档案" : "Open project file"}<span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export function QuickReadPage({ pageId, entries, onBack, onNavigate, onProjectOpen }: QuickReadPageProps) {
  const { language, copy } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  if (returnFocusRef.current === null && typeof document !== "undefined") {
    const opener = document.activeElement;
    if (opener instanceof HTMLElement && opener !== document.body) returnFocusRef.current = opener;
  }
  const zh = language === "zh";
  const titles: Record<QuickReadPageId, string> = zh
    ? { experience: "实习经历", education: "教育与研究", work: "精选作品" }
    : { experience: "Experience", education: "Education", work: "Selected work" };

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    return () => {
      const target = returnFocusRef.current;
      if (!target?.isConnected) return;
      window.requestAnimationFrame(() => {
        if (target.closest("[inert], [aria-hidden='true']")) return;
        target.focus({ preventScroll: true });
      });
    };
  }, [pageId]);

  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onBack();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.offsetParent !== null);
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === rootRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <section
      ref={rootRef}
      className="quick-read-page"
      data-page={pageId}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-read-title"
      tabIndex={-1}
      onKeyDown={trapFocus}
    >
      <header className="quick-read-page__header">
        <button type="button" className="hud__btn quick-read-page__back" onClick={onBack}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.8 4.6 7.4 10l5.4 5.4M7.7 10h8" /></svg>
          <span>{copy.quickReadBack}</span>
        </button>
        <nav className="quick-read-page__steps" aria-label={zh ? "快速了解页面" : "Quick read pages"}>
          {quickReadPageIds.map((id) => (
            <button key={id} type="button" aria-current={id === pageId ? "page" : undefined} onClick={() => onNavigate(id)}>
              <span>{String(pageIndex[id]).padStart(2, "0")}</span>{titles[id]}
            </button>
          ))}
        </nav>
        <LanguageSwitch className="quick-read-page__language" />
      </header>

      {pageId === "experience" && <ExperiencePage language={language} />}
      {pageId === "education" && <EducationPage language={language} />}
      {pageId === "work" && <WorkPage language={language} entries={entries} onProjectOpen={onProjectOpen} />}
      <footer className="quick-read-page__footer"><span>FOUR HEARTS · OLIVIA WONG</span><span>{String(pageIndex[pageId]).padStart(2, "0")} / 03</span></footer>
    </section>
  );
}
