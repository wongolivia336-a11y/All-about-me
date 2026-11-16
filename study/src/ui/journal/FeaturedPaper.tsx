import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n";
import type { PaperCrumpleState } from "./PaperCrumple";

const PaperCrumple = lazy(() => import("./PaperCrumple"));

const paperSurface = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="440" viewBox="0 0 640 440"><rect width="640" height="440" fill="#fafcfb"/><path d="M0 84.5h640M0 356.5h640" stroke="#e8eeeb" stroke-width="1" opacity=".52"/><path d="M32 30h24M584 410h24" stroke="#dfe7e4" stroke-width="2" opacity=".6"/></svg>',
)}`;

export function FeaturedPaper({ active, disabled }: { active: boolean; disabled: boolean }) {
  const { copy } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const [mountCanvas, setMountCanvas] = useState(false);
  const [paperState, setPaperState] = useState<PaperCrumpleState>("flat");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setMountCanvas(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setMountCanvas(true);
        observer.disconnect();
      },
      { rootMargin: "140px 0px", threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (active) return;
    setPaperState("flat");
    setFailed(false);
  }, [active]);

  const stateLabel = paperState === "holding"
    ? copy.journalPaperHolding
    : paperState === "creased"
      ? copy.journalPaperCreased
      : paperState === "crumpled"
        ? copy.journalPaperCrumpled
        : copy.journalPaperFlat;

  return (
    <div className="journal-paper-object" ref={rootRef}>
      <div className="journal-paper-object__frame">
        {mountCanvas && active ? (
          <Suspense fallback={<div className="journal-paper-object__placeholder" aria-hidden="true"><span /></div>}>
            <PaperCrumple
              src={paperSurface}
              alt={copy.journalPaperAlt}
              interactionInstructions={copy.journalPaperInstructions}
              loadingLabel={copy.journalPaperLoading}
              errorLabel={copy.journalPaperError}
              width={460}
              height={300}
              sceneHeight={340}
              style={{ height: "100%" }}
              releaseBehavior="creased"
              crumpleAmount={0.78}
              crumpleDuration={0.68}
              releaseDuration={0.82}
              foldCount={5}
              foldSharpness={0.42}
              wrinkleDepth={0.34}
              creaseStrength={0.3}
              paperColor="#fafcfb"
              roughness={0.94}
              paperTexture={0.045}
              lightIntensity={1.25}
              lightAngle={-28}
              shadow
              shadowOpacity={0.055}
              dragRotation={6}
              dragRadius={96}
              detail={44}
              disabled={disabled}
              onStateChange={setPaperState}
              onError={(error) => setFailed(error !== null)}
            />
          </Suspense>
        ) : (
          <div className="journal-paper-object__placeholder" aria-hidden="true">
            <span />
          </div>
        )}
        <span className="journal-paper-object__folio-mark" aria-hidden="true">FH / J</span>
        {failed && <span className="journal-paper-object__fallback-note">{copy.journalPaperError}</span>}
      </div>
      <p className="journal-paper-object__hint">
        <span aria-hidden="true">↔</span> {copy.journalPaperHint}
        <span className="journal-paper-object__state" role="status" aria-live="polite">{stateLabel}</span>
      </p>
    </div>
  );
}

