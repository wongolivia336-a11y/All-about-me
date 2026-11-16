import { useRef, useState, type ReactNode } from "react";
import "./QuickRead.css";
import { useLanguage } from "../i18n";
import type { QuickReadPageId } from "../data/quickRead";
import { MetalPass } from "./MetalPass";

interface QuickReadProps {
  active: boolean;
  onOpenPage: (pageId: QuickReadPageId) => void;
}

function PhysicalCard({ active, className, accent, onActivate, children }: {
  active: boolean;
  className: string;
  accent: string;
  onActivate: () => void;
  children: ReactNode;
}) {
  return (
    <MetalPass active={active} accent={accent} className={className} onActivate={onActivate}>
      {children}
    </MetalPass>
  );
}

export function QuickRead({ active, onOpenPage }: QuickReadProps) {
  const { copy } = useLanguage();
  const [deckTurn, setDeckTurn] = useState(0);
  const deckDragStart = useRef<{ pointerId: number; x: number; y: number } | null>(null);
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
      data-active={active ? "true" : "false"}
    >
      <div className="archive__resume-heading quick-read__heading">
        <p className="archive__eyebrow">{copy.resumeEyebrow}</p>
        <h2 id="resume-title">{copy.resumeTitle}</h2>
      </div>

      <div className="archive__resume-grid quick-read__grid">
        <PhysicalCard active={active} className="quick-read__card--badge" accent="#F5DED8" onActivate={() => onOpenPage("experience")}>
          <div className="quick-read__artifact quick-read__artifact--badge" aria-hidden="true">
            <span className="quick-read__artifact-index">FIELD NOTE / 01</span>
            <img src="/visuals/quick-read/experience/bioaz-workflow.png" alt="" loading="lazy" decoding="async" />
            <span className="quick-read__artifact-caption">BIOAZ · PRODUCT PRACTICE</span>
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

        <PhysicalCard active={active} className="quick-read__card--research" accent="#DAEBF5" onActivate={() => onOpenPage("education")}>
          <div className="quick-read__artifact quick-read__artifact--research" aria-hidden="true">
            <span className="quick-read__artifact-index">STUDY FILE / 02</span>
            <img src="/visuals/quick-read/education/ai-data-design.png" alt="" loading="lazy" decoding="async" />
            <span className="quick-read__artifact-caption">TONGJI · AI &amp; DATA DESIGN</span>
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

        <PhysicalCard active={active} className="quick-read__card--work" accent="#D8EDE1" onActivate={() => onOpenPage("work")}>
          <button
            className="quick-read__artifact quick-read__artifact--work"
            type="button"
            aria-label={`${copy.selectedWorkLabel}: ${copy.browseSelectedWork}. ${deckNumber(0)} / 03`}
            data-turn={deckTurn}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              deckDragStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
              if (event.pointerType === "mouse") event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const start = deckDragStart.current;
              if (!start || start.pointerId !== event.pointerId || event.pointerType === "mouse") return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) && !event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.setPointerCapture(event.pointerId);
              }
            }}
            onPointerUp={(event) => {
              const start = deckDragStart.current;
              deckDragStart.current = null;
              if (!start || start.pointerId !== event.pointerId) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy)) {
                suppressDeckClick.current = true;
                turnDeck();
                window.setTimeout(() => { suppressDeckClick.current = false; }, 0);
              }
            }}
            onPointerCancel={() => { deckDragStart.current = null; }}
            onLostPointerCapture={() => { deckDragStart.current = null; }}
            onClick={() => {
              if (suppressDeckClick.current) return;
              onOpenPage("work");
            }}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              turnDeck();
            }}
          >
            <img className="quick-read__work-image quick-read__work-image--1" src="/visuals/quick-read/work/bioaz-agent-workbench.png" alt="" draggable={false} loading="lazy" decoding="async" />
            <img className="quick-read__work-image quick-read__work-image--2" src="/visuals/quick-read/work/knock-knock-care.png" alt="" draggable={false} loading="lazy" decoding="async" />
            <img className="quick-read__work-image quick-read__work-image--3" src="/visuals/quick-read/work/qiaopi-letter-routes.png" alt="" draggable={false} loading="lazy" decoding="async" />
            <span className="quick-read__artifact-index">SELECTED / {deckNumber(0)}</span>
            <span className="quick-read__artifact-caption">THREE PROJECT STORIES</span>
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
