import { useEffect, useMemo, useState } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Film } from "../data/films";
import { films } from "../data/films";
import { Hotspot } from "../interaction/Hotspot";
import { layout } from "./layout";
import { makePosterTexture } from "./poster";

const POSTER_W = 0.22;
const POSTER_H = 0.33;
const GAP = 0.05;
const COLS = 3;

export function PosterWall() {
  const { pos } = layout.posters;

  return (
    <Hotspot id="posters" labelAt={[pos[0], pos[1] + 0.68, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]}>
        {films.slice(0, 9).map((film, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          return (
            <Poster
              key={film.id}
              film={film}
              x={(col - 1) * (POSTER_W + GAP)}
              y={(1 - row) * (POSTER_H + GAP)}
            />
          );
        })}
      </group>
    </Hotspot>
  );
}

function Poster({ film, x, y }: { film: Film; x: number; y: number }) {
  // the typeset stand-in is always ready, so the wall never renders empty
  const placeholder = useMemo(() => makePosterTexture(film), [film]);
  const [texture, setTexture] = useState<THREE.Texture>(placeholder);

  // real artwork, if a file has been dropped into public/posters/, replaces it
  useEffect(() => {
    if (!film.poster) return;
    let alive = true;
    new THREE.TextureLoader().load(
      film.poster,
      (tex) => {
        if (!alive) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        setTexture(tex);
      },
      undefined,
      () => {
        /* missing file just leaves the placeholder in place */
      },
    );
    return () => {
      alive = false;
    };
  }, [film.poster]);

  return (
    <group position={[x, y, 0]}>
      <RoundedBox
        args={[POSTER_W + 0.016, POSTER_H + 0.016, 0.014]}
        radius={0.004}
        smoothness={3}
        castShadow
      >
        <meshPhysicalMaterial color="#2c2a28" roughness={0.55} clearcoat={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshStandardMaterial map={texture} roughness={0.72} />
      </mesh>
    </group>
  );
}
