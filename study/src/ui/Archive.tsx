import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  library,
  type ArchiveEntry,
  type ThemeId,
} from "../data/library";
import { CONTACT_EMAIL, GITHUB_USER } from "../data/links";
import type { ThemeZoomOrigin } from "../brand/Heartwheel";
import type { QuickReadPageId } from "../data/quickRead";
import { projectText, themeText, useLanguage } from "../i18n";
import { ContactLinks } from "./ContactLinks";
import { LeafWorld as LeafCanvas, type ThemeSelectionSource } from "./LeafWorld";
import { LanguageSwitch } from "./LanguageSwitch";
import { QuickRead } from "./QuickRead";
import { QuickReadPage } from "./QuickReadPage";

interface ArchiveProps {
  active: boolean;
  initialTheme: ThemeId;
  initialFocused: boolean;
  showThemeArchive: boolean;
  projectId?: string;
  quickReadId?: QuickReadPageId;
  onClose: () => void;
  onThemeChange: (theme: ThemeId, showAll?: boolean, focused?: boolean, origin?: ThemeZoomOrigin) => void;
  onProjectOpen: (entry: ArchiveEntry, origin?: ThemeZoomOrigin) => void;
  onProjectClose: (theme: ThemeId) => void;
  onQuickReadOpen: (pageId: QuickReadPageId) => void;
  onQuickReadClose: () => void;
}
const visibleEntries = library.filter(
  (entry) => entry.status === "published" || entry.status === "prototype",
);

const featuredEntries = visibleEntries
  .filter((entry) => entry.featured)
  .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
const allProjectEntries = visibleEntries
  .filter((entry) => entry.portfolioOrder !== undefined)
  .sort((a, b) => (a.portfolioOrder ?? 99) - (b.portfolioOrder ?? 99));

