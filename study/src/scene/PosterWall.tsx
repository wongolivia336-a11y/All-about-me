import { useEffect, useMemo } from "react";
import type * as THREE from "three";
import { films } from "../data/films";
import { Hotspot } from "../interaction/Hotspot";
import { layout } from "./layout";
import { useChiselModelNode } from "./chiselModelNodes";
import { makeChiselPosterTexture } from "./chiselArtDirection";
const POSTER_W = 0.22;
const POSTER_H = 0.33;
const GAP = 0.05;
const COLS = 3;
const POSTER_COUNT = 9;
const POSTER_MODEL_NAMES = [
  "POSTER_01_original_artwork_placeholder",
  "POSTER_02_original_artwork_placeholder",
  "POSTER_03_original_artwork_placeholder",
  "POSTER_04_original_artwork_placeholder",
  "POSTER_05_original_artwork_placeholder",
  "POSTER_06_original_artwork_placeholder",
  "POSTER_07_original_artwork_placeholder",
  "POSTER_08_original_artwork_placeholder",
  "POSTER_09_original_artwork_placeholder",
] as const;
export function PosterWall() {
  const { pos } = layout.posters;
  const artwork = useMemo(
    () => Array.from({ length: POSTER_COUNT }, (_, index) => makeChiselPosterTexture(index)),
    [],
  );
  useEffect(() => () => artwork.forEach((texture) => texture.dispose()), [artwork]);
  return (
    <Hotspot id="posters" labelAt={[pos[0], pos[1] + 0.68, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]}>
        {films.slice(0, POSTER_COUNT).map((film, index) => {
          const col = index % COLS;
          const row = Math.floor(index / COLS);
          return (
            <Poster
              key={film.id}
              texture={artwork[index]}
              modelName={POSTER_MODEL_NAMES[index]}
              x={(col - 1) * (POSTER_W + GAP)}
              y={(1 - row) * (POSTER_H + GAP)}
            />
          );
        })}
      </group>
    </Hotspot>
  );
}
function Poster({
  texture,
  modelName,
  x,
  y,
}: {
  texture: THREE.Texture;
  modelName: string;
  x: number;
  y: number;
}) {
  const poster = useChiselModelNode(modelName);
  return (
    <group position={[x, y, 0]}>
      <primitive object={poster} dispose={null} />
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshStandardMaterial map={texture} roughness={0.94} metalness={0} />
      </mesh>
    </group>
  );
}
