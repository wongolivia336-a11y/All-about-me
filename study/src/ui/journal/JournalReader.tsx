import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { JournalArticle, JournalBlock, LocalizedText } from "../../data/journal";
import { useLanguage } from "../../i18n";
import { LanguageSwitch } from "../LanguageSwitch";

export interface JournalOrigin {
  x: number;
  y: number;
}

type BodyPart =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string };

function parseBody(source: string): BodyPart[] {
  return source
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text) => {
      const match = text.match(/^(#{2,3})\s+(.+)$/);
      return match
        ? { type: "heading" as const, level: match[1].length as 2 | 3, text: match[2].trim() }
        : { type: "paragraph" as const, text };
    });
}

function inlineLinks(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s<>"“”]+)/g);
  return parts.map((part, index) => {
    if (!/^https?:\/\//i.test(part)) return part;
    const trailing = part.match(/[.,;:!?，。；：）)\]]+$/u)?.[0] ?? "";
    const href = trailing ? part.slice(0, -trailing.length) : part;
    return (
      <span key={index}>
        <a href={href} target="_blank" rel="noreferrer">{href}</a>{trailing}
      </span>
    );
  });
}

function renderBlock(block: JournalBlock, index: number, language: "en" | "zh") {
  if (block.type === "heading") {
    return block.level === 2
      ? <h2 key={index}>{block.text[language]}</h2>
      : <h3 key={index}>{block.text[language]}</h3>;
  }
  if (block.type === "quote") {
    return (
      <blockquote key={index}>
        <p>{block.text[language]}</p>
        {block.attribution && <cite>{block.attribution[language]}</cite>}
      </blockquote>
    );
  }
  if (block.type === "image") {
    return (
      <figure key={index}>
        <img src={block.src} alt={block.alt[language]} loading="lazy" decoding="async" />
        {block.caption && <figcaption>{block.caption[language]}</figcaption>}
      </figure>
    );
  }
  if (block.type === "link") {
    const external = /^https?:\/\//i.test(block.href);
    return (
      <p className="journal-reader__link" key={index}>
        <a href={block.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
          {block.label[language]}<span aria-hidden="true"> ↗</span>
        </a>
      </p>
    );
  }
  return <p key={index}>{inlineLinks(block.text[language])}</p>;
}

function renderBodyPart(part: BodyPart, index: number) {
  const linkedText = inlineLinks(part.text);
  if (part.type === "heading") {
    return part.level === 2
      ? <h2 key={index}>{linkedText}</h2>
      : <h3 key={index}>{linkedText}</h3>;
  }
  return <p key={index}>{linkedText}</p>;
}

export function JournalReader({
  article,
  origin,
  onBack,
}: {
  article: JournalArticle;
  origin?: JournalOrigin | null;
  onBack: () => void;
}) {
  const { language, copy } = useLanguage();
  const readerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [entered, setEntered] = useState(false);
  const [resolvedBody, setResolvedBody] = useState<{
    id: string;
    value: LocalizedText | null;
    failed: boolean;
  }>({ id: article.id, value: article.body ?? null, failed: false });
  const body = resolvedBody.id === article.id ? resolvedBody.value : article.body ?? null;
  const bodyFailed = resolvedBody.id === article.id && resolvedBody.failed;

  useEffect(() => {
    setEntered(false);
    const frame = window.requestAnimationFrame(() => {
      setEntered(true);
      titleRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [article.id]);

  useEffect(() => {
    let cancelled = false;
    if (article.body) {
      setResolvedBody({ id: article.id, value: article.body, failed: false });
      return;
    }
    if (article.status !== "published" || article.blocks) {
      setResolvedBody({ id: article.id, value: null, failed: false });
      return;
    }
    setResolvedBody({ id: article.id, value: null, failed: false });
    import("../../data/journalContent")
      .then(({ journalBodies }) => {
        if (cancelled) return;
        const value = journalBodies[article.id] ?? null;
        setResolvedBody({ id: article.id, value, failed: value === null });
      })
      .catch(() => {
        if (!cancelled) setResolvedBody({ id: article.id, value: null, failed: true });
      });
    return () => { cancelled = true; };
  }, [article.id, article.status, article.body, article.blocks]);
  const style = origin
    ? ({
        "--journal-origin-x": `${origin.x}px`,
        "--journal-origin-y": `${origin.y}px`,
      } as CSSProperties)
    : undefined;

  return (
    <section
      ref={readerRef}
      className="journal-reader"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-reader-title"
      style={style}
      data-entered={entered ? "true" : "false"}
      onKeyDown={(event) => {
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
    >
      <header className="journal-reader__toolbar">
        <button className="journal-reader__back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> {copy.journalBack}
        </button>
        <span className="journal-reader__wordmark">FOUR HEARTS / JOURNAL</span>
        <LanguageSwitch className="journal-reader__language" />
      </header>
      <article className="journal-reader__paper" aria-labelledby="journal-reader-title">
        <div className="journal-reader__content">
          <p className="journal-reader__eyebrow">
            {article.topics[language].map((topic) => <span key={topic}>{topic}</span>)}
          </p>
          <h1 id="journal-reader-title" ref={titleRef} tabIndex={-1}>{article.title[language]}</h1>
          {(article.date || article.dateLabel?.[language]) && (
            <div className="journal-reader__meta">
              {article.date
                ? <time dateTime={article.date}>{article.dateLabel?.[language] ?? article.date}</time>
                : <span>{article.dateLabel?.[language]}</span>}
            </div>
          )}
          <p className="journal-reader__summary" id="journal-reader-summary">{article.summary[language]}</p>
          <div className="journal-reader__body" aria-describedby="journal-reader-summary">
            {article.status === "source" ? (
              <div className="journal-reader__source">
                <p>{copy.journalArticlePending}</p>
                {article.sourceUrl && (
                  <a className="journal-reader__source-link" href={article.sourceUrl} target="_blank" rel="noreferrer">
                    {copy.journalOpenOriginal}<span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </div>
            ) : body?.[language] ? (
              parseBody(body[language]).map(renderBodyPart)
            ) : (
              article.blocks ? (
                article.blocks.map((block, index) => renderBlock(block, index, language))
              ) : bodyFailed ? (
                <p role="alert">{copy.journalArticleLoadError}</p>
              ) : (
                <p role="status" aria-live="polite">{copy.journalArticleLoading}</p>
              )
            )}
          </div>
          <footer className="journal-reader__footer">
            <button className="journal-reader__back" type="button" onClick={onBack}>
              <span aria-hidden="true">←</span> {copy.journalBack}
            </button>
            <span>FOUR HEARTS / J</span>
          </footer>
        </div>
      </article>
    </section>
  );
}
