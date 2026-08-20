import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from "@react-three/postprocessing";
import { useStudy } from "../interaction/studyStore";

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
  const { lampOn } = useStudy();

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={0.35}
        distanceFalloff={0.6}
        intensity={lampOn ? 3.2 : 2.4}
        quality="medium"
        color="#2a2018"
        halfRes
      />
      {/* only the lamp, the screens and the window are ever bright enough to
          bloom, which is what makes the night mode feel lit rather than tinted */}
      <Bloom
        intensity={lampOn ? 0.55 : 0.24}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.32}
        mipmapBlur
      />
      <Vignette offset={0.28} darkness={lampOn ? 0.62 : 0.38} />
      <SMAA />
    </EffectComposer>
  );
}
