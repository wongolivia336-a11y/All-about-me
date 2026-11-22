import { useCallback, useEffect, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

export interface BadgeItem {
  title: string;
  role: string;
  accent: string;
  description: string;
  placeholder?: boolean;
  illustration?: string;
}

type CardProps = { cardRef: (node: HTMLButtonElement | null) => void;
  item: BadgeItem; index: number; selected: boolean; flipped: boolean;
  reducedMotion: boolean; language: "en" | "zh";
  onSelect: (index: number) => void; onFlip: (index: number) => void;
  onFlipBack: () => void; onMoveFocus: (index: number) => void;
};

function useBadgeMotion(reducedMotion: boolean) {
  const hangerRef = useRef<HTMLSpanElement>(null);
  const motion = useRef({ angle: 0, velocity: 0, pull: 0, pullVelocity: 0, frame: 0 });
  const pointer = useRef({ id: -1, x: 0, y: 0, lastX: 0, lastY: 0, lastTime: 0, moved: false });
  const suppressClick = useRef(false);

  const paint = useCallback(() => {
    const node = hangerRef.current;
    if (!node) return;
    const m = motion.current;
    node.style.transform = "translateY(" + m.pull.toFixed(2) + "px) rotate(" + m.angle.toFixed(2) + "deg)";
    node.style.setProperty("--lanyard-extra", Math.max(0, m.pull * 0.42).toFixed(2) + "px");
  }, []);

  const settle = useCallback(() => {
    if (reducedMotion || motion.current.frame) return;
    let previous = 0;
    const tick = (now: number) => {
      const m = motion.current;
      const dt = Math.min(0.032, Math.max(0.001, previous ? (now - previous) / 1000 : 0.016));
      previous = now;
      m.velocity += (-72 * m.angle - 13 * m.velocity) * dt;
      m.angle += m.velocity * dt;
      m.pullVelocity += (-88 * m.pull - 16 * m.pullVelocity) * dt;
      m.pull += m.pullVelocity * dt;
      if (Math.abs(m.angle) < 0.025 && Math.abs(m.velocity) < 0.04) m.angle = m.velocity = 0;
      if (Math.abs(m.pull) < 0.025 && Math.abs(m.pullVelocity) < 0.04) m.pull = m.pullVelocity = 0;
      paint();
      if (m.angle || m.velocity || m.pull || m.pullVelocity) m.frame = requestAnimationFrame(tick);
      else m.frame = 0;
    };
    motion.current.frame = requestAnimationFrame(tick);
  }, [paint, reducedMotion]);

  useEffect(() => () => { if (motion.current.frame) cancelAnimationFrame(motion.current.frame); }, []);
  useEffect(() => {
    if (!reducedMotion) return;
    if (motion.current.frame) cancelAnimationFrame(motion.current.frame);
    motion.current.frame = 0;
    motion.current.angle = motion.current.velocity = motion.current.pull = motion.current.pullVelocity = 0;
    paint();
  }, [paint, reducedMotion]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (motion.current.frame) cancelAnimationFrame(motion.current.frame);
    motion.current.frame = 0;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), moved: false };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Embedded preview may not support capture. */ }
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const p = pointer.current;
    if (reducedMotion || p.id !== event.pointerId) return;
    const dx = event.clientX - p.x, dy = event.clientY - p.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) p.moved = true;
    if (!p.moved) return;
    event.preventDefault();
    const now = performance.now(), elapsed = Math.max(8, now - p.lastTime);
    const m = motion.current;
    m.angle = Math.max(-22, Math.min(22, dx * 0.22));
    m.pull = Math.max(0, Math.min(52, dy * 0.34));
    m.velocity = Math.max(-720, Math.min(720, ((event.clientX - p.lastX) * 0.22 / elapsed) * 1000));
    m.pullVelocity = Math.max(-520, Math.min(520, ((event.clientY - p.lastY) * 0.34 / elapsed) * 1000));
    p.lastX = event.clientX; p.lastY = event.clientY; p.lastTime = now;
    paint();
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointer.current.id !== event.pointerId) return;
    const moved = pointer.current.moved;
    pointer.current.id = -1;
    if (moved) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      settle();
    }
    try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* Capture may be released by the browser. */ }
  };

  const onClickCapture = (event: MouseEvent<HTMLButtonElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault(); event.stopPropagation(); suppressClick.current = false;
  };

  const nudge = (direction: number) => {
    if (reducedMotion) return;
    motion.current.velocity = Math.max(-520, Math.min(520, motion.current.velocity + direction * 210));
    settle();
  };

  return { hangerRef, onPointerDown, onPointerMove, onPointerUp, onClickCapture, nudge };
}

