import { content } from "../data/content";
import { hotspotById } from "../data/hotspots";
import { useStudy } from "../interaction/studyStore";

/** The content surface that slides in once the camera is pushed into an object. */
export function Panel() {
  const { focused, focus } = useStudy();
  if (!focused) return null;

  const section = content[focused];
  if (!section) return null;

  const spot = hotspotById(focused);

  return (
    <aside className="panel" key={focused}>
      <button className="panel__close" onClick={() => focus(null)} aria-label="返回房间">
        ✕
      </button>

      <p className="panel__kicker">{section.kicker}</p>
      <h2 className="panel__title">{section.title}</h2>
      <p className="panel__body">{section.body}</p>

      {section.items && (
        <ul className="panel__list">
          {section.items.map((item) => (
            <li key={item.title}>
              <span className="panel__item-title">{item.title}</span>
              <span className="panel__item-meta">{item.meta}</span>
            </li>
          ))}
        </ul>
      )}

      {section.cta && (
        <a className="panel__cta" href={section.cta.href}>
          {section.cta.label}
        </a>
      )}

      <p className="panel__path">{spot.path}</p>
    </aside>
  );
}
