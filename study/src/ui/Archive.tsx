import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  library,
  type ArchiveEntry,
  type ThemeId,
} from "../data/library";
import { CONTACT_EMAIL, GITHUB_USER } from "../data/links";
import { projectText, themeText, useLanguage } from "../i18n";
import { LeafCanvas, type ThemeSelectionSource } from "./LeafCanvas";
import { LanguageSwitch } from "./LanguageSwitch";

interface ArchiveProps {
  active: boolean;
  initialTheme: ThemeId;
  initialFocused: boolean;
  showThemeArchive: boolean;
  projectId?: string;
  onClose: () => void;
  onThemeChange: (theme: ThemeId, showAll?: boolean, focused?: boolean) => void;
  onProjectOpen: (entry: ArchiveEntry) => void;
  onProjectClose: (theme: ThemeId) => void;
}
const visibleEntries = library.filter(
  (entry) => entry.status === "published" || entry.status === "prototype",
);

const featuredEntries = visibleEntries
  .filter((entry) => entry.featured)
  .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));

function ProjectCard({
  entry,
  onOpen,
  compact = false,
  featured = false,
  context = compact ? "archive" : "selected",
}: {
  entry: ArchiveEntry;
  onOpen: () => void;
  compact?: boolean;
  featured?: boolean;
  context?: "archive" | "selected";
}) {
  const { language, copy } = useLanguage();
  const definition = themeText(entry.primaryTheme, language);
  const localized = projectText(entry, language);
  const style = {
    "--card-accent": definition.accent,
    "--card-ink": definition.ink,
  } as CSSProperties;

  return (
    <article
      className={["project-card", compact && "project-card--compact", featured && "project-card--featured"]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <button
        className="project-card__open"
        type="button"
        data-project-entry={entry.id}
        data-project-context={context}
        onClick={onOpen}
      >
        <span className="project-card__visual">
          {entry.cover ? (
            <img src={entry.cover} alt="" width="1800" height="630" loading="lazy" decoding="async" />
          ) : (
            <span className="project-card__fallback" aria-label={copy.noPublicCover}>
              <span>{definition.label}</span>
              <small>{copy.noPublicCover}</small>
            </span>
          )}
          <span className="project-card__number">{String(entry.featuredOrder ?? 0).padStart(2, "0")}</span>
        </span>
        <span className="project-card__body">
          <span className="project-card__meta">
            <span>{definition.label}</span>
            <span>{entry.year}</span>
            {entry.status !== "published" && <span>{localized.status}</span>}
          </span>
          <strong>{localized.title}</strong>
          <span>{localized.summary}</span>
        </span>
      </button>
      <div className="project-card__tags" aria-label={`${localized.title} ${copy.projectTags}`}>
        {localized.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}
function ProjectDetail({
  entry,
  detailRef,
  onBack,
}: {
  entry: ArchiveEntry;
  detailRef: RefObject<HTMLElement | null>;
  onBack: () => void;
}) {
  const { language, copy } = useLanguage();
  const definition = themeText(entry.primaryTheme, language);
  const localized = projectText(entry, language);
  return (
    <section
      id="theme-panel"
      className="archive__project-detail"
      role="region"
      tabIndex={-1}
      aria-labelledby="project-detail-title"
      ref={detailRef}
      style={{ "--detail-accent": definition.accent, "--detail-ink": definition.ink } as CSSProperties}
    >
      <button className="archive__back" type="button" onClick={onBack}>
        {copy.backToArchive}
      </button>
      <div className="archive__project-grid">
        <div>
          <p className="archive__eyebrow">{definition.label} / {localized.type}</p>
          <h2 id="project-detail-title">{localized.title}</h2>
          <p className="archive__project-summary">{localized.summary}</p>
          <div className="archive__project-meta">
            <span>{entry.year}</span>
            <span>{definition.shortLabel}</span>
            <span>{localized.status}</span>
          </div>
          {entry.links.length > 0 && (
            <div className="archive__project-links">
              {entry.links.map((link, index) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  {localized.links[index]} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
        {entry.cover ? (
          <figure className="archive__project-art">
            <img
              className="archive__project-cover"
              src={entry.detailCover ?? entry.cover}
              alt=""
              width="1600"
              height="1000"
            />
            {entry.coverKind === "conceptual" && (
              <figcaption>{copy.conceptualCaption}</figcaption>
            )}
          </figure>
        ) : (
          <div className="archive__project-cover archive__project-cover--empty" aria-label={copy.noPublicCover}>
            <span>{definition.label}</span>
            <small>{copy.noPublicCover}</small>
          </div>
        )}
      </div>
    </section>
  );
}

export function Archive({
  active,
  initialTheme,
  initialFocused,
  showThemeArchive,
  projectId,
  onClose,
  onThemeChange,
  onProjectOpen,
  onProjectClose,
}: ArchiveProps) {
  const { language, copy } = useLanguage();
  const [activeTheme, setActiveTheme] = useState<ThemeId>(initialTheme);
  const [viewMode, setViewMode] = useState<"overview" | "focused">(initialFocused ? "focused" : "overview");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const archiveRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);
  const projectReturnFocus = useRef<HTMLElement | null>(null);
  const projectReturnTarget = useRef<{ entryId: string; context: string } | null>(null);
  const projectReturnScrollTop = useRef<number | null>(null);
  const projectReturnFocusTop = useRef<number | null>(null);
  const previousProjectId = useRef(selectedProjectId);

  useEffect(() => {
    setActiveTheme(initialTheme);
    setViewMode(initialFocused ? "focused" : "overview");
  }, [initialFocused, initialTheme]);
  useEffect(() => setSelectedProjectId(projectId), [projectId]);

  const currentDefinition = themeText(activeTheme, language);
  const themeEntries = useMemo(
    () => visibleEntries.filter((entry) => entry.primaryTheme === activeTheme),
    [activeTheme],
  );
  const selectedProject = selectedProjectId
    ? visibleEntries.find((entry) => entry.id === selectedProjectId)
    : undefined;

  useEffect(() => {
    if (selectedProject) {
      const frame = requestAnimationFrame(() => {
        detailRef.current?.focus({ preventScroll: true });
        detailRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
      previousProjectId.current = selectedProject.id;
      return () => cancelAnimationFrame(frame);
    }

    if (!previousProjectId.current) return;

    let followupFrame: number | null = null;
    const restoreProjectContext = () => {
      if (projectReturnScrollTop.current !== null && archiveRef.current) {
        archiveRef.current.scrollTop = projectReturnScrollTop.current;
      }
      const target = projectReturnFocus.current?.isConnected
        ? projectReturnFocus.current
        : projectReturnTarget.current
          ? archiveRef.current?.querySelector<HTMLElement>(
              `[data-project-entry="${projectReturnTarget.current.entryId}"][data-project-context="${projectReturnTarget.current.context}"]`,
            )
          : null;
      if (target && archiveRef.current && projectReturnFocusTop.current !== null) {
        archiveRef.current.scrollTop += target.getBoundingClientRect().top - projectReturnFocusTop.current;
      }
      (target ?? archiveRef.current?.querySelector<HTMLElement>("#theme-panel"))?.focus({ preventScroll: true });
      projectReturnFocus.current = null;
      projectReturnTarget.current = null;
      projectReturnScrollTop.current = null;
      projectReturnFocusTop.current = null;
    };
    const frame = requestAnimationFrame(() => {
      followupFrame = requestAnimationFrame(restoreProjectContext);
    });
    previousProjectId.current = selectedProjectId;
    return () => {
      cancelAnimationFrame(frame);
      if (followupFrame !== null) cancelAnimationFrame(followupFrame);
    };
  }, [selectedProject, selectedProjectId]);

  useEffect(() => {
    if (!active) return;
    document.title = selectedProject
      ? `${projectText(selectedProject, language).title} — ${language === "zh" ? "王心蕊" : "Olivia Wong"} / Four Hearts`
      : language === "zh" ? "王心蕊 — Four Hearts" : "Olivia Wong — Four Hearts";
  }, [active, language, selectedProject]);

  const selectTheme = (theme: ThemeId, source: ThemeSelectionSource = "select") => {
    // Only a deliberate second click on an active leaf toggles Overview.
    // Drag-and-snap of the same leaf keeps the focus intact.
    const zoomOut = source === "select" && activeTheme === theme && viewMode === "focused";
    setActiveTheme(theme);
    setViewMode(zoomOut ? "overview" : "focused");
    setSelectedProjectId(undefined);
    onThemeChange(theme, false, !zoomOut);
  };

  const openProject = (entry: ArchiveEntry) => {
    const activeElement = document.activeElement;
    projectReturnFocus.current = activeElement instanceof HTMLElement ? activeElement : null;
    projectReturnTarget.current = activeElement instanceof HTMLElement && activeElement.dataset.projectEntry
      ? {
          entryId: activeElement.dataset.projectEntry,
          context: activeElement.dataset.projectContext ?? "selected",
        }
      : null;
    projectReturnScrollTop.current = archiveRef.current?.scrollTop ?? 0;
    projectReturnFocusTop.current = activeElement instanceof HTMLElement
      ? activeElement.getBoundingClientRect().top
      : null;
    setActiveTheme(entry.primaryTheme);
    setSelectedProjectId(entry.id);
    onProjectOpen(entry);
  };

  const closeProject = () => {
    setSelectedProjectId(undefined);
    onProjectClose(activeTheme);
  };

  return (
    <main ref={archiveRef} className="archive" aria-label={copy.archiveAria}>
      <div className="archive__shell">
        <header className="archive__bar">
          <div className="archive__identity-lockup">
            <span className="archive__monogram">FOUR HEARTS / 01</span>
            <span className="archive__name">王心蕊</span>
            <span className="archive__name-en">Olivia Wong</span>
            <LanguageSwitch className="archive__language" />
          </div>
          <div className="archive__bar-links">
            <a href={`mailto:${CONTACT_EMAIL}`}>{copy.contact}</a>
          </div>
        </header>

        <section className="archive__hero" aria-labelledby="archive-title">
          <div className="archive__identity">
            <p className="archive__eyebrow">{copy.heroEyebrow}</p>
            <h1 id="archive-title">{copy.heroTitle}</h1>
            <p className="archive__lede">
              {copy.heroLead}
            </p>
            <div className="archive__hero-actions">
              <button type="button" onClick={() => document.getElementById("selected-works")?.scrollIntoView({ behavior: "smooth" })}>
                {copy.seeSelected}
              </button>
              <a href={`mailto:${CONTACT_EMAIL}`}>{copy.startConversation}</a>
            </div>
          </div>
        </section>

        {selectedProject ? (
          <ProjectDetail entry={selectedProject} detailRef={detailRef} onBack={closeProject} />
        ) : (
          <section
            id="theme-panel"
            className="archive__theme-section"
            role="region"
            tabIndex={-1}
            aria-labelledby="theme-title"
          >
            {showThemeArchive ? (
              <div className="leaf-canvas__archive">
                <div className="leaf-canvas__archive-bar">
                  <div>
                    <p className="archive__eyebrow">{copy.fourThemeIndex} / {currentDefinition.label}</p>
                    <h2 id="theme-title">{currentDefinition.shortLabel}</h2>
                  </div>
                  <button className="leaf-canvas__archive-back" type="button" onClick={() => onThemeChange(activeTheme, false, viewMode === "focused")}>
                    {copy.backToIndex}
                  </button>
                </div>
                {themeEntries.length > 0 ? (
                  <div className="leaf-canvas__archive-list">
                    {themeEntries.map((entry) => (
                      <ProjectCard key={entry.id} entry={entry} compact onOpen={() => openProject(entry)} />
                    ))}
                  </div>
                ) : (
                  <p className="archive__empty">{copy.noPublishedEntries}</p>
                )}
              </div>
            ) : (
              <LeafCanvas
                activeTheme={activeTheme}
                focused={viewMode === "focused"}
                onThemeChange={selectTheme}
                onProjectOpen={openProject}
                onViewAll={(theme) => {
                  setActiveTheme(theme);
                  setViewMode("focused");
                  onThemeChange(theme, true, true);
                }}
              />
            )}
          </section>
        )}

        <section id="selected-works" className="archive__selected" aria-labelledby="selected-title">
          <div className="archive__section-heading">
            <div>
              <p className="archive__eyebrow">{copy.practiceEyebrow}</p>
              <h2 id="selected-title">{copy.selectedWorks}</h2>
            </div>
            <p>{copy.selectedWorksDescription}</p>
          </div>
          <div className="selected-grid">
            {featuredEntries.map((entry) => (
              <ProjectCard key={entry.id} entry={entry} onOpen={() => openProject(entry)} />
            ))}
          </div>
        </section>

        <section className="archive__about" aria-labelledby="about-title">
          <div>
            <p className="archive__eyebrow">{copy.aboutEyebrow}</p>
            <h2 id="about-title">{copy.aboutTitle}</h2>
          </div>
          <p>
            {copy.aboutBody}
          </p>
        </section>

        <footer className="archive__footer">
          <div>
            <span className="archive__eyebrow">{copy.openLine}</span>
            <a className="archive__contact" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <div className="archive__footer-links">
            <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">GitHub ↗</a>
            <button type="button" onClick={onClose}>{copy.exploreRoom}</button>
          </div>
          <span className="archive__footer-note">王心蕊 / Olivia Wong · Four Hearts</span>
        </footer>
      </div>
    </main>
  );
}
// End of archive view.
