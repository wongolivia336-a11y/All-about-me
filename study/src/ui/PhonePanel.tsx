import { useState, type CSSProperties } from "react";
import { phoneApps } from "../data/links";
import { focus } from "../interaction/studyStore";
import { phoneAppText, useLanguage } from "../i18n";

export function PhonePanel() {
  const { language, copy } = useLanguage();
  const [flippedId, setFlippedId] = useState<string | null>(null);

  return (
    <aside className="panel phone-panel" aria-labelledby="phone-panel-title">
      <button className="panel__close" type="button" onClick={() => focus(null)} aria-label={copy.closePanel}>
        ✕
      </button>

      <p className="panel__kicker">{copy.phoneKicker}</p>
      <h2 className="panel__title" id="phone-panel-title">{copy.phoneTitle}</h2>
      <p className="panel__body">{copy.phoneBody}</p>

      <div className="phone-panel__cards">
        {phoneApps.map((app) => {
          const label = phoneAppText(app.id, app.label, language);
          const flipped = flippedId === app.id;
          return (
            <button
              key={app.id}
              className="phone-panel__card"
              type="button"
              data-flipped={flipped}
              aria-expanded={flipped}
              aria-label={label + ": " + (flipped ? copy.phoneCardHide : copy.phoneCardReveal)}
              onClick={() => setFlippedId((current) => current === app.id ? null : app.id)}
            >
              <span className="phone-panel__card-inner">
                <span className="phone-panel__face phone-panel__face--front">
                  <span className="phone-panel__app-icon" style={{ "--app-tone": app.tone } as CSSProperties}>
                    {app.mark}
                  </span>
                  <span className="phone-panel__app-label">{label}</span>
                  <span className="phone-panel__app-handle">{language === "zh" ? app.handleZh ?? app.handle : app.handle}</span>
                  <span className="phone-panel__hint">{copy.phoneCardReveal}<i aria-hidden="true">↗</i></span>
                </span>
                <span className="phone-panel__face phone-panel__face--back" aria-hidden={!flipped}>
                  {app.qrSrc ? (
                    <img src={app.qrSrc} alt={copy.phoneQrAlt + " " + label} loading="lazy" decoding="async" />
                  ) : (
                    <span className="phone-panel__qr-fallback">{copy.phoneLinksMissing}</span>
                  )}
                  <span className="phone-panel__back-label">{copy.phoneCardHide}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="panel__note">{copy.phoneSources}</p>
    </aside>
  );
}