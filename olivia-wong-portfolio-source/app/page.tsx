"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type DesignOrder,
  type PortfolioProject,
  orderMeta,
  projects,
} from "./data/projects";

type Filter = "all" | DesignOrder;
type ViewMode = "field" | "list";

const orderKeys = Object.keys(orderMeta) as DesignOrder[];

function Crosshair({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`crosshair ${className}`} />;
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: PortfolioProject;
  onOpen: (project: PortfolioProject) => void;
}) {
  const order = orderMeta[project.order];

  return (
    <article
      className={`project-card project-card--${project.size} tone-${project.tone}`}
    >
      <button
        className="project-card__button"
        onClick={() => onOpen(project)}
        aria-label={`Open project: ${project.title}`}
      >
        <span className="project-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover}
            alt=""
            style={{ objectPosition: project.crop }}
          />
          <span className="project-card__scan" aria-hidden="true" />
          <span className="project-card__mark" aria-hidden="true">
            ↗
          </span>
          <span className="project-card__axis" aria-hidden="true">
            X&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y
          </span>
        </span>

        <span className="project-card__meta">
          <span className="project-card__index">{project.index}</span>
          <span>
            <strong>{project.title}</strong>
            <small>{project.titleZh}</small>
          </span>
          <span className="project-card__order">
            {order.number} / {order.label}
          </span>
          <span className="project-card__year">{project.year}</span>
        </span>
      </button>
    </article>
  );
}

