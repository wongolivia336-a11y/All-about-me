import { memo, useId, useMemo, type CSSProperties } from "react";
import type { ThemeId } from "../data/library";
import { themeConfig } from "../data/themeConfig";
import { HEART_PATH } from "./heartPath";

interface PaperHeartProps {
  theme: ThemeId;
}

function createFibers(theme: ThemeId) {
  const seeds: Record<ThemeId, number> = {
    build: 241,
    question: 487,
    play: 733,
    keep: 971,
  };
  let seed = seeds[theme];
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dark: string[] = [];
  const light: string[] = [];

  for (let index = 0; index < 34; index += 1) {
    const x = next() * 112 - 56;
    const y = -12 - next() * 128;
    const length = 1.1 + next() * 3.2;
    const angle = (next() - 0.5) * 0.62;
    const fragment = `M ${x.toFixed(2)} ${y.toFixed(2)} l ${(Math.cos(angle) * length).toFixed(2)} ${(Math.sin(angle) * length).toFixed(2)}`;
    (index % 4 === 0 ? light : dark).push(fragment);
  }

  return { dark: dark.join(" "), light: light.join(" ") };
}

export const PaperHeart = memo(function PaperHeart({ theme }: PaperHeartProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fibers = useMemo(() => createFibers(theme), [theme]);
  const definition = themeConfig[theme];
  const washId = `paper-heart-wash-${id}`;
  const clipId = `paper-heart-clip-${id}`;

  return (
    <g className="paper-heart" style={{ "--leaf-color": definition.leafColor, "--leaf-ink": definition.ink } as CSSProperties}>
      <defs>
        <linearGradient id={washId} x1="0" y1="-150" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity=".3" />
          <stop offset=".52" stopColor={definition.accent} stopOpacity=".14" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={HEART_PATH} />
        </clipPath>
      </defs>
      <path className="paper-heart__edge" d={HEART_PATH} transform="translate(.75 1.1)" />
      <path className="paper-heart__body" d={HEART_PATH} />
      <path className="paper-heart__wash" d={HEART_PATH} fill={`url(#${washId})`} />
      <g className="paper-heart__fiber-field" clipPath={`url(#${clipId})`} aria-hidden="true">
        <path className="paper-heart__fibers paper-heart__fibers--ink" d={fibers.dark} />
        <path className="paper-heart__fibers paper-heart__fibers--light" d={fibers.light} />
      </g>
      <path className="paper-heart__fold-shadow" d="M -.8 -11 C -.2 -37 -1.7 -68 -1.2 -99" />
      <path className="paper-heart__fold-light" d="M .55 -12 C 1 -40 -.25 -69 .1 -101" />
      <path className="paper-heart__contour" d={HEART_PATH} />
    </g>
  );
});
