import { TMDB_ATTRIBUTION, films, usingTmdb } from "../data/films";
import { focus } from "../interaction/studyStore";
import { useLanguage } from "../i18n";

/**
 * The film wall's index. Grouped by director, because that is how the wall is
 * actually organised and how she thinks about it.
 */
export function CinemaPanel() {
  const { copy } = useLanguage();
  const directors = [...new Set(films.map((f) => f.director))];
  const hasArtwork = usingTmdb();

  return (
    <aside className="panel">
      <button className="panel__close" onClick={() => focus(null)} aria-label={copy.closePanel}>
        ✕
      </button>

      <p className="panel__kicker">{copy.cinemaKicker}</p>
      <h2 className="panel__title">{copy.cinemaTitle}</h2>
      <p className="panel__body">{copy.cinemaBody}</p>

      {directors.map((director) => (
        <section key={director} className="cinema__group">
          <h3 className="cinema__director">{director}</h3>
          <ul className="cinema__list">
            {films
              .filter((f) => f.director === director)
              .map((film) => (
                <li key={film.id}>
                  <span className="cinema__title">{film.title}</span>
                  <span className="cinema__meta">
                    {film.titleEn} · {film.year}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}

      {hasArtwork ? (
        <p className="panel__note">{TMDB_ATTRIBUTION}</p>
      ) : (
        <p className="panel__note">{copy.posterFallback}</p>
      )}
    </aside>
  );
}