function ProjectDossier({
  project,
  onClose,
  onStep,
}: {
  project: PortfolioProject;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
}) {
  const order = orderMeta[project.order];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose, onStep]);

  return (
    <div className="dossier" role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="dossier__ink" aria-hidden="true" />
      <header className="dossier__header">
        <span>PROJECT DOSSIER / {project.index}</span>
        <span className="dossier__coords">31°13′52.0″N · 121°28′14.2″E</span>
        <button onClick={onClose} autoFocus>
          Close [ESC]
        </button>
      </header>

      <div className="dossier__body">
        <div className="dossier__visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover}
            alt={`Material study for ${project.title}`}
            style={{ objectPosition: project.crop }}
          />
          <Crosshair className="dossier__cross dossier__cross--one" />
          <Crosshair className="dossier__cross dossier__cross--two" />
          <span className="dossier__visual-label">FIELD RECORD / {project.year}</span>
        </div>

        <div className="dossier__content">
          <p className="dossier__order">
            {order.number} — {order.label} / {order.short}
          </p>
          <h2>{project.title}</h2>
          <p className="dossier__zh">{project.titleZh}</p>
          <p className="dossier__summary">{project.summary}</p>
          <p className="dossier__statement">{project.statement}</p>

          <dl className="dossier__facts">
            <div>
              <dt>Practice</dt>
              <dd>{project.discipline}</dd>
            </div>
            <div>
              <dt>Site</dt>
              <dd>{project.location}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{project.duration}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
          </dl>
        </div>
      </div>

      <footer className="dossier__footer">
        <button onClick={() => onStep(-1)}>← Previous condition</button>
        <span>{project.index} / {String(projects.length).padStart(3, "0")}</span>
        <button onClick={() => onStep(1)}>Next condition →</button>
      </footer>
    </div>
  );
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<ViewMode>("field");
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const [clock, setClock] = useState("00:00:00");
  const [objectTilt, setObjectTilt] = useState({ x: -4, y: 7 });
  const dragOrigin = useRef<{ x: number; y: number; tiltX: number; tiltY: number }>();
  const pageRef = useRef<HTMLElement>(null);

  const visibleProjects = useMemo(
    () => projects.filter((project) => filter === "all" || project.order === filter),
    [filter],
  );

  useEffect(() => {
    const root = document.documentElement;
    const updatePointer = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
      root.style.setProperty("--pointer-nx", `${event.clientX / window.innerWidth - 0.5}`);
      root.style.setProperty("--pointer-ny", `${event.clientY / window.innerHeight - 0.5}`);
    };
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll", `${max > 0 ? window.scrollY / max : 0}`);
    };
    const updateClock = () => {
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Shanghai",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    updateScroll();
    updateClock();
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    const timer = window.setInterval(updateClock, 1000);
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
      window.clearInterval(timer);
    };
  }, []);

  const enterIndex = (nextFilter: Filter = "all") => {
    setFilter(nextFilter);
    document.getElementById("index")?.scrollIntoView({ behavior: "smooth" });
  };

  const startObjectDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      tiltX: objectTilt.x,
      tiltY: objectTilt.y,
    };
    event.currentTarget.dataset.dragging = "true";
  };

  const moveObject = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragOrigin.current) return;
    setObjectTilt({
      x: Math.max(-18, Math.min(18, dragOrigin.current.tiltX - (event.clientY - dragOrigin.current.y) * 0.05)),
      y: dragOrigin.current.tiltY + (event.clientX - dragOrigin.current.x) * 0.08,
    });
  };

  const endObjectDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragOrigin.current = undefined;
    delete event.currentTarget.dataset.dragging;
  };

  const stepProject = (direction: 1 | -1) => {
    if (!selected) return;
    const currentIndex = projects.findIndex((project) => project.id === selected.id);
    const nextIndex = (currentIndex + direction + projects.length) % projects.length;
    setSelected(projects[nextIndex]);
  };

  return (
    <main ref={pageRef} className="site-shell">
      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>
      <div className="cursor" aria-hidden="true">
        <span />
      </div>

      <header className="masthead">
        <a className="identity" href="#top" aria-label="Olivia Wong home">
          <span>OLIVIA WONG</span>
        </a>
        <p className="masthead__role">Independent Designer · Shanghai / Tokyo</p>
        <div className="masthead__status">
          <i /> Available for selected collaborations
        </div>
        <div className="masthead__issue">Selected work 2021—2026 / Issue 04</div>
      </header>

      <section className="hero" id="top">
        <div className="hero__grid" aria-hidden="true" />
        <Crosshair className="hero__cross hero__cross--one" />
        <Crosshair className="hero__cross hero__cross--two" />
        <p className="hero__coordinates">
          31.2304° N&nbsp;&nbsp;121.4737° E<br />
          35.6762° N&nbsp;&nbsp;139.6503° E
        </p>

        <h1 className="hero__title" aria-label="I design the conditions for things to happen">
          <span className="hero__line hero__line--one">I DESIGN</span>
          <span className="hero__line hero__line--two">THE <em>CONDITIONS</em></span>
          <span className="hero__line hero__line--three">FOR THINGS</span>
          <span className="hero__line hero__line--four">TO HAPPEN.</span>
        </h1>

        <button
          className="hero-object"
          onPointerDown={startObjectDrag}
          onPointerMove={moveObject}
          onPointerUp={endObjectDrag}
          onPointerCancel={endObjectDrag}
          style={
            {
              "--tilt-x": `${objectTilt.x}deg`,
              "--tilt-y": `${objectTilt.y}deg`,
            } as CSSProperties
          }
          aria-label="Drag to rotate the four-order object"
        >
          <span className="hero-object__orbit hero-object__orbit--one" aria-hidden="true" />
          <span className="hero-object__orbit hero-object__orbit--two" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/work/hero-object.png" alt="Abstract construction representing four orders of design" draggable="false" />
          <span className="hero-object__instruction">DRAG<br />TO<br />ROTATE</span>
          <span className="hero-object__node hero-object__node--one">01</span>
          <span className="hero-object__node hero-object__node--two">02</span>
          <span className="hero-object__node hero-object__node--three">03</span>
          <span className="hero-object__node hero-object__node--four">04</span>
        </button>

        <div className="orders-rail" aria-label="The four orders of design">
          {orderKeys.map((key) => {
            const order = orderMeta[key];
            return (
              <button key={key} onClick={() => enterIndex(key)}>
                <span className="orders-rail__number">{order.number}</span>
                <span>
                  <b>{order.label}</b>
                  <small>{order.short}</small>
                </span>
                <span className="orders-rail__arrow">↘</span>
              </button>
            );
          })}
        </div>

        <button className="enter-index" onClick={() => enterIndex()}>
          <span>Enter the index ↘</span>
          <i aria-hidden="true" />
        </button>

        <div className="hero__calibration" aria-hidden="true">
          <span>Signal level</span>
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
          <strong>100%</strong>
        </div>
      </section>

      <section className="gallery" id="index">
        <header className="section-heading">
          <div className="section-heading__index">
            <span>INDEX</span>
            <strong>08</strong>
            <small>conditions documented</small>
          </div>
          <h2>
            Selected <em>/</em>
            <br />Work
          </h2>
          <p>
            Not a collection of answers. A field record of symbols, things,
            interactions and contexts tested in public.
          </p>
          <div className="view-switch" aria-label="Gallery view">
            <button className={view === "field" ? "is-active" : ""} onClick={() => setView("field")}>
              Field <span>⊞</span>
            </button>
            <button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}>
              Index <span>≡</span>
            </button>
          </div>
        </header>

        <nav className="filters" aria-label="Filter projects">
          <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>
            <span>00</span> All conditions <sup>{String(projects.length).padStart(2, "0")}</sup>
          </button>
          {orderKeys.map((key) => (
            <button
              key={key}
              className={filter === key ? "is-active" : ""}
              onClick={() => setFilter(key)}
            >
              <span>{orderMeta[key].number}</span> {orderMeta[key].label}
              <sup>{String(projects.filter((project) => project.order === key).length).padStart(2, "0")}</sup>
            </button>
          ))}
        </nav>

        <div className="filter-readout" aria-live="polite">
          <span>SHOWING / {filter === "all" ? "ALL CONDITIONS" : orderMeta[filter].label.toUpperCase()}</span>
          <span>{String(visibleProjects.length).padStart(2, "0")} RECORDS</span>
        </div>

        {view === "field" ? (
          <div className="project-field">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={setSelected} />
            ))}
          </div>
        ) : (
          <div className="project-list">
            <div className="project-list__header">
              <span>No.</span><span>Project / 项目</span><span>Order</span><span>Practice</span><span>Year</span><span />
            </div>
            {visibleProjects.map((project) => (
              <button key={project.id} onClick={() => setSelected(project)}>
                <span>{project.index}</span>
                <span><strong>{project.title}</strong><small>{project.titleZh}</small></span>
                <span>{orderMeta[project.order].number} / {orderMeta[project.order].short}</span>
                <span>{project.discipline}</span>
                <span>{project.year}</span>
                <span>↗</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="orders-map" id="method">
        <div className="orders-map__intro">
          <span className="vertical-note">BUCHANAN / FOUR ORDERS / RECOMPOSED</span>
          <p className="eyebrow">Scale is not hierarchy</p>
          <h2>FROM MARK<br />TO <em>WORLD.</em></h2>
          <p className="orders-map__lede">
            Design expands outward. A sign lives inside an object; an object
            scripts an action; an action reinforces a system. Every project is
            all four—one order simply bears more weight.
          </p>
        </div>

        <ol className="orders-map__list">
          {orderKeys.map((key, index) => {
            const order = orderMeta[key];
            return (
              <li key={key} style={{ "--order": index } as CSSProperties}>
                <span>{order.number}</span>
                <div>
                  <small>{order.short}</small>
                  <h3>{order.label}</h3>
                  <p>{order.premise}</p>
                </div>
                <i aria-hidden="true" />
              </li>
            );
          })}
        </ol>
        <div className="orders-map__loop" aria-hidden="true">
          <span>MEANING</span><span>MATTER</span><span>TIME</span><span>CONTEXT</span>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer__topline">
          <span>NEW COMMISSIONS / RESEARCH / CONVERSATION</span>
          <span>SHANGHAI {clock} CST</span>
        </div>
        <p className="footer__prompt">HAVE A CONDITION<br />WORTH <em>CHANGING?</em></p>
        <a className="footer__email" href="mailto:wongolivia336@gmail.com">
          wongolivia336@gmail.com <span>↗</span>
        </a>
        <div className="footer__base">
          <span>OLIVIA WONG © 2026</span>
          <span>DESIGN IS A VERB WITH CONSEQUENCES.</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to signal ↑</button>
        </div>
      </footer>

      {selected && (
        <ProjectDossier project={selected} onClose={() => setSelected(null)} onStep={stepProject} />
      )}
    </main>
  );
}
