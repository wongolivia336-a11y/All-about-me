import { useCallback, useEffect, useRef, useState } from "react";
import { focus } from "../interaction/studyStore";

interface Page {
  index: number;
  image: string;
  thumb: string;
  width: number;
  height: number;
  aspect: number;
  text: string;
}

/**
 * The portfolio spreads, served as images.
 *
 * The source PDF is ~400MB — its photographs are stored as raw FlateDecode
 * RGB — so it is never shipped to the browser. A build step rasterises the 20
 * spreads to WebP and rebuilds a light PDF for download.
 */
export function PortfolioViewer() {
  const [pages, setPages] = useState<Page[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/portfolio/manifest.json")
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json();
      })
      .then((data) => alive && setPages(data.pages))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  const total = pages?.length ?? 0;

  const go = useCallback(
    (delta: number) => {
      setCurrent((c) => Math.min(Math.max(c + delta, 0), Math.max(total - 1, 0)));
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // keep the active thumbnail in view
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current]);

  const page = pages?.[current];

  return (
    <div className="viewer">
      <header className="viewer__bar">
        <div>
          <p className="viewer__kicker">Portfolio</p>
          <h2 className="viewer__title">作品集 · 2022—2026</h2>
        </div>
        <div className="viewer__tools">
          <a className="viewer__download" href="/portfolio/portfolio.pdf" download>
            下载 PDF
          </a>
          <button className="viewer__close" onClick={() => focus(null)}>
            返回房间
          </button>
        </div>
      </header>

      <div className="viewer__stage">
        {error && <p className="viewer__msg">作品集加载失败：{error}</p>}
        {!pages && !error && <p className="viewer__msg">正在载入…</p>}

        {page && (
          <>
            <button
              className="viewer__nav viewer__nav--prev"
              onClick={() => go(-1)}
              disabled={current === 0}
              aria-label="上一页"
            >
              ‹
            </button>

            <img
              key={page.index}
              className="viewer__spread"
              src={page.image}
              width={page.width}
              height={page.height}
              alt={`作品集第 ${page.index} 页`}
              decoding="async"
            />

            <button
              className="viewer__nav viewer__nav--next"
              onClick={() => go(1)}
              disabled={current >= total - 1}
              aria-label="下一页"
            >
              ›
            </button>
          </>
        )}

        {/* warm the neighbours so paging does not flash */}
        {pages
          ?.slice(Math.max(0, current - 1), current + 3)
          .map((p) => (
            <link key={p.index} rel="preload" as="image" href={p.image} />
          ))}
      </div>

      {pages && (
        <footer className="viewer__foot">
          <span className="viewer__count">
            {current + 1} / {total}
          </span>
          <div className="viewer__strip" ref={stripRef}>
            {pages.map((p, i) => (
              <button
                key={p.index}
                data-active={i === current}
                onClick={() => setCurrent(i)}
                aria-label={`跳到第 ${p.index} 页`}
              >
                <img src={p.thumb} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
