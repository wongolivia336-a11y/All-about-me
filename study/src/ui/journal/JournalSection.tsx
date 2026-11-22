import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import type { JournalArticle } from "../../data/journal";
import { useLanguage } from "../../i18n";
import { FeaturedPaper } from "./FeaturedPaper";
import "./Journal.css";

interface JournalSectionProps {
  articles: readonly JournalArticle[];
  active: boolean;
  readerOpen: boolean;
  inactive: boolean;
  onOpenArticle: (id: string, trigger: HTMLButtonElement) => void;
  onOpenCollect: () => void;
}

const PAPER_SILHOUETTES = [
  "M26 49 44 27 64 30 76 15 98 24 116 19 131 39 127 57 140 74 122 91 104 91 88 105 66 96 48 102 36 83 21 72Z",
  "M24 50 42 29 62 32 78 15 97 23 118 20 132 41 126 59 139 73 120 91 103 94 86 104 65 95 46 103 34 82 20 73Z",
  "M27 48 43 28 66 31 77 14 99 24 116 18 130 40 126 57 141 72 123 90 103 92 87 106 64 95 47 101 35 84 22 71Z",
  "M25 50 45 26 63 31 75 16 97 22 117 20 133 39 126 58 139 75 121 92 104 90 88 104 67 97 48 104 35 83 21 73Z",
] as const;

const PAPER_FACETS = [
  { fill: "#e8ede9", path: "M26 49 44 27 62 62 21 72Z" },
  { fill: "#f7f9f7", path: "M44 27 76 15 62 62Z" },
  { fill: "#e9eeea", path: "M76 15 98 24 62 62Z" },
  { fill: "#f9fbf9", path: "M98 24 116 19 127 57 62 62Z" },
  { fill: "#e5ebe7", path: "M127 57 140 74 104 91 62 62Z" },
  { fill: "#f7f9f7", path: "M62 62 104 91 88 105Z" },
  { fill: "#e9eeea", path: "M62 62 88 105 66 96Z" },
  { fill: "#fbfcfb", path: "M62 62 66 96 48 102 36 83Z" },
  { fill: "#e7ece8", path: "M62 62 36 83 21 72Z" },
] as const;

const PAPER_FOLDS = [
  "m26 49 36 13 14-47M62 62 48 102m14-40 26 43m-26-43 36-38 7 67m-43-29 52-23 13 35m-65-12-40 10m40-10 60 29m-60-29 4 34",
  "m24 50 38 12 16-47M62 62 46 103m16-41 24 42m-24-42 35-39 9 71m-44-32 56-22 12 34m-68-12-41 11m41-11 58 29m-58-29 3 33",
  "m27 48 35 14 15-48M62 62 47 101m15-39 25 44m-25-44 37-38 7 71m-44-33 52-24 14 35m-66-11-40 9m40-9 61 28m-61-28 3 33",
  "m25 50 37 12 13-46M62 62 48 104m14-42 26 42m-26-42 35-40 7 68m-42-28 55-24 13 37m-68-13-40 11m40-11 59 30m-59-30 5 35",
] as const;

const PAPER_RIDGES = [
  "m44 27 18 35 36-38m-36 38 42 29m-42-29 52-23m-52 23 25-47",
  "m42 29 20 33 35-39m-35 39 41 29m-41-29 56-22m-56 22 29-47",
  "m43 28 19 34 37-38m-37 38 41 30m-41-30 52-24m-52 24 15-48",
  "m45 26 17 36 35-40m-35 40 42 28m-42-28 55-24m-55 24 13-46",
] as const;

const PAPER_FIBERS = [
  "m35 42 5 2m19-17 5 2m43 10 5 2m17 26 4 2m-86 13 5 1m44 20 4 2",
  "m31 48 4 2m35-23 5 2m40 13 4 2m15 34 5 1m-82 11 4 2m39 7 5 2",
  "m36 39 5 2m24-14 4 2m42 16 5 1m18 29 4 2m-83 10 5 2m45 11 4 2",
  "m34 47 5 2m24-21 4 2m45 14 5 2m12 31 4 1m-82 8 4 2m41 13 5 2",
] as const;

type BallGesture = { x: number; y: number; rotation: number; held: boolean; released: boolean };

