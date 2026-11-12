import { themeConfig, themeOrder } from "../data/themeConfig";
import { HEART_PATH } from "./HeartTextTexture";

export function HeartwheelFallback() {
  return (
    <svg className="heartwheel__scene-fallback" viewBox="-170 -170 340 340" aria-hidden="true">
      {themeOrder.map((theme) => (
        <g key={theme} transform={`rotate(${themeConfig[theme].leafAngle} 0 0)`}>
          <path d={HEART_PATH} fill={themeConfig[theme].leafColor} />
          <path d="M 0 0 C 0 -38 0 -76 0 -114" fill="none" stroke="#b7d0b7" strokeWidth="2.2" strokeLinecap="round" opacity=".48" />
        </g>
      ))}
      <circle cx="0" cy="0" r="6" fill="#355e48" />
    </svg>
  );
}
