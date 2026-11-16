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

export function JournalSection({
  articles,
  active,
  readerOpen,
  inactive,
  onOpenArticle,
  onOpenCollect,
}: JournalSectionProps) {
  const { language, copy } = useLanguage();
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const publishedCount = articles.filter((article) => article.status === "published").length;

  const openArticle = (article: JournalArticle, trigger: HTMLButtonElement) => {
    onOpenArticle(article.id, trigger);
  };

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

      <div className="journal-index__layout">
        <div className="journal-index__featured">
          <div className="journal-index__object-label">
            <span>{copy.journalFeatured}</span>
            <span aria-hidden="true">01</span>
          </div>
          <FeaturedPaper active={active && !inactive} disabled={readerOpen || !active || inactive} />
          <div className="journal-index__feature-copy">
            {featured ? (
              <>
                {featured.status === "development" && (
                  <p className="journal-index__sample-label">{copy.journalDevelopmentLabel}</p>
                )}
                <h3>{featured.title[language]}</h3>
                <p>{featured.summary[language]}</p>
                <button
                  className="journal-index__read"
                  type="button"
                  data-journal-entry={featured.id}
                  onClick={(event) => openArticle(featured, event.currentTarget)}
                >
                  {copy.journalRead}<span aria-hidden="true">↗</span>
                </button>
              </>
            ) : (
              <>
                <p className="journal-index__sample-label">{copy.journalAwaiting}</p>
                <h3>{copy.journalEmptyTitle}</h3>
                <p>{copy.journalEmptyBody}</p>
              </>
            )}
          </div>
        </div>

        <div className="journal-index__index">
          <div className="journal-index__index-heading">
            <span>{copy.journalIndex}</span>
            <span>{copy.journalPublishedCount}: {String(publishedCount).padStart(2, "0")}</span>
          </div>
          {articles.length > 0 ? (
            <ol className="journal-index__entries">
              {articles.map((article, index) => (
                <li className="journal-index__entry" key={article.id}>
                  <div className="journal-index__entry-meta">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {article.date ? (
                      <time dateTime={article.date}>{article.dateLabel[language]}</time>
                    ) : (
                      <span>{article.dateLabel[language]}</span>
                    )}
                  </div>
                  <h3>{article.title[language]}</h3>
                  <p>{article.summary[language]}</p>
                  <div className="journal-index__entry-bottom">
                    <ul aria-label={copy.journalTopics}>
                      {article.topics[language].map((topic) => <li key={topic}>{topic}</li>)}
                    </ul>
                    <button
                      className="journal-index__read"
                      type="button"
                      data-journal-entry={article.id}
                      onClick={(event) => openArticle(article, event.currentTarget)}
                    >
                      {copy.journalRead}<span aria-hidden="true">↗</span>
                    </button>
                  </div>
                  {article.status === "development" && (
                    <p className="journal-index__sample-label">{copy.journalDevelopmentLabel}</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="journal-index__empty">
              <span aria-hidden="true">—</span>
              <p>{copy.journalNoEntries}</p>
            </div>
          )}
          <button className="journal-index__collect" type="button" onClick={onOpenCollect}>
            {copy.journalCollectLink}<span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </section>
  );
}

