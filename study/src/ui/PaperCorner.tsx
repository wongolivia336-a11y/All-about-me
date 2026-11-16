import { forwardRef } from "react";

interface PaperCornerProps {
  label: string;
  ariaLabel: string;
  title: string;
  onClick: () => void;
  onPreload?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PaperCorner = forwardRef<HTMLButtonElement, PaperCornerProps>(function PaperCorner(
  { label, ariaLabel, title, onClick, onPreload, disabled = false, className },
  forwardedRef,
) {
  return (
    <button
      ref={forwardedRef}
      className={["paper-corner", className].filter(Boolean).join(" ")}
      type="button"
      onClick={onClick}
      onPointerEnter={onPreload}
      onFocus={onPreload}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
    >
      <span className="sr-only">{label}</span>
      <span className="paper-corner__underpage" aria-hidden="true">
        <svg viewBox="0 0 96 96" focusable="false">
          <path d="M7 0H96V89Z" fill="#e5e9e5" />
          <path d="M25 14H95V84Z" fill="#f6f8f6" />
        </svg>
      </span>
      <span className="paper-corner__flap" aria-hidden="true">
        <svg viewBox="0 0 96 96" focusable="false">
          <path d="M0 0H96V96Z" fill="#fff" />
          <path d="M4 1H91" fill="none" stroke="#e2e6e2" strokeWidth="1" />
          <path d="M1 4 92 95" fill="none" stroke="#b9c3bd" strokeWidth="1" />
          <path d="M8 4 91 87" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".9" />
        </svg>
      </span>
      <span className="paper-corner__label" aria-hidden="true">{label.toUpperCase()} <i>↗</i></span>
    </button>
  );
});