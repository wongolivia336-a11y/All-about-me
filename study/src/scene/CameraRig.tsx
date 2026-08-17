import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { CameraControls } from "@react-three/drei";
import { HOME_CAM, HOME_TARGET, hotspotById } from "../data/hotspots";
import { useStudy } from "../interaction/studyStore";

/**
 * Camera choreography. The visitor can orbit a little for the pleasure of it,
 * but they never *navigate* by flying — clicking an object is what moves them.
 * Angle and distance limits keep them from ending up under the floor or
 * staring at the empty back of the room.
 */
export function CameraRig() {
  const controls = useRef<ComponentRef<typeof CameraControls>>(null);
  const { focused } = useStudy();

  useEffect(() => {
    const spot = focused ? hotspotById(focused) : null;
    const [cx, cy, cz] = spot ? spot.cam : HOME_CAM;
    const [tx, ty, tz] = spot ? spot.target : HOME_TARGET;
    controls.current?.setLookAt(cx, cy, cz, tx, ty, tz, true);
  }, [focused]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.45}
      minDistance={0.32}
      maxDistance={5}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.08}
      minAzimuthAngle={-Math.PI / 2.4}
      maxAzimuthAngle={Math.PI / 2.4}
    />
  );
}
