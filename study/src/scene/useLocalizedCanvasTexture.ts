import { useEffect, useMemo, useRef } from "react";
import type { Texture } from "three";
import type { Language } from "../i18n";

export function useLocalizedCanvasTexture(
  language: Language,
  create: (language: Language) => Texture,
) {
  const texture = useMemo(() => create(language), [create, language]);
  const current = useRef<Texture | null>(null);

  useEffect(() => {
    current.current = texture;
    return () => {
      if (current.current === texture) current.current = null;
      queueMicrotask(() => {
        if (current.current !== texture) texture.dispose();
      });
    };
  }, [texture]);

  return texture;
}
