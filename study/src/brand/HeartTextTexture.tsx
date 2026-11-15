import { useMemo } from "react";
import type { ThemeId } from "../data/library";
import { themeText, useLanguage } from "../i18n";

export { HEART_PATH } from "./heartPath";

interface HeartTextTextureProps {
  theme: ThemeId;
  clipId: string;
}
export function HeartTextTexture({ theme, clipId }: HeartTextTextureProps) {
  const { language } = useLanguage();
  const words = themeText(theme, language).texture;
  const lines = useMemo(
    () => Array.from({ length: 8 }, (_, index) => {
      const first = words[index % words.length];
      const second = words[(index + 2) % words.length];
      return `${first}  ·  ${second}  ·  ${words[(index + 3) % words.length]}`;
    }),
    [words],
  );

  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {lines.map((line, index) => (
        <text
          key={`${theme}-${index}`}
          className="heartwheel__texture"
          x="-56"
          y={-112 + index * 12.5}
          textLength="104"
          lengthAdjust="spacingAndGlyphs"
          fill="currentColor"
        >
          {line}
        </text>
      ))}
    </g>
  );
}
