import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import "./QuickRead.css";
import { useLanguage } from "../i18n";
import type { QuickReadPageId } from "../data/quickRead";

interface QuickReadProps {
  active: boolean;
  onOpenPage: (pageId: QuickReadPageId) => void;
}

function PhysicalCard({ className, accent, onActivate, children }: {
  className: string;
  accent: string;
  onActivate: () => void;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const resetTilt = (element: HTMLElement) => {
    element.style.setProperty("--card-rotate-x", "0deg");
    element.style.setProperty("--card-rotate-y", "0deg");
    element.style.setProperty("--card-lift", "0px");
    element.style.setProperty("--card-press", "1");
    element.style.setProperty("--card-shadow-x", "0px");
    element.style.setProperty("--glare-x", "50%");
    element.style.setProperty("--glare-y", "24%");
  };
  const trackPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
    card.style.setProperty("--card-rotate-x", `${-y * 4.2}deg`);
    card.style.setProperty("--card-rotate-y", `${x * 5.2}deg`);
    card.style.setProperty("--card-lift", "-5px");
    card.style.setProperty("--card-shadow-x", `${-x * 7}px`);
    card.style.setProperty("--glare-x", `${50 + x * 42}%`);
    card.style.setProperty("--glare-y", `${24 + y * 34}%`);
  };
  const setPress = (event: ReactPointerEvent<HTMLElement>, value: string) => {
    event.currentTarget.style.setProperty("--card-press", value);
  };

  return (
    <article
      ref={cardRef}
      className={["quick-read__card", className].join(" ")}
      style={{ "--card-accent": accent } as CSSProperties}
      onPointerMove={trackPointer}
      onPointerLeave={(event) => resetTilt(event.currentTarget)}
      onPointerDown={(event) => setPress(event, ".986")}
      onPointerUp={(event) => setPress(event, "1")}
      onPointerCancel={(event) => resetTilt(event.currentTarget)}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
        onActivate();
      }}
    >
      {children}
    </article>
  );
}

export function QuickRead({ active, onOpenPage }: QuickReadProps) {
  const { copy } = useLanguage();
  const [deckTurn, setDeckTurn] = useState(0);
  const deckDragStart = useRef<number | null>(null);
  const suppressDeckClick = useRef(false);
  const turnDeck = () => setDeckTurn((turn) => (turn + 1) % 3);
  const deckNumber = (offset: number) => String(((deckTurn + offset) % 3) + 1).padStart(2, "0");

  return (
    <section
      id="resume"
      className="archive__resume quick-read"
      aria-labelledby="resume-title"
      aria-hidden={!active}
      inert={!active}
    >
      <div className="archive__resume-heading">
        <p className="archive__eyebrow">{copy.resumeEyebrow}</p>
        <h2 id="resume-title">{copy.resumeTitle}</h2>
      </div>

      <div className="archive__resume-grid quick-read__grid">
        <PhysicalCard className="quick-read__card--badge" accent="#b68285" onActivate={() => onOpenPage("experience")}>
          <div className="quick-read__artifact quick-read__artifact--badge" aria-hidden="true">
            <span className="quick-read__strap" />
            <span className="quick-read__badge-clip" />
            <span className="quick-read__badge-face">
              <span className="quick-read__badge-topline">FOUR HEARTS <i>01</i></span>
              <span className="quick-read__badge-monogram">OW</span>
              <span className="quick-read__badge-name">OLIVIA WONG</span>
              <span className="quick-read__badge-role">{copy.experienceLabel}</span>
            </span>
            <span className="quick-read__badge-shine" />
          </div>
          <div className="quick-read__content">
            <p className="archive__eyebrow"><span>{copy.experienceLabel}</span><span>01 / 03</span></p>
            <h3>{copy.experienceTitle}</h3>
            <p className="quick-read__summary">{copy.experienceBody}</p>
            <button
              className="quick-read__action"
              type="button"
              onClick={() => onOpenPage("experience")}
            >
              <span>{copy.openExperience}</span><span aria-hidden="true">↗</span>
            </button>
          </div>
        </PhysicalCard>

        <PhysicalCard className="quick-read__card--research" accent="#748f9b" onActivate={() => onOpenPage("education")}>
          <div className="quick-read__artifact quick-read__artifact--research" aria-hidden="true">
            <span className="quick-read__paper quick-read__paper--back" />
            <span className="quick-read__paper quick-read__paper--middle" />
            <span className="quick-read__paper quick-read__paper--front">
              <span className="quick-read__paper-index">02 <i>·</i> {copy.educationLabel}</span>
              <span className="quick-read__paper-rule" />
              <span className="quick-read__paper-lines" />
              <span className="quick-read__paper-mark">§</span>
            </span>
            <span className="quick-read__paper-tab" />
          </div>
          <div className="quick-read__content">
            <p className="archive__eyebrow"><span>{copy.educationLabel}</span><span>02 / 03</span></p>
            <h3>{copy.educationTitle}</h3>
            <p className="quick-read__summary">{copy.educationBody}</p>
            <button
              className="quick-read__action"
              type="button"
              onClick={() => onOpenPage("education")}
            >
              <span>{copy.openEducation}</span><span aria-hidden="true">↗</span>
            </button>
          </div>
        </PhysicalCard>

        <PhysicalCard className="quick-read__card--work" accent="#879c91" onActivate={() => onOpenPage("work")}>
          <button
            className="quick-read__artifact quick-read__artifact--work"
            type="button"
            aria-label={`${copy.selectedWorkLabel}: ${copy.browseSelectedWork}`}
            data-turn={deckTurn}
            onPointerDown={(event) => {
              deckDragStart.current = event.clientX;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerUp={(event) => {
              if (deckDragStart.current === null) return;
              const moved = Math.abs(event.clientX - deckDragStart.current) > 20;
              deckDragStart.current = null;
              if (moved) {
                suppressDeckClick.current = true;
                turnDeck();
                window.requestAnimationFrame(() => { suppressDeckClick.current = false; });
              }
            }}
            onPointerCancel={() => { deckDragStart.current = null; }}
            onClick={() => {
              if (suppressDeckClick.current) return;
              onOpenPage("work");
            }}
          >
            <span className="quick-read__deck quick-read__deck--back"><i>{deckNumber(2)}</i></span>
            <span className="quick-read__deck quick-read__deck--middle"><i>{deckNumber(1)}</i></span>
            <span className="quick-read__deck quick-read__deck--front">
              <i>{deckNumber(0)}</i>
              <span className="quick-read__deck-lines" />
              <span className="quick-read__deck-stamp">A—B—C</span>
            </span>
          </button>
          <div className="quick-read__content">
            <p className="archive__eyebrow"><span>{copy.selectedWorkLabel}</span><span>03 / 03</span></p>
            <h3>{copy.selectedWorkTitle}</h3>
            <p className="quick-read__summary">{copy.selectedWorkBody}</p>
            <button className="quick-read__action" type="button" onClick={() => onOpenPage("work")}>
              <span>{copy.browseSelectedWork}</span><span aria-hidden="true">↗</span>
            </button>
          </div>
        </PhysicalCard>
      </div>
    </section>
  );
}
