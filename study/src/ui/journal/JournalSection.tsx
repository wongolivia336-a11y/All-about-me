import { useEffect, useState, type CSSProperties } from "react";
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

function PaperBall({ article, index, selected, onSelect }: {
  article: JournalArticle;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { language, copy } = useLanguage();
  const shape = index % 4;
  const title = article.title[language];
  const status = article.status === "source" ? copy.journalSourceLabel : copy.journalEssayLabel;
  const tilt = [-5, 3, 1, -2, 4, -3][index % 6];

  return (
    <li className="journal-paper-slot" data-selected={selected ? "true" : "false"} style={{ "--paper-tilt": `${tilt}deg` } as CSSProperties}>
      <button
        className="journal-paper-slot__button"
        type="button"
        data-journal-entry={article.id}
        aria-pressed={selected}
        aria-controls={selected ? "journal-expanded-paper" : undefined}
        aria-label={`${title}. ${status}. ${selected ? copy.journalPaperSelected : copy.journalPaperOpen}`}
        onClick={onSelect}
      >
        <span className="journal-paper-ball" data-shape={shape} aria-hidden="true">
          <svg viewBox="0 0 160 118" focusable="false">
            <path className="journal-paper-ball__form" d="M26 49 44 27 64 30 76 15 98 24 116 19 131 39 127 57 140 74 122 91 104 91 88 105 66 96 48 102 36 83 21 72Z" />
            <path className="journal-paper-ball__fold" d="m26 49 36 13 14-47M62 62l-14 40m14-40 26 43m-26-43 36-38 7 67m-43-29 52-23 13 35m-65-12-40 10m40-10 60 29m-60-29 4 34" />
            <path className="journal-paper-ball__crease" d="m44 27 18 35 36-38m-36 38 42 29m-42-29 52-23m-52 23 25-47" />
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
  const selected = articles.find((article) => article.id === selectedId) ?? null;
  const publishedCount = articles.filter((article) => article.status === "published").length;

  useEffect(() => {
    if (!active || inactive) setSelectedId(null);
  }, [active, inactive]);

  const selectPaper = (id: string) => setSelectedId((current) => current === id ? null : id);

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

      {articles.length > 0 ? (
        <ol className="journal-paper-stack" aria-label={copy.journalIndex}>
          {articles.map((article, index) => (
            <PaperBall
              key={article.id}
              article={article}
              index={index}
              selected={article.id === selectedId}
              onSelect={() => selectPaper(article.id)}
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
          id="journal-expanded-paper"
          className="journal-expanded-paper"
          data-open="true"
          aria-labelledby="journal-expanded-title"
        >
          <div className="journal-expanded-paper__topline">
            <span>{String(articles.findIndex((article) => article.id === selected.id) + 1).padStart(2, "0")} / {selected.status === "source" ? copy.journalSourceLabel : copy.journalEssayLabel}</span>
            <button type="button" className="journal-expanded-paper__close" onClick={() => setSelectedId(null)}>
              {copy.journalPaperBack}<span aria-hidden="true"> ×</span>
            </button>
          </div>
          <div className="journal-expanded-paper__layout">
            <div className="journal-expanded-paper__object">
              <FeaturedPaper active={active && !inactive} disabled={readerOpen || !active || inactive} />
            </div>
            <div className="journal-expanded-paper__copy">
              <h3 id="journal-expanded-title">{selected.title[language]}</h3>
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