import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  clampCornerLift,
  FOCUS_LIFT,
  paperCornerB4Geometry,
  REST_LIFT,
} from "./paperCornerB4Geometry";
import "./PaperCornerB4.css";

/** Same public contract as study/src/ui/PaperCorner.tsx. */
interface PaperCornerProps {
  label: string;
  ariaLabel: string;
  title: string;
  onClick: () => void;
  onPreload?: () => void;
  disabled?: boolean;
  className?: string;
}

const initial = paperCornerB4Geometry(REST_LIFT);

/**
 * Approved visual direction: pure-white semi-translucent wax paper, with a
 * graphite Room hinted underneath. This component owns ONLY the small corner.
 * It must not update location.hash or mount/preload the Room by itself.
 */
export const PaperCorner = forwardRef<HTMLButtonElement, PaperCornerProps>(
  function PaperCorner(
    { label, ariaLabel, title, onClick, onPreload, disabled = false, className },
    forwardedRef,
  ) {
    const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const ids = {
      under: `${uniqueId}-under`,
      back: `${uniqueId}-back`,
      shadow: `${uniqueId}-shadow`,
      contact: `${uniqueId}-contact`,
      bleed: `${uniqueId}-bleed`,
      mottle: `${uniqueId}-mottle`,
      ridge: `${uniqueId}-ridge`,
      fibres: `${uniqueId}-fibres`,
      clip: `${uniqueId}-clip`,
      underClip: `${uniqueId}-underclip`,
    };

    const underRef = useRef<SVGPathElement>(null);
    const underClipRef = useRef<SVGPathElement>(null);
    const flapClipRef = useRef<SVGPathElement>(null);
    const flapRef = useRef<SVGPathElement>(null);
    const broadShadowRef = useRef<SVGPathElement>(null);
    const contactShadowRef = useRef<SVGPathElement>(null);
    const creaseRef = useRef<SVGPathElement>(null);
    const freeEdgeRef = useRef<SVGPathElement>(null);
    const currentLift = useRef(REST_LIFT);
    const targetLift = useRef(REST_LIFT);
    const reducedMotion = useRef(false);
    const frameId = useRef<number | null>(null);

    const paint = useCallback((lift: number) => {
      const g = paperCornerB4Geometry(lift);
      underRef.current?.setAttribute("d", g.under);
      underClipRef.current?.setAttribute("d", g.under);
      flapClipRef.current?.setAttribute("d", g.flap);
      flapRef.current?.setAttribute("d", g.flap);
      broadShadowRef.current?.setAttribute("d", g.flap);
      broadShadowRef.current?.setAttribute("transform", g.broadShadowOffset);
      contactShadowRef.current?.setAttribute("d", g.flap);
      contactShadowRef.current?.setAttribute("transform", g.contactShadowOffset);
      creaseRef.current?.setAttribute("d", g.crease);
      freeEdgeRef.current?.setAttribute("d", g.freeEdge);
    }, []);

    const animateTo = useCallback((value: number) => {
      const goal = clampCornerLift(value);
      targetLift.current = goal;
      if (reducedMotion.current) {
        if (frameId.current !== null) cancelAnimationFrame(frameId.current);
        frameId.current = null;
        currentLift.current = goal;
        paint(goal);
        return;
      }
      // A single active animation driver is reused while the pointer moves.
      if (frameId.current !== null) return;
      const tick = () => {
        const distance = targetLift.current - currentLift.current;
        if (Math.abs(distance) < 0.001) {
          currentLift.current = targetLift.current;
          paint(currentLift.current);
          frameId.current = null;
          return;
        }
        currentLift.current += distance * 0.13;
        paint(currentLift.current);
        frameId.current = requestAnimationFrame(tick);
      };
      frameId.current = requestAnimationFrame(tick);
    }, [paint]);

    useEffect(() => {
      const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotion.current = motionPreference.matches;
      const syncMotionPreference = () => {
        reducedMotion.current = motionPreference.matches;
        if (!reducedMotion.current) return;
        if (frameId.current !== null) cancelAnimationFrame(frameId.current);
        frameId.current = null;
        currentLift.current = targetLift.current;
        paint(currentLift.current);
      };
      motionPreference.addEventListener("change", syncMotionPreference);
      paint(REST_LIFT);
      return () => {
        motionPreference.removeEventListener("change", syncMotionPreference);
        if (frameId.current !== null) cancelAnimationFrame(frameId.current);
        frameId.current = null;
      };
    }, [paint]);

    const handlePointerEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPreload?.();
      if (!disabled && event.pointerType !== "touch") animateTo(FOCUS_LIFT);
    };
    const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (disabled || event.pointerType === "touch") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const distance = Math.hypot(rect.right - event.clientX, event.clientY - rect.top);
      animateTo(Math.max(0.3, Math.min(1, 0.98 - (distance / rect.width) * 0.55)));
    };

    return (
      <button
        ref={forwardedRef}
        className={["paper-corner-b4", className].filter(Boolean).join(" ")}
        type="button"
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={onClick}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={(event) => animateTo(event.currentTarget.matches(":focus-visible") ? FOCUS_LIFT : REST_LIFT)}
        onFocus={() => { onPreload?.(); animateTo(FOCUS_LIFT); }}
        onBlur={() => animateTo(REST_LIFT)}
      >
        <span className="paper-corner-b4__sr-only">{label}</span>
        <svg
          className="paper-corner-b4__visual"
          viewBox="0 0 200 200"
          focusable="false"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={ids.under} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#222a30" />
              <stop offset=".44" stopColor="#374248" />
              <stop offset="1" stopColor="#21282e" />
            </linearGradient>
            <linearGradient id={ids.back} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#ffffff" stopOpacity=".89" />
              <stop offset=".27" stopColor="#eef1f2" stopOpacity=".74" />
              <stop offset=".53" stopColor="#ffffff" stopOpacity=".83" />
              <stop offset=".78" stopColor="#e9edef" stopOpacity=".69" />
              <stop offset="1" stopColor="#ffffff" stopOpacity=".91" />
            </linearGradient>
            <filter id={ids.shadow} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" /></filter>
            <filter id={ids.contact} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6" /></filter>
            <filter id={ids.bleed}><feGaussianBlur stdDeviation="2.6" /></filter>
            <filter id={ids.mottle} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency=".044 .073" numOctaves="2" seed="11" stitchTiles="stitch" result="grain" />
              <feColorMatrix in="grain" type="matrix" values="0 0 0 0 .69  0 0 0 0 .73  0 0 0 0 .75  .23 .23 .23 0 -.315" />
            </filter>
            <linearGradient id={ids.ridge}>
              <stop stopColor="#aeb8bc" stopOpacity="0" />
              <stop offset=".5" stopColor="#89969b" stopOpacity=".12" />
              <stop offset="1" stopColor="#ffffff" stopOpacity=".14" />
            </linearGradient>
            <pattern id={ids.fibres} width="28" height="23" patternUnits="userSpaceOnUse" patternTransform="rotate(11)">
              <path d="M2 7l7 -1 M16 17l5 1 M10 21l4 -.5 M25 5l2 -1" fill="none" stroke="#99a5a9" strokeWidth=".38" strokeLinecap="round" opacity=".2" />
              <path d="M5 16l2 -.6 M19 3l4 .3 M24 22l2 -.3" fill="none" stroke="#ffffff" strokeWidth=".5" strokeLinecap="round" opacity=".65" />
            </pattern>
            <clipPath id={ids.clip}><path ref={flapClipRef} d={initial.flap} /></clipPath>
            <clipPath id={ids.underClip}><path ref={underClipRef} d={initial.under} /></clipPath>
          </defs>

          {/* The revealed space is intentionally darker than the pure-white Index. */}
          <path ref={underRef} d={initial.under} fill={`url(#${ids.under})`} />
          <g clipPath={`url(#${ids.underClip})`}>
            <path d="M143 0V112 M170 0V115 M118 32H200 M122 62H200 M155 91H200" stroke="#d7e1e5" strokeOpacity=".18" strokeWidth=".65" fill="none" />
            <path d="M158 16v47h31V16 M163 21v37h21V21" stroke="#edf5f6" strokeOpacity=".32" strokeWidth=".8" fill="none" />
          </g>

          <path ref={broadShadowRef} d={initial.flap} transform={initial.broadShadowOffset} fill="#4e575c" opacity=".09" filter={`url(#${ids.shadow})`} />
          <path ref={contactShadowRef} d={initial.flap} transform={initial.contactShadowOffset} fill="#49545a" opacity=".12" filter={`url(#${ids.contact})`} />
          <g clipPath={`url(#${ids.clip})`}>
            <path d="M0 0H200V200H0Z" fill="#263037" opacity=".42" />
            <g opacity=".3" filter={`url(#${ids.bleed})`} fill="none" stroke="#e0e6e8" strokeWidth="2">
              <path d="M106 38v65h58V38 M118 49v46h34V49 M102 82h68" />
            </g>
          </g>
          <path ref={flapRef} d={initial.flap} fill={`url(#${ids.back})`} stroke="#ffffff" strokeOpacity=".8" strokeWidth=".8" />
          <g clipPath={`url(#${ids.clip})`}>
            <rect width="200" height="200" filter={`url(#${ids.mottle})`} opacity=".55" />
            <path d="M0 0H200V200H0Z" fill={`url(#${ids.fibres})`} opacity=".14" />
          </g>
          <path ref={freeEdgeRef} d={initial.freeEdge} fill="none" stroke="#ffffff" opacity=".5" strokeWidth=".9" />
          <path ref={creaseRef} d={initial.crease} fill="none" stroke={`url(#${ids.ridge})`} strokeWidth="1.6" />
        </svg>
        <span className="paper-corner-b4__label" aria-hidden="true">{label.toUpperCase()} <i>↗</i></span>
      </button>
    );
  },
);
