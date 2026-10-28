import { useEffect, useRef, useState } from "react";
import {
  collectionLabels,
  collections,
  entriesFor,
  type Collection,
} from "../data/library";

interface ArchiveProps {
  initialCollection: Collection;
  onClose: () => void;
}

/**
 * The fast, keyboard-friendly route through the work.
 * It is intentionally a flat editorial index, not a second portfolio layout.
 */
export function Archive({ initialCollection, onClose }: ArchiveProps) {
  const [collection, setCollection] = useState<Collection>(initialCollection);
  const entries = entriesFor(collection);
  const [selectedId, setSelectedId] = useState<string | null>(entries[0]?.id ?? null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  useEffect(() => {
    const nextEntries = entriesFor(initialCollection);
    setCollection(initialCollection);
    setSelectedId(nextEntries[0]?.id ?? null);
  }, [initialCollection]);

  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];

  const selectCollection = (next: Collection) => {
    const nextEntries = entriesFor(next);
    setCollection(next);
    setSelectedId(nextEntries[0]?.id ?? null);
  };

  return (
    <main className="archive" aria-label="Olivia Wong 内容索引">
      <div className="archive__shell">
        <header className="archive__bar">
          <h1 className="archive__name">Olivia Wong</h1>
          <button
            ref={closeButton}
            className="archive__close"
            type="button"
            onClick={onClose}
          >
            <span aria-hidden="true">←</span>
            <span>Room</span>
          </button>
        </header>

        <nav className="archive__tabs" aria-label="内容分类">
          {collections.map((item) => (
            <button
              key={item}
              className="archive__tab"
              type="button"
              aria-pressed={collection === item}
              onClick={() => selectCollection(item)}
            >
              {collectionLabels[item]}
            </button>
          ))}
        </nav>

        {entries.length > 0 ? (
          <div className="archive__body">
            <ol className="archive__list">
              {entries.map((entry) => {
                const active = entry.id === selected?.id;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => setSelectedId(entry.id)}
                    >
                      <span>{entry.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {selected && (
              <aside className="archive__detail" aria-live="polite">
                <h2>{selected.title}</h2>
                <p>{selected.summary}</p>
                <div className="archive__links">
                  {selected.links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                      {link.label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </aside>
            )}
          </div>
        ) : (
          <p className="archive__empty">尚未公开。</p>
        )}
      </div>
    </main>
  );
}
