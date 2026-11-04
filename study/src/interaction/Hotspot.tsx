import { useState } from "react";
import type { ReactNode } from "react";
import { Html, useCursor } from "@react-three/drei";
import type { HotspotId } from "../data/hotspots";
import { hotspotById } from "../data/hotspots";
import { useFocusedRoom } from "./studyStore";
import { hotspotText, useLanguage } from "../i18n";

interface Props {
  id: HotspotId;
  children: ReactNode;
  /** where the floating label sits, in the hotspot's local space */
  labelAt?: [number, number, number];
  /**
   * Overrides the default push-the-camera-in behaviour. The desk lamp uses
   * this to flip the lights instead of becoming a destination.
   */
  onSelect?: () => void;
  /**
   * Runs *alongside* the default behaviour rather than replacing it, for
   * objects that react to being touched as well as opening. The cat both
   * startles and opens her panel.
   */
  onActivate?: () => void;
}

/**
 * Wraps a cluster of geometry and turns it into a clickable object.
 * Click pushes the camera in; clicking the focused object again pulls back out.
 * The label only shows in the overview — once you are pushed in, it would just
 * be in the way.
 */
export function Hotspot({
  id,
  children,
  labelAt = [0, 0.16, 0],
  onSelect,
  onActivate,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const { language } = useLanguage();
  const { focused, focus } = useFocusedRoom();
  useCursor(hovered);

  const spot = hotspotById(id);
  const localizedSpot = hotspotText(id, language, spot);
  const isFocused = focused === id;
  const showLabel = hovered && focused === null;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActivate?.();
        if (onSelect) onSelect();
        else focus(isFocused ? null : id);
      }}
    >
      {children}

      {showLabel && (
        <Html position={labelAt} center distanceFactor={2.2} zIndexRange={[20, 0]}>
          <div className="hotspot-label">
            <span className="hotspot-label__title">{localizedSpot.label}</span>
            <span className="hotspot-label__blurb">{localizedSpot.blurb}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