function PaperBall({ article, index, selected, onSelect }: {
  article: JournalArticle;
  index: number;
  selected: boolean;
  onSelect: (trigger: HTMLButtonElement) => void;
}) {
  const { language, copy } = useLanguage();
  const clipId = "journal-paper-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const shape = index % PAPER_SILHOUETTES.length;
  const title = article.title[language];
  const status = article.status === "source" ? copy.journalSourceLabel : copy.journalEssayLabel;
  const tilt = [-5, 3, 1, -2, 4, -3][index % 6];
  const pointerRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [gesture, setGesture] = useState<BallGesture>({ x: 0, y: 0, rotation: 0, held: false, released: false });

  const onPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setGesture((current) => ({ ...current, held: true, released: false }));
  };

  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 7) pointer.moved = true;
    setGesture((current) => ({
      ...current,
      x: Math.max(-15, Math.min(15, dx * 0.48)),
      y: Math.max(-10, Math.min(10, dy * 0.42)),
      rotation: Math.max(-7, Math.min(7, dx * 0.15 - dy * 0.08)),
    }));
  };

  const onPointerEnd = (event: PointerEvent<HTMLSpanElement>, canceled = false) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    if (!canceled && pointer.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 350);
    }
    setGesture({ x: 0, y: 0, rotation: 0, held: false, released: !canceled });
  };

  const style = {
    "--paper-tilt": String(tilt) + "deg",
    "--paper-drag-x": String(gesture.x) + "px",
    "--paper-drag-y": String(gesture.y) + "px",
    "--paper-drag-rotation": String(gesture.rotation) + "deg",
  } as CSSProperties;

  return (
    <li className="journal-paper-slot" data-selected={selected ? "true" : "false"}>
      <button
        className="journal-paper-slot__button"
        type="button"
        data-journal-entry={article.id}
        aria-expanded={selected}
        aria-controls={selected ? "journal-expanded-paper" : undefined}
        aria-describedby="journal-paper-gesture-hint"
        aria-label={title + ". " + status + ". " + (selected ? copy.journalPaperSelected : copy.journalPaperOpen)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            if (event.detail > 0) {
              event.preventDefault();
              return;
            }
          }
          onSelect(event.currentTarget);
        }}
      >
        <span
          className="journal-paper-ball"
          data-shape={shape}
          data-held={gesture.held ? "true" : "false"}
          data-released={gesture.released ? "true" : "false"}
          aria-hidden="true"
          style={style}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={(event) => onPointerEnd(event, true)}
          onLostPointerCapture={(event) => onPointerEnd(event, true)}
        >
          <svg viewBox="0 0 160 118" focusable="false">
            <defs>
              <clipPath id={clipId}>
                <path d={PAPER_SILHOUETTES[shape]} />
              </clipPath>
            </defs>
            <ellipse className="journal-paper-ball__shadow" cx="81" cy="108" rx="43" ry="6" />
            <path className="journal-paper-ball__form" d={PAPER_SILHOUETTES[shape]} />
            <g clipPath={"url(#" + clipId + ")"}>
              {PAPER_FACETS.map((facet, facetIndex) => (
                <path key={facetIndex} d={facet.path} fill={facet.fill} className="journal-paper-ball__facet" />
              ))}
              <path className="journal-paper-ball__fiber" d={PAPER_FIBERS[shape]} />
            </g>
            <path className="journal-paper-ball__fold" d={PAPER_FOLDS[shape]} />
            <path className="journal-paper-ball__ridge" d={PAPER_RIDGES[shape]} />
            <path className="journal-paper-ball__outline" d={PAPER_SILHOUETTES[shape]} />
          </svg>
        </span>
        <span className="journal-paper-slot__meta">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{status}</span>
        </span>
        <strong>{title}</strong>
        <span className="journal-paper-slot__summary">{article.summary[language]}</span>
        <span className="journal-paper-slot__open" aria-hidden="true">
          {selected ? copy.journalPaperSelected : copy.journalPaperOpen}<i>↗</i>
        </span>
      </button>
    </li>
  );
}

