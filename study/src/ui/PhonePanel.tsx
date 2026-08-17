import { phoneApps } from "../data/links";
import { focus } from "../interaction/studyStore";

/**
 * The phone's apps. None of these platforms expose a public API, so every one
 * of them is an honest outbound link rather than embedded content.
 */
export function PhonePanel() {
  return (
    <aside className="panel">
      <button className="panel__close" onClick={() => focus(null)} aria-label="返回房间">
        ✕
      </button>

      <p className="panel__kicker">App</p>
      <h2 className="panel__title">我写的东西</h2>
      <p className="panel__body">
        发布在哪儿，就从哪个图标进。这几个平台都不开放 API，所以是跳转，不是嵌入。
      </p>

      <div className="apps">
        {phoneApps.map((app) => {
          const inner = (
            <>
              <span className="apps__icon" style={{ background: app.tone }}>
                {app.mark}
              </span>
              <span className="apps__text">
                <span className="apps__label">{app.label}</span>
                <span className="apps__handle">
                  {app.href ? app.handle : "链接待补"}
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
        把链接填进 <code>src/data/links.ts</code> 就会自动生效。
      </p>
    </aside>
  );
}