function BadgeCard({ cardRef, item, index, selected, flipped, reducedMotion, language, onSelect, onFlip, onFlipBack, onMoveFocus }: CardProps) {
  const physics = useBadgeMotion(reducedMotion);
  const zh = language === "zh";
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && flipped) { event.preventDefault(); onFlipBack(); return; }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); onMoveFocus(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  };

  return (
    <div className="quick-read-page__badge-slot" data-selected={selected ? "true" : "false"} style={{ "--item-accent": item.accent } as CSSProperties}>
      <span className="quick-read-page__badge-anchor" aria-hidden="true" />
      <span className="quick-read-page__badge-hanger" ref={physics.hangerRef}>
        <span className="quick-read-page__badge-lanyard" aria-hidden="true" />
        <span className="quick-read-page__badge-crimp" aria-hidden="true" />
        <span className="quick-read-page__badge-swivel" aria-hidden="true"><i /></span>
        <button
          ref={cardRef} type="button" className="quick-read-page__badge"
          data-flipped={flipped ? "true" : "false"} data-placeholder={item.placeholder ? "true" : "false"}
          aria-label={item.title + " — " + (flipped ? (zh ? "返回正面" : "turn to front") : (zh ? "翻到背面" : "turn to back"))}
          aria-pressed={flipped}
          onFocus={() => onSelect(index)}
          onPointerEnter={(event) => { if (event.pointerType === "mouse" && !selected) physics.nudge(index % 2 ? 1 : -1); }}
          onPointerDown={physics.onPointerDown} onPointerMove={physics.onPointerMove}
          onPointerUp={physics.onPointerUp} onPointerCancel={physics.onPointerUp}
          onClickCapture={physics.onClickCapture}
          onClick={() => { onSelect(index); physics.nudge(index % 2 ? 1 : -1); onFlip(index); }}
          onKeyDown={onKeyDown}
        >
          <span className="quick-read-page__badge-depth" aria-hidden="true" />
          <span className="quick-read-page__badge-flip">
            <span className="quick-read-page__badge-face quick-read-page__badge-face--front" aria-hidden={flipped}>
              <span className="quick-read-page__badge-topline"><span>FOUR HEARTS</span><span>{String(index + 1).padStart(2, "0")}</span></span>
              <span className="quick-read-page__badge-body">
                <span className="quick-read-page__badge-heading">{item.title}</span>
                <span className="quick-read-page__badge-role">{item.role}</span>
                {item.illustration
                  ? <img className="quick-read-page__badge-art" src={item.illustration} alt="" draggable={false} decoding="async" />
                  : <span className="quick-read-page__badge-placeholder"><i aria-hidden="true">+</i><span>{zh ? "档案待补" : "DETAILS TO COME"}</span></span>}
              </span>
              <span className="quick-read-page__badge-footer"><span>OLIVIA WONG</span><span>{zh ? "轻触翻面" : "TAP TO TURN"} <i aria-hidden="true">↻</i></span></span>
            </span>
            <span className="quick-read-page__badge-face quick-read-page__badge-face--back" aria-hidden={!flipped}>
              <span className="quick-read-page__badge-back-index">{zh ? "经历档案" : "FIELD NOTE"} <i> / {String(index + 1).padStart(2, "0")}</i></span>
              <strong>{item.title}</strong>
              <span className="quick-read-page__badge-back-role">{item.role}</span>
              <span className="quick-read-page__badge-back-copy">{item.description}</span>
              {item.placeholder && <span className="quick-read-page__badge-back-status">{zh ? "等待补充真实经历" : "AWAITING REAL DETAILS"}</span>}
              <span className="quick-read-page__badge-back-hint">{zh ? "按 Esc 返回正面" : "PRESS ESC TO RETURN"}</span>
            </span>
          </span>
        </button>
      </span>
    </div>
  );
}

export function ExperienceBadgeScene({ items, selectedIndex, flippedIndex, onSelect, onFlip, onFlipBack, reducedMotion, language }: {
  items: BadgeItem[]; selectedIndex: number; flippedIndex: number | null;
  onSelect: (index: number) => void; onFlip: (index: number) => void; onFlipBack: () => void;
  reducedMotion: boolean; language: "en" | "zh";
}) {
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moveFocus = (index: number) => {
    const next = (index + items.length) % items.length;
    onSelect(next);
    cardRefs.current[next]?.focus();
  };
  return (
    <div className="quick-read-page__badge-rail" role="group" aria-label={language === "zh" ? "三张可翻面的实习工牌" : "Three interactive internship badges"}>
      <span className="quick-read-page__badge-rail-line" aria-hidden="true" />
      <div className="quick-read-page__badge-track">
        {items.map((item, index) => (
          <BadgeCard key={item.title} cardRef={(node) => { cardRefs.current[index] = node; }} item={item} index={index} selected={selectedIndex === index}
            flipped={flippedIndex === index} reducedMotion={reducedMotion} language={language}
            onSelect={onSelect} onFlip={onFlip} onFlipBack={onFlipBack} onMoveFocus={moveFocus} />
        ))}
      </div>
      <div className="quick-read-page__badge-list" role="group" aria-label={language === "zh" ? "选择一段经历" : "Choose an experience"}>
        {items.map((item, index) => (
          <button type="button" key={item.title + "-index"} aria-pressed={selectedIndex === index}
            onClick={() => { onSelect(index); cardRefs.current[index]?.focus(); }}
            style={{ "--item-accent": item.accent } as CSSProperties}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><i aria-hidden="true">{selectedIndex === index ? "↗" : "—"}</i>
          </button>
        ))}
      </div>
    </div>
  );
}
