import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from "@react-three/postprocessing";
import { usePostFXLighting } from "../interaction/studyStore";

/**
 * Post-processing.
 *
 * Ambient occlusion is the single biggest step up in perceived quality here.
 * Without it every joint in the room is lit identically to the open surfaces
 * around it, so the desk looks like it is hovering, the shelf compartments
 * have no depth, and objects sitting on the desk look pasted on. N8AO darkens
 * exactly those creases and the whole room stops reading as flat plastic.
 *
 * aoRadius is in metres, matching the scene's real scale — 0.35 catches the
 * gap under the desk and the shelf recesses without smearing shadow across
 * whole walls.
 */
export function PostFX() {
  const { isNight, effectiveBrightness } = usePostFXLighting();
  // Time of day establishes the spatial mood. The dimmer only adds a subtle
  // local response, so a daytime task light cannot accidentally turn the
  // complete room into a night-grade post-processing treatment.
  const aoIntensity = isNight ? 2.45 + effectiveBrightness * 0.25 : 2.35;
  const bloomIntensity = isNight
    ? 0.16 + effectiveBrightness * 0.82
    : 0.06 + effectiveBrightness * 0.35;
  const vignetteDarkness = isNight ? 0.52 - effectiveBrightness * 0.13 : 0.34;

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={0.35}
        distanceFalloff={0.6}
        intensity={aoIntensity}
        quality="medium"
        color="#2a2018"
        halfRes
      />
      {/*
        The lamp bulb is rendered above one luminance with tone mapping off.
        A threshold of 1 therefore gives it a private, warm bloom without
        making whiteboards, windows or interface textures haze over.
      */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={1}
        luminanceSmoothing={0.16}
        mipmapBlur
      />
      <Vignette offset={0.28} darkness={vignetteDarkness} />
      <SMAA />
    </EffectComposer>
  );
}