export function JournalSection({
  articles,
  active,
  readerOpen,
  inactive,
  onOpenArticle,
  onOpenCollect,
}: JournalSectionProps) {
  const { language, copy } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOrigin, setPreviewOrigin] = useState<{ x: number; y: number } | null>(null);
  const selectedTriggerRef = useRef<HTMLButtonElement | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const expandedTitleRef = useRef<HTMLHeadingElement>(null);
  const selected = articles.find((article) => article.id === selectedId) ?? null;
  const publishedCount = articles.filter((article) => article.status === "published").length;

  useEffect(() => {
    if (!active || inactive) {
      setSelectedId(null);
      setPreviewOrigin(null);
    }
  }, [active, inactive]);

  useLayoutEffect(() => {
    if (!selected) return;
    const panel = expandedRef.current;
    const trigger = selectedTriggerRef.current;
    if (!panel) return;
    if (trigger) {
      const origin = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      setPreviewOrigin({
        x: origin.left + origin.width / 2 - panelRect.left,
        y: origin.top + origin.height * 0.36 - panelRect.top,
      });
    }
    const frame = window.requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.76 || rect.bottom < 72) {
        panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
      }
      expandedTitleRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selected]);

  const selectPaper = (id: string, trigger: HTMLButtonElement) => {
    if (id === selectedId) {
      setSelectedId(null);
      return;
    }
    selectedTriggerRef.current = trigger;
    setPreviewOrigin(null);
    setSelectedId(id);
  };

  const closePaper = () => {
    const trigger = selectedTriggerRef.current;
    setSelectedId(null);
    window.requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
  };

  const expandedStyle = previewOrigin
    ? ({
        "--journal-unfold-x": String(previewOrigin.x) + "px",
        "--journal-unfold-y": String(previewOrigin.y) + "px",
      } as CSSProperties)
    : undefined;

  return (
    <section
      id="journal"
      className="journal-index"
      aria-labelledby="journal-title"
      aria-hidden={!active || inactive}
      inert={!active || inactive}
    >
      <div className="journal-index__heading">
        <div>
          <p className="archive__eyebrow">{copy.journalEyebrow}</p>
          <h2 id="journal-title" tabIndex={-1}>{copy.journalTitle}</h2>
        </div>
        <p>{copy.journalDescription}</p>
      </div>

      <div className="journal-index__index-heading">
        <span>{copy.journalIndex}</span>
        <span>{copy.journalPublishedCount}: {String(publishedCount).padStart(2, "0")} / {String(articles.length).padStart(2, "0")}</span>
      </div>
      <p id="journal-paper-gesture-hint" className="journal-index__gesture-hint"><span aria-hidden="true">↔</span>{copy.journalBallHint}</p>

      {articles.length > 0 ? (
        <ol className="journal-paper-stack" aria-label={copy.journalIndex}>
          {articles.map((article, index) => (
            <PaperBall
              key={article.id}
              article={article}
              index={index}
              selected={article.id === selectedId}
              onSelect={(trigger) => selectPaper(article.id, trigger)}
            />
          ))}
        </ol>
      ) : (
        <div className="journal-index__empty">
          <span aria-hidden="true">—</span>
          <p>{copy.journalNoEntries}</p>
        </div>
      )}

      {selected && (
        <div
          key={selected.id}
          ref={expandedRef}
          id="journal-expanded-paper"
          className="journal-expanded-paper"
          data-open="true"
          role="region"
          aria-labelledby="journal-expanded-title"
          style={expandedStyle}
        >
          <div className="journal-expanded-paper__topline">
            <span>{String(articles.findIndex((article) => article.id === selected.id) + 1).padStart(2, "0")} / {selected.status === "source" ? copy.journalSourceLabel : copy.journalEssayLabel}</span>
            <button type="button" className="journal-expanded-paper__close" onClick={closePaper}>
              {copy.journalPaperBack}<span aria-hidden="true"> ×</span>
            </button>
          </div>
          <div className="journal-expanded-paper__layout">
            <div className="journal-expanded-paper__object">
              <FeaturedPaper active={active && !inactive} disabled={readerOpen || !active || inactive} />
            </div>
            <div className="journal-expanded-paper__copy">
              <p className="journal-expanded-paper__meta">
                {selected.dateLabel?.[language] ?? selected.date ?? selected.topics[language].slice(0, 2).join(" · ")}
              </p>
              <h3 id="journal-expanded-title" ref={expandedTitleRef} tabIndex={-1}>{selected.title[language]}</h3>
              <p>{selected.summary[language]}</p>
              {selected.status === "source" && <p className="journal-expanded-paper__pending">{copy.journalArticlePending}</p>}
              <button
                className="journal-index__read"
                type="button"
                data-journal-entry={selected.id}
                disabled={readerOpen}
                onClick={(event) => onOpenArticle(selected.id, event.currentTarget)}
              >
                {copy.journalRead}<span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="journal-index__collect" type="button" onClick={onOpenCollect}>
        {copy.journalCollectLink}<span aria-hidden="true">↗</span>
      </button>
    </section>
  );
}