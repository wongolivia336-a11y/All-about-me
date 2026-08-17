import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { HOME_CAM, HOME_TARGET, hotspotById } from "../data/hotspots";
import { useStudy } from "../interaction/studyStore";

/**
 * The room is about 4.2m wide but the camera's field of view is vertical, so a
 * tall narrow window sees far less of it horizontally and the reading corner
 * falls out of shot. Pull back as the window narrows to keep the whole room
 * framed. Around 1.4 the correction stops, which covers ordinary widescreen;
 * the cap keeps a phone in portrait from ending up across the street.
 */
const pullBackFor = (aspect: number) =>
  Math.min(Math.max(1.42 / Math.max(aspect, 0.45), 1), 1.5);

/**
 * Camera choreography. The visitor can orbit a little for the pleasure of it,
 * but they never *navigate* by flying — clicking an object is what moves them.
 * Angle and distance limits keep them from ending up under the floor or
 * staring at the empty back of the room.
 */
export function CameraRig() {
  const controls = useRef<ComponentRef<typeof CameraControls>>(null);
  const { focused } = useStudy();
  const aspect = useThree((s) => s.size.width / s.size.height);

  useEffect(() => {
    const spot = focused ? hotspotById(focused) : null;
    const [tx, ty, tz] = spot ? spot.target : HOME_TARGET;

    let [cx, cy, cz] = spot ? spot.cam : HOME_CAM;
    if (!spot) {
      // close-ups already frame a single object, so only the overview needs it
      const k = pullBackFor(aspect);
      cx = tx + (cx - tx) * k;
      cy = ty + (cy - ty) * k;
      cz = tz + (cz - tz) * k;
    }

    controls.current?.setLookAt(cx, cy, cz, tx, ty, tz, true);
  }, [focused, aspect]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.45}
      minDistance={0.32}
      maxDistance={9.5}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.08}
      minAzimuthAngle={-Math.PI / 2.4}
      maxAzimuthAngle={Math.PI / 2.4}
    />
  );
}