function ProjectCard({
  entry,
  onOpen,
  compact = false,
  featured = false,
  context = compact ? "archive" : "selected",
}: {
  entry: ArchiveEntry;
  onOpen: (origin: ThemeZoomOrigin) => void;
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
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          onOpen({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
        }}
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
          <span className="project-card__reveal" aria-hidden="true">{copy.exploreProject}</span>
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

function ProjectIndexItem({
  entry,
  onOpen,
}: {
  entry: ArchiveEntry;
  onOpen: (origin: ThemeZoomOrigin) => void;
}) {
  const { language, copy } = useLanguage();
  const definition = themeText(entry.primaryTheme, language);
  const localized = projectText(entry, language);
  return (
    <li className="project-index__item" style={{ "--card-accent": definition.accent, "--card-ink": definition.ink } as CSSProperties}>
      <button
        className="project-index__open"
        type="button"
        data-project-entry={entry.id}
        data-project-context="all-projects"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          onOpen({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
        }}
      >
        <span className="project-index__meta">
          <span className="project-index__number">{String(entry.portfolioOrder ?? 0).padStart(2, "0")}</span>
          <span>{definition.label} / {localized.type}</span>
          {entry.status === "prototype" && <span>{localized.status}</span>}
        </span>
        <strong>{localized.title}</strong>
        <span className="project-index__summary">{localized.summary}</span>
        <span className="project-index__tags">{localized.tags.slice(0, 2).map((tag) => <i key={tag}>{tag}</i>)}</span>
        <span className="project-index__action">{copy.exploreProject} <span aria-hidden="true">↗</span></span>
      </button>
      {entry.links.length > 0 && (
        <div className="project-index__links">
          {entry.links.map((link, index) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {localized.links[index]} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

function ProjectDetail({
  entry,
  detailRef,
  onBack,
  transition,
  origin,
}: {
  entry: ArchiveEntry;
  detailRef: RefObject<HTMLElement | null>;
  onBack: () => void;
  transition: "entering" | "entered" | "exiting";
  origin: { x: number; y: number };
}) {
  const { language, copy } = useLanguage();
  const definition = themeText(entry.primaryTheme, language);
  const localized = projectText(entry, language);
  return (
    <section
      id="theme-panel"
      className="archive__project-detail"
      data-transition={transition}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-labelledby="project-detail-title"
      ref={detailRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onBack();
          return;
        }
        if (event.key !== "Tab") return;
        const root = event.currentTarget;
        const controls = Array.from(root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((element) => element.offsetParent !== null);
        if (controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root)) {
          event.preventDefault();
          first.focus();
        }
      }}
      style={{
        "--detail-accent": definition.accent,
        "--detail-ink": definition.ink,
        "--detail-x": `${origin.x}px`,
        "--detail-y": `${origin.y}px`,
      } as CSSProperties}
    >
      <div className="archive__project-toolbar">
        <LanguageSwitch className="archive__language" />
        <button className="archive__back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span><span>{copy.backToWorld}</span>
        </button>
      </div>
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
  quickReadId,
  onClose,
  onThemeChange,
  onProjectOpen,
  onProjectClose,
  onQuickReadOpen,
  onQuickReadClose,
}: ArchiveProps) {
  const { language, copy } = useLanguage();
  const heroNameParts = copy.heroTitle.replace(/\.$/, "").split(" ");
  const heroGivenName = heroNameParts[0] || "Olivia";
  const heroFamilyName = heroNameParts.slice(1).join(" ") || "Wong";
  const [activeTheme, setActiveTheme] = useState<ThemeId>(initialTheme);
  const [viewMode, setViewMode] = useState<"overview" | "focused">(initialFocused ? "focused" : "overview");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const [projectTransition, setProjectTransition] = useState<"entering" | "entered" | "exiting">("entered");
  const [projectSourceOrigin, setProjectSourceOrigin] = useState<ThemeZoomOrigin | null>(null);
  const [projectOrigin, setProjectOrigin] = useState({ x: 50, y: 50 });
  const [menuOpen, setMenuOpen] = useState(false);
  const archiveRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);
  const closeProjectTimer = useRef<number | null>(null);
  const previousRouteProjectId = useRef(projectId);
  const projectReturnFocus = useRef<HTMLElement | null>(null);
  const projectReturnTarget = useRef<{ entryId: string; context: string } | null>(null);
  const projectReturnScrollTop = useRef<number | null>(null);
  const projectReturnFocusTop = useRef<number | null>(null);
  const previousProjectId = useRef(selectedProjectId);

  useEffect(() => {
    setActiveTheme(initialTheme);
    setViewMode(initialFocused ? "focused" : "overview");
  }, [initialFocused, initialTheme]);
  const scrollToSection = useCallback((id: string) => {
    setMenuOpen(false);
    const container = archiveRef.current;
    const target = container?.querySelector<HTMLElement>(`#${id}`);
    if (!container || !target) return;
    // The archive is the scroll root; window.scrollTo/scrollIntoView can leave
    // this nested scroll position unchanged after fixed overlay transitions.
    const destination = id === "top"
      ? 0
      : container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - 96;
    container.scrollTo({
      top: Math.max(0, destination),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, []);

  useEffect(() => () => {
    if (closeProjectTimer.current !== null) window.clearTimeout(closeProjectTimer.current);
  }, []);

  useEffect(() => {
    if (projectId) {
      previousRouteProjectId.current = projectId;
      if (closeProjectTimer.current !== null) window.clearTimeout(closeProjectTimer.current);
      setSelectedProjectId(projectId);
      setProjectTransition("entering");
      return;
    }
    if (!previousRouteProjectId.current) return;
    previousRouteProjectId.current = undefined;
    setProjectTransition("exiting");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeProjectTimer.current = window.setTimeout(() => {
      setSelectedProjectId(undefined);
      closeProjectTimer.current = null;
    }, reducedMotion ? 0 : 420);
  }, [projectId]);

  const selectedProject = selectedProjectId
    ? visibleEntries.find((entry) => entry.id === selectedProjectId)
    : undefined;

  useLayoutEffect(() => {
    if (!selectedProject || !projectSourceOrigin || !detailRef.current) return;
    const bounds = detailRef.current.getBoundingClientRect();
    setProjectOrigin({
      x: projectSourceOrigin.x - bounds.left,
      y: projectSourceOrigin.y - bounds.top,
    });
  }, [projectSourceOrigin, selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    const frame = requestAnimationFrame(() => setProjectTransition("entered"));
    return () => cancelAnimationFrame(frame);
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      const frame = requestAnimationFrame(() => {
        detailRef.current?.focus({ preventScroll: true });
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
      (target ?? archiveRef.current?.querySelector<HTMLElement>("#worlds"))?.focus({ preventScroll: true });
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

  const selectTheme = (
    theme: ThemeId,
    source: ThemeSelectionSource = "select",
    origin?: ThemeZoomOrigin,
  ) => {
    // Only a deliberate second click on an active leaf toggles Overview.
    // Drag-and-snap of the same leaf keeps the focus intact.
    const zoomOut = source === "select" && activeTheme === theme && viewMode === "focused";
    setActiveTheme(theme);
    setViewMode(zoomOut ? "overview" : "focused");
    setSelectedProjectId(undefined);
    onThemeChange(theme, false, !zoomOut, origin);
  };

  const openProject = (entry: ArchiveEntry, origin?: ThemeZoomOrigin) => {
    if (closeProjectTimer.current !== null) window.clearTimeout(closeProjectTimer.current);
    previousRouteProjectId.current = projectId;
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
    setProjectSourceOrigin(origin ?? null);
    setProjectOrigin(origin ?? { x: 50, y: 50 });
    setProjectTransition("entering");
    setSelectedProjectId(entry.id);
    onProjectOpen(entry, origin);
  };

  const closeProject = () => {
    if (projectTransition === "exiting") return;
    setProjectTransition("exiting");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeProjectTimer.current = window.setTimeout(() => {
      previousRouteProjectId.current = undefined;
      setSelectedProjectId(undefined);
      onProjectClose(activeTheme);
      closeProjectTimer.current = null;
    }, reducedMotion ? 0 : 420);
  };

  const worldFocused = viewMode === "focused" || showThemeArchive;

  return (
    <>
      <main
        ref={archiveRef}
        className="archive"
        data-zoom={selectedProject ? "project" : worldFocused ? "world" : "index"}
        aria-label={copy.archiveAria}
        aria-hidden={Boolean(selectedProject || quickReadId)}
        inert={Boolean(selectedProject || quickReadId)}
      >
        <div className="archive__shell">
          <header className="archive__bar" id="top" aria-hidden={worldFocused} inert={worldFocused}>
            <a
              className="archive__identity-lockup"
              href="#index"
              onClick={(event) => {
                event.preventDefault();
                setMenuOpen(false);
                onThemeChange(activeTheme, false, false);
                scrollToSection("top");
              }}
            >
              <span className="archive__mark" aria-hidden="true"><i /><i /><i /><i /><b /></span>
              <span className="archive__brand-stack">
                <span className="archive__wordmark">FOUR HEARTS</span>
                <span className="archive__byline">OLIVIA WONG · 王心蕊</span>
              </span>
            </a>

            <button
              className="archive__menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              aria-label={menuOpen ? copy.closeNavigation : copy.openNavigation}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            <nav
              className="archive__nav"
              id="primary-navigation"
              aria-label={copy.navigation}
              data-open={menuOpen ? "true" : "false"}
            >
              <button type="button" onClick={() => scrollToSection("worlds")}>{copy.navWorlds}</button>
              <button type="button" onClick={() => scrollToSection("selected-works")}>{copy.navWork}</button>
              <button type="button" onClick={() => scrollToSection("about")}>{copy.navAbout}</button>
            </nav>

            <div className="archive__bar-actions">
              <LanguageSwitch className="archive__language" />
              <a className="archive__contact-link" href={`mailto:${CONTACT_EMAIL}`}>{copy.contact}<span aria-hidden="true"> ↗</span></a>
            </div>
          </header>

          <div className="archive__stage">
            <section className="archive__hero" aria-labelledby="archive-title" aria-hidden={worldFocused} inert={worldFocused}>
              <div className="archive__identity">
                <p className="archive__eyebrow"><span className="archive__status-dot" aria-hidden="true" />{copy.heroEyebrow}</p>
                <h1 id="archive-title">
                  <span className="archive__hero-given-name">{heroGivenName}</span>
                  <span className="archive__hero-family-name">{heroFamilyName}<i aria-hidden="true">.</i></span>
                </h1>
                <p className="archive__lede">{copy.heroLead}</p>
                <ContactLinks />
                <div className="archive__hero-actions">
                  <button type="button" onClick={() => scrollToSection("selected-works")}>
                    {copy.seeSelected}
                  </button>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{copy.startConversation}</a>
                </div>
              </div>
            </section>

            <section
              id="worlds"
              className="archive__theme-section"
              role="region"
              tabIndex={-1}
              aria-label={copy.overviewTitle}
            >
              <LeafCanvas
                activeTheme={activeTheme}
                focused={worldFocused}
                onThemeChange={selectTheme}
                onProjectOpen={openProject}
              />
            </section>
          </div>

          <QuickRead
            active={!worldFocused}
            onOpenPage={onQuickReadOpen}
          />

          <section id="selected-works" className="archive__selected" aria-labelledby="selected-title" aria-hidden={worldFocused} inert={worldFocused}>
            <div className="archive__section-heading">
              <div>
                <p className="archive__eyebrow">{copy.practiceEyebrow}</p>
                <h2 id="selected-title">{copy.selectedWorks}</h2>
              </div>
              <p>{copy.selectedWorksDescription}</p>
            </div>
            <div className="selected-grid">
              {featuredEntries.map((entry) => (
                <ProjectCard key={entry.id} entry={entry} onOpen={(origin) => openProject(entry, origin)} />
              ))}
            </div>
            <a className="archive__all-projects-link" href="#all-projects">{copy.viewAllProjects}<span aria-hidden="true">↘</span></a>
          </section>

          <section id="all-projects" className="archive__project-index" aria-labelledby="all-projects-title" aria-hidden={worldFocused} inert={worldFocused}>
            <div className="archive__section-heading">
              <div>
                <p className="archive__eyebrow">{copy.allProjectsEyebrow} / {String(allProjectEntries.length).padStart(2, "0")}</p>
                <h2 id="all-projects-title">{copy.allProjects}</h2>
              </div>
              <p>{copy.allProjectsDescription}</p>
            </div>
            <ol className="project-index">
              {allProjectEntries.map((entry) => (
                <ProjectIndexItem key={entry.id} entry={entry} onOpen={(origin) => openProject(entry, origin)} />
              ))}
            </ol>
          </section>

          <section id="about" className="archive__about" aria-labelledby="about-title" aria-hidden={worldFocused} inert={worldFocused}>
            <div>
              <p className="archive__eyebrow">{copy.aboutEyebrow}</p>
              <h2 id="about-title">{copy.aboutTitle}</h2>
            </div>
            <p>{copy.aboutBody}</p>
          </section>

          <section id="contact" className="archive__contact-section" aria-labelledby="contact-title" aria-hidden={worldFocused} inert={worldFocused}>
            <div>
              <p className="archive__eyebrow">{copy.openLine}</p>
              <h2 id="contact-title">{copy.contact}</h2>
            </div>
            <a className="archive__contact-email" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}<span aria-hidden="true">↗</span>
            </a>
            <a className="archive__contact-cta" href={`mailto:${CONTACT_EMAIL}`}>{copy.startConversation}</a>
          </section>

          <footer className="archive__footer" aria-hidden={worldFocused} inert={worldFocused}>
            <span className="archive__footer-note">王心蕊 / Olivia Wong · Four Hearts</span>
            <div className="archive__footer-links">
              <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
              <button type="button" onClick={onClose}>{copy.exploreRoom}</button>
              <button type="button" onClick={() => scrollToSection("top")}>{copy.backToTop}</button>
            </div>
          </footer>
        </div>
      </main>
      {quickReadId && (
        <QuickReadPage
          pageId={quickReadId}
          entries={featuredEntries}
          onBack={onQuickReadClose}
          onNavigate={onQuickReadOpen}
          onProjectOpen={openProject}
        />
      )}
      {selectedProject && (
        <ProjectDetail
          entry={selectedProject}
          detailRef={detailRef}
          onBack={closeProject}
          transition={projectTransition}
          origin={projectOrigin}
        />
      )}
    </>
  );
}
// End of archive view.

