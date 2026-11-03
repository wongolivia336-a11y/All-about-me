import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  library,
  type ArchiveEntry,
  type ThemeId,
} from "../data/library";
import { CONTACT_EMAIL, GITHUB_USER } from "../data/links";
import { themeConfig } from "../data/themeConfig";
import { Heartwheel } from "../brand/Heartwheel";
import { PaperCorner } from "./PaperCorner";

interface ArchiveProps {
  initialTheme: ThemeId;
  showThemeArchive: boolean;
  projectId?: string;
  onClose: () => void;
  onThemeChange: (theme: ThemeId, showAll?: boolean) => void;
  onProjectOpen: (entry: ArchiveEntry) => void;
}
const visibleEntries = library.filter(
  (entry) => entry.status === "published" || entry.status === "prototype",
);

const featuredEntries = visibleEntries
  .filter((entry) => entry.featured)
  .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));

function ProjectCard({ entry, onOpen, compact = false }: { entry: ArchiveEntry; onOpen: () => void; compact?: boolean }) {
  const definition = themeConfig[entry.primaryTheme];
  const style = {
    "--card-accent": definition.accent,
    "--card-ink": definition.ink,
  } as CSSProperties;

  return (
    <article className={["project-card", compact && "project-card--compact"].filter(Boolean).join(" ")} style={style}>
      <button className="project-card__open" type="button" onClick={onOpen}>
        <span className="project-card__visual">
          {entry.cover ? (
            <img src={entry.cover} alt="" width="3368" height="1190" loading="lazy" decoding="async" />
          ) : (
            <span className="project-card__fallback" aria-label="暂无公开封面">
              <span>{definition.label}</span>
              <small>No public cover yet</small>
            </span>
          )}
          <span className="project-card__number">{String(entry.featuredOrder ?? 0).padStart(2, "0")}</span>
        </span>
        <span className="project-card__body">
          <span className="project-card__meta">
            <span>{definition.label}</span>
            <span>{entry.year}</span>
            {entry.status !== "published" && <span>{entry.status}</span>}
          </span>
          <strong>{entry.title}</strong>
          <span>{entry.summary}</span>
        </span>
      </button>
      <div className="project-card__tags" aria-label={`${entry.title} 标签`}>
        {entry.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}
function ProjectDetail({ entry, onBack }: { entry: ArchiveEntry; onBack: () => void }) {
  const definition = themeConfig[entry.primaryTheme];
  return (
    <section
      id="theme-panel"
      className="archive__project-detail"
      role="tabpanel"
      tabIndex={-1}
      aria-labelledby="project-detail-title"
      style={{ "--detail-accent": definition.accent, "--detail-ink": definition.ink } as CSSProperties}
    >
      <button className="archive__back" type="button" onClick={onBack}>
        ← Back to archive
      </button>
      <div className="archive__project-grid">
        <div>
          <p className="archive__eyebrow">{definition.label} / {entry.type}</p>
          <h2 id="project-detail-title">{entry.title}</h2>
          <p className="archive__project-summary">{entry.summary}</p>
          <div className="archive__project-meta">
            <span>{entry.year}</span>
            <span>{definition.shortLabel}</span>
            <span>{entry.status}</span>
          </div>
          <p className="archive__project-note">
            {entry.links.length > 0
              ? "This entry only publishes material that is currently verified. Follow the project link for the live work; a fuller case study will appear here when the evidence is ready."
              : "This is an internal archive entry, not a finished public page. The public catalogue and cover selection will be added when the collection is ready."}
          </p>
          <div className="archive__project-links">
            {entry.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
        {entry.cover ? (
          <img className="archive__project-cover" src={entry.cover} alt={`${entry.title} project cover`} width="3368" height="1190" />
        ) : (
          <div className="archive__project-cover archive__project-cover--empty" aria-label="暂无公开封面">
            <span>{definition.label}</span>
            <small>No public cover yet</small>
          </div>
        )}
      </div>
    </section>
  );
}

export function Archive({ initialTheme, showThemeArchive, projectId, onClose, onThemeChange, onProjectOpen }: ArchiveProps) {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(initialTheme);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const projectReturnFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setActiveTheme(initialTheme), [initialTheme]);
  useEffect(() => setSelectedProjectId(projectId), [projectId]);

  const currentDefinition = themeConfig[activeTheme];
  const themeEntries = useMemo(
    () => visibleEntries.filter((entry) => entry.primaryTheme === activeTheme),
    [activeTheme],
  );
  const selectedProject = selectedProjectId
    ? visibleEntries.find((entry) => entry.id === selectedProjectId)
    : undefined;

  const selectTheme = (theme: ThemeId) => {
    setActiveTheme(theme);
    setSelectedProjectId(undefined);
    onThemeChange(theme, false);
  };

  const openProject = (entry: ArchiveEntry) => {
    projectReturnFocus.current = document.activeElement instanceof HTMLButtonElement
      ? document.activeElement
      : null;
    setActiveTheme(entry.primaryTheme);
    setSelectedProjectId(entry.id);
    onProjectOpen(entry);
  };

  const closeProject = () => {
    setSelectedProjectId(undefined);
    onThemeChange(activeTheme, false);
    requestAnimationFrame(() => projectReturnFocus.current?.focus());
  };

  return (
    <main className="archive" aria-label="Olivia Wong / Four Hearts personal archive">
      <div className="archive__shell">
        <header className="archive__bar">
          <div className="archive__identity-lockup">
            <span className="archive__monogram">FOUR HEARTS / 01</span>
            <span className="archive__name">王心蕊</span>
            <span className="archive__name-en">Olivia Wong</span>
          </div>
          <div className="archive__bar-links">
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </div>
        </header>

        <PaperCorner
          className="page-corner--index"
          label="Room"
          ariaLabel="Enter Room"
          title="Enter Room"
          onClick={onClose}
        />

        <section className="archive__hero" aria-labelledby="archive-title">
          <div className="archive__identity">
            <p className="archive__eyebrow">Design engineer / AI products / creative technology</p>
            <h1 id="archive-title">A living archive of things I build, question, play with, and keep.</h1>
            <p className="archive__lede">
              I make human-centred tools and interactive systems for ideas that are still becoming.
            </p>
            <div className="archive__hero-actions">
              <button type="button" onClick={() => document.getElementById("selected-works")?.scrollIntoView({ behavior: "smooth" })}>
                See selected work ↓
              </button>
              <a href={`mailto:${CONTACT_EMAIL}`}>Start a conversation ↗</a>
            </div>
            <div className="archive__facts" aria-label="Olivia Wong 专业方向">
              <span>AI products</span>
              <span>Interaction design</span>
              <span>Human-centred systems</span>
            </div>
          </div>
          <div className="archive__wheel-wrap">
            <Heartwheel activeTheme={activeTheme} onThemeChange={selectTheme} />
          </div>
        </section>

        {selectedProject ? (
          <ProjectDetail entry={selectedProject} onBack={closeProject} />
        ) : (
          <section
            id="theme-panel"
            className="archive__theme-section"
            role="tabpanel"
            tabIndex={-1}
            aria-labelledby="theme-title"
          >
            <div className="archive__section-heading">
              <div>
                <p className="archive__eyebrow">{showThemeArchive ? "Theme archive" : "The archive"} / {currentDefinition.label}</p>
                <h2 id="theme-title">{currentDefinition.shortLabel}</h2>
              </div>
              <p>{currentDefinition.description}</p>
            </div>

            <div
              className="theme-preview"
              style={{ "--theme-accent": currentDefinition.accent, "--theme-ink": currentDefinition.ink } as CSSProperties}
            >
              <div className="theme-preview__intro">
                <span className="theme-preview__index">0{themeConfig[activeTheme].id === "keep" ? 4 : themeConfig[activeTheme].id === "play" ? 3 : themeConfig[activeTheme].id === "question" ? 2 : 1}</span>
                <p>{currentDefinition.verb}</p>
                <button type="button" onClick={() => onThemeChange(activeTheme, !showThemeArchive)}>
                  {showThemeArchive ? "← Back to Index" : `View all ${currentDefinition.label} ↗`}
                </button>
              </div>
              {themeEntries.length > 0 ? (
                <div className="theme-preview__entries">
                  {(showThemeArchive ? themeEntries : themeEntries.slice(0, 2)).map((entry) => (
                    <ProjectCard key={entry.id} entry={entry} compact onOpen={() => openProject(entry)} />
                  ))}
                </div>
              ) : (
                <div className="theme-preview__empty">
                    <strong>No entries here yet.</strong>
                    <p>I would rather leave this shelf open than invent a collection.</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section id="selected-works" className="archive__selected" aria-labelledby="selected-title">
          <div className="archive__section-heading">
            <div>
              <p className="archive__eyebrow">A cross-section of the practice</p>
              <h2 id="selected-title">Selected works</h2>
            </div>
            <p>Three starting points across product, inquiry and interaction.</p>
          </div>
          <div className="selected-grid">
            {featuredEntries.map((entry) => (
              <ProjectCard key={entry.id} entry={entry} onOpen={() => openProject(entry)} />
            ))}
          </div>
        </section>

        <section className="archive__about" aria-labelledby="about-title">
          <div>
            <p className="archive__eyebrow">A note from the studio</p>
            <h2 id="about-title">Technical work, with attention to how it feels to be inside.</h2>
          </div>
          <p>
            I work where interaction, systems and human attention meet. The work can be technical, but it starts with noticing what people need to feel understood.
          </p>
        </section>

        <footer className="archive__footer">
          <div>
            <span className="archive__eyebrow">Open line</span>
            <a className="archive__contact" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <div className="archive__footer-links">
            <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">GitHub ↗</a>
            <button type="button" onClick={onClose}>Explore Room ↗</button>
          </div>
          <span className="archive__footer-note">王心蕊 / Olivia Wong · Four Hearts</span>
        </footer>
      </div>
    </main>
  );
}
// End of archive view.
