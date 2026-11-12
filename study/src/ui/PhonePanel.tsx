import { phoneApps } from "../data/links";
import { focus } from "../interaction/studyStore";
import { phoneAppText, useLanguage } from "../i18n";

/**
 * The phone's apps. None of these platforms expose a public API, so every one
 * of them is an honest outbound link rather than embedded content.
 */
export function PhonePanel() {
  const { language, copy } = useLanguage();
  return (
    <aside className="panel">
      <button className="panel__close" onClick={() => focus(null)} aria-label={copy.closePanel}>
        ✕
      </button>

      <p className="panel__kicker">{copy.phoneKicker}</p>
      <h2 className="panel__title">{copy.phoneTitle}</h2>
      <p className="panel__body">{copy.phoneBody}</p>

      <div className="apps">
        {phoneApps.map((app) => {
          const inner = (
            <>
              <span className="apps__icon" style={{ background: app.tone }}>
                {app.mark}
              </span>
              <span className="apps__text">
                <span className="apps__label">{phoneAppText(app.id, app.label, language)}</span>
                <span className="apps__handle">
                  {app.href ? app.handle : copy.phoneLinksMissing}
                </span>
              </span>
            </>
          );

          return app.href ? (
            <a key={app.id} className="apps__item" href={app.href} target="_blank" rel="noreferrer">
              {inner}
            </a>
          ) : (
            <span key={app.id} className="apps__item apps__item--empty" title={app.note}>
              {inner}
            </span>
          );
        })}
      </div>

      <p className="panel__note">
        {copy.phoneSources}
      </p>
    </aside>
  );
}
