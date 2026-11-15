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

/** A paper corner folded over the existing Room entry control. */
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
        <svg viewBox="0 0 124 124" focusable="false">
          <defs>
            <linearGradient id="paper-under" x1="18" y1="7" x2="117" y2="118" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f9fbfa" />
              <stop offset=".44" stopColor="#edf1ef" />
              <stop offset=".78" stopColor="#d5dddb" />
              <stop offset="1" stopColor="#b7c2c2" />
            </linearGradient>
            <filter id="paper-under-shadow" x="-30%" y="-20%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>
          <path d="M8 3H121V118C112 113 104 107 97 100 86 90 79 80 69 69 51 49 31 25 8 3Z" fill="#39454a" opacity=".24" filter="url(#paper-under-shadow)" transform="translate(-2 3)" />
          <path d="M8 3H121V118C112 113 104 107 97 100 86 90 79 80 69 69 51 49 31 25 8 3Z" fill="url(#paper-under)" />
          <path d="M83 35c3.5-4.8 10.5-4.8 14 0-3.5 4.8-10.5 4.8-14 0Z" fill="#59717a" opacity=".78" />
          <circle cx="90" cy="35" r="2.1" fill="#f9fbfa" />
          <text x="76" y="56" fill="#596b70" fontSize="6.7" fontFamily="ui-monospace, monospace" letterSpacing=".9">ROOM</text>
        </svg>
      </span>
      <span className="paper-corner__flap" aria-hidden="true">
        <svg viewBox="0 0 124 124" focusable="false">
          <defs>
            <linearGradient id="paper-face" x1="10" y1="0" x2="120" y2="122" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" />
              <stop offset=".3" stopColor="#fcfdfc" />
              <stop offset=".58" stopColor="#f1f4f2" />
              <stop offset=".8" stopColor="#e1e6e4" />
              <stop offset="1" stopColor="#c8d1d0" />
            </linearGradient>
            <linearGradient id="paper-roll" x1="24" y1="13" x2="111" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" stopOpacity=".96" />
              <stop offset=".22" stopColor="#fff" stopOpacity=".26" />
              <stop offset=".53" stopColor="#879390" stopOpacity=".08" />
              <stop offset=".78" stopColor="#566468" stopOpacity=".34" />
              <stop offset="1" stopColor="#fff" stopOpacity=".88" />
            </linearGradient>
            <linearGradient id="paper-ridge" x1="52" y1="48" x2="113" y2="112" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" stopOpacity=".08" />
              <stop offset=".26" stopColor="#fff" stopOpacity=".86" />
              <stop offset=".54" stopColor="#aeb8b5" stopOpacity=".28" />
              <stop offset=".76" stopColor="#5b696e" stopOpacity=".27" />
              <stop offset="1" stopColor="#fff" stopOpacity=".78" />
            </linearGradient>
            <linearGradient id="paper-crease" x1="25" y1="21" x2="112" y2="108" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" stopOpacity=".9" />
              <stop offset=".5" stopColor="#8d9996" stopOpacity=".16" />
              <stop offset=".86" stopColor="#46565d" stopOpacity=".48" />
              <stop offset="1" stopColor="#fff" stopOpacity=".94" />
            </linearGradient>
            <linearGradient id="paper-edge" x1="36" y1="34" x2="109" y2="106" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" stopOpacity=".06" />
              <stop offset=".56" stopColor="#fff" stopOpacity=".56" />
              <stop offset="1" stopColor="#718080" stopOpacity=".18" />
            </linearGradient>
            <filter id="paper-fibre" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="2" seed="14" stitchTiles="stitch" result="grain" />
              <feColorMatrix in="grain" type="saturate" values="0" result="mono" />
              <feComponentTransfer in="mono" result="soft-grain">
                <feFuncA type="table" tableValues="0 .13" />
              </feComponentTransfer>
              <feBlend in="SourceGraphic" in2="soft-grain" mode="multiply" />
            </filter>
            <filter id="paper-edge-shadow" x="-30%" y="-20%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <path d="M7 1H123V121C115 117 107 112 101 106 92 98 87 90 79 81 73 74 68 67 61 59 44 40 26 17 7 1Z" fill="#59666a" opacity=".25" filter="url(#paper-edge-shadow)" transform="translate(-1 4)" />
          <path d="M7 1H123V121C115 117 107 112 101 106 92 98 87 90 79 81 73 74 68 67 61 59 44 40 26 17 7 1Z" fill="url(#paper-face)" filter="url(#paper-fibre)" />
          <path d="M7 1C27 13 44 32 61 51 69 60 75 68 82 76 91 87 98 96 106 103 111 108 117 113 123 117" fill="none" stroke="#788482" strokeOpacity=".42" strokeWidth="5" filter="url(#paper-edge-shadow)" />
          <path d="M48 42C60 54 69 65 80 77 91 89 103 102 123 117 112 114 101 106 92 98 81 88 72 77 63 67 56 59 51 51 48 42Z" fill="url(#paper-ridge)" opacity=".82" />
          <path d="M7 1C27 13 44 32 61 51 69 60 75 68 82 76 91 87 98 96 106 103 111 108 117 113 123 117" fill="none" stroke="url(#paper-roll)" strokeWidth="3.6" />
          <path d="M8 1C29 14 46 33 63 52 71 61 77 69 84 77 93 88 100 97 108 104 113 109 118 113 123 117" fill="none" stroke="url(#paper-crease)" strokeWidth="1.2" />
          <path d="M11 4C32 18 48 36 65 54 73 63 79 71 86 79 95 89 102 98 110 105 115 110 119 114 122 116" fill="none" stroke="#fff" strokeOpacity=".78" strokeWidth=".65" />
          <path d="M17 7C38 23 54 41 71 59 79 67 86 76 93 84" fill="none" stroke="url(#paper-edge)" strokeWidth="8" strokeLinecap="round" opacity=".62" />
          <path d="M24 10C46 27 63 46 80 64 91 76 99 87 108 96" fill="none" stroke="#75817f" strokeOpacity=".12" strokeWidth=".8" />
        </svg>
      </span>
      <span className="paper-corner__label" aria-hidden="true">{label.toUpperCase()} <i>↗</i></span>
    </button>
  );
});
