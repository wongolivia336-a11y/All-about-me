import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { JournalArticle, JournalBlock } from "../../data/journal";
import { useLanguage } from "../../i18n";
import { LanguageSwitch } from "../LanguageSwitch";

export interface JournalOrigin {
  x: number;
  y: number;
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

  useEffect(() => {
    const reader = readerRef.current;
    const title = titleRef.current;
    if (!reader || !title) return;
    reader.dataset.entered = "false";
    const frame = window.requestAnimationFrame(() => {
      reader.dataset.entered = "true";
      title.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [article.id]);

  const renderBlock = (block: JournalBlock, index: number) => {
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
    return <p key={index}>{block.text[language]}</p>;
  };

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
      data-entered="false"
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
          {article.status === "development" && (
            <p className="journal-reader__sample">{copy.journalDevelopmentLabel}</p>
          )}
          <p className="journal-reader__eyebrow">
            {article.topics[language].map((topic) => <span key={topic}>{topic}</span>)}
          </p>
          <h1 id="journal-reader-title" ref={titleRef} tabIndex={-1}>{article.title[language]}</h1>
          <div className="journal-reader__meta">
            {article.date
              ? <time dateTime={article.date}>{article.dateLabel[language]}</time>
              : <span>{article.dateLabel[language]}</span>}
          </div>
          <p className="journal-reader__summary">{article.summary[language]}</p>
          <div className="journal-reader__body">
            {article.blocks.map(renderBlock)}
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

