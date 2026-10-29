import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import {
  BACK_WALL_Z,
  DESK_TOP_Y,
  LEFT_WALL_X,
  ROOM_BOUNDS,
  WINDOW_OPENING,
} from "./layout";
import { palette } from "./theme";
import { makeFabric, makePlaster, makeWood } from "./textures";

interface ShellProps {
  isNight: boolean;
}

export function Shell({ isNight }: ShellProps) {
  const floor = useMemo(
    () => makeWood("#b08a5f", "#7a5636", [5, 5], { planks: 7 }),
    [],
  );
  const wall = useMemo(() => makePlaster(palette.wall, [4, 2]), []);
  const wallSide = useMemo(() => makePlaster(palette.wallShadow, [4, 2]), []);

  return (
    <group>
      <DioramaFloor floor={floor} />
      <BackWall wall={wall} />
      <LeftWall wall={wallSide} />
      <Skirting />

      <Window isNight={isNight} />
      <Rug />
      <Desk />
    </group>
  );
}

type SurfaceMaps = ReturnType<typeof makeWood>;

function DioramaFloor({ floor }: { floor: SurfaceMaps }) {
  const width = ROOM_BOUNDS.right - ROOM_BOUNDS.left + ROOM_BOUNDS.wallThickness;
  const depth = ROOM_BOUNDS.front - ROOM_BOUNDS.back + ROOM_BOUNDS.wallThickness;

  return (
    <RoundedBox
      args={[width, ROOM_BOUNDS.floorThickness, depth]}
      radius={0.012}
      smoothness={2}
      position={[
        (ROOM_BOUNDS.left + ROOM_BOUNDS.right - ROOM_BOUNDS.wallThickness) / 2,
        -ROOM_BOUNDS.floorThickness / 2,
        (ROOM_BOUNDS.back + ROOM_BOUNDS.front - ROOM_BOUNDS.wallThickness) / 2,
      ]}
      receiveShadow
    >
      <meshStandardMaterial
        map={floor.map}
        bumpMap={floor.bumpMap}
        bumpScale={0.18}
        roughness={0.62}
      />
    </RoundedBox>
  );
}

function BackWall({ wall }: { wall: SurfaceMaps }) {
  const width = ROOM_BOUNDS.right - ROOM_BOUNDS.left;
  return (
    <mesh
      position={[
        (ROOM_BOUNDS.left + ROOM_BOUNDS.right) / 2,
        ROOM_BOUNDS.height / 2,
        BACK_WALL_Z - ROOM_BOUNDS.wallThickness / 2,
      ]}
      receiveShadow
      castShadow
    >
      <boxGeometry args={[width, ROOM_BOUNDS.height, ROOM_BOUNDS.wallThickness]} />
      <meshStandardMaterial
        map={wall.map}
        bumpMap={wall.bumpMap}
        bumpScale={0.055}
        roughness={0.96}
      />
    </mesh>
  );
}

/** A segmented wall makes the window an actual void, not a glowing decal. */
function LeftWall({ wall }: { wall: SurfaceMaps }) {
  const centerZ = (ROOM_BOUNDS.back + ROOM_BOUNDS.front) / 2;
  const depth = ROOM_BOUNDS.front - ROOM_BOUNDS.back;
  const openingBack = WINDOW_OPENING.centerZ - WINDOW_OPENING.width / 2;
  const openingFront = WINDOW_OPENING.centerZ + WINDOW_OPENING.width / 2;
  const openingTop = WINDOW_OPENING.bottom + WINDOW_OPENING.height;
  const x = LEFT_WALL_X - ROOM_BOUNDS.wallThickness / 2;

  const segment = (
    key: string,
    position: [number, number, number],
    size: [number, number, number],
  ) => (
    <mesh key={key} position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={wall.map}
        bumpMap={wall.bumpMap}
        bumpScale={0.055}
        roughness={0.96}
      />
    </mesh>
  );

  return (
    <group>
      {segment(
        "below-window",
        [x, WINDOW_OPENING.bottom / 2, centerZ],
        [ROOM_BOUNDS.wallThickness, WINDOW_OPENING.bottom, depth],
      )}
      {segment(
        "above-window",
        [x, openingTop + (ROOM_BOUNDS.height - openingTop) / 2, centerZ],
        [
          ROOM_BOUNDS.wallThickness,
          ROOM_BOUNDS.height - openingTop,
          depth,
        ],
      )}
      {segment(
        "window-back-return",
        [x, WINDOW_OPENING.bottom + WINDOW_OPENING.height / 2, (ROOM_BOUNDS.back + openingBack) / 2],
        [ROOM_BOUNDS.wallThickness, WINDOW_OPENING.height, openingBack - ROOM_BOUNDS.back],
      )}
      {segment(
        "window-front-return",
        [x, WINDOW_OPENING.bottom + WINDOW_OPENING.height / 2, (openingFront + ROOM_BOUNDS.front) / 2],
        [ROOM_BOUNDS.wallThickness, WINDOW_OPENING.height, ROOM_BOUNDS.front - openingFront],
      )}
    </group>
  );
}

function Skirting() {
  const width = ROOM_BOUNDS.right - ROOM_BOUNDS.left;
  const depth = ROOM_BOUNDS.front - ROOM_BOUNDS.back;
  const y = 0.055;

  return (
    <group>
      <mesh position={[(ROOM_BOUNDS.left + ROOM_BOUNDS.right) / 2, y, BACK_WALL_Z + 0.012]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.11, 0.024]} />
        <meshStandardMaterial color="#e6e0d4" roughness={0.7} />
      </mesh>
      <mesh position={[LEFT_WALL_X + 0.012, y, (ROOM_BOUNDS.back + ROOM_BOUNDS.front) / 2]} receiveShadow castShadow>
        <boxGeometry args={[0.024, 0.11, depth]} />
        <meshStandardMaterial color="#e6e0d4" roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * A low-cost exterior layer is enough for the diorama, but it now sits beyond
 * real glass, a sill and a frame inside an actual wall opening.
 */
function Window({ isNight }: ShellProps) {
  const frameDepth = 0.065;
  const frameWidth = 0.055;
  const glassX = LEFT_WALL_X - ROOM_BOUNDS.wallThickness - 0.008;
  const frameX = LEFT_WALL_X + frameDepth / 2;
  const bottom = WINDOW_OPENING.bottom;
  const top = bottom + WINDOW_OPENING.height;
  const z = WINDOW_OPENING.centerZ;
  const halfWidth = WINDOW_OPENING.width / 2;

  return (
    <group>
      {/* exterior sky: intentionally simple, but spatially behind the wall */}
      <mesh position={[glassX - 0.012, bottom + WINDOW_OPENING.height / 2, z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[WINDOW_OPENING.width, WINDOW_OPENING.height]} />
        <meshBasicMaterial
          color={isNight ? "#1d2740" : "#dcecff"}
          toneMapped={false}
          side={2}
        />
      </mesh>

      <mesh position={[glassX, bottom + WINDOW_OPENING.height / 2, z]}>
        <boxGeometry args={[0.006, WINDOW_OPENING.height - 0.06, WINDOW_OPENING.width - 0.06]} />
        <meshPhysicalMaterial
          color={isNight ? "#8ca6ca" : "#d8ebff"}
          transparent
          opacity={isNight ? 0.24 : 0.16}
          roughness={0.08}
          metalness={0}
        />
      </mesh>

      {/* sill returns into the room, giving the opening depth and a shadow lip */}
      <mesh position={[LEFT_WALL_X + 0.09, bottom - 0.026, z]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.052, WINDOW_OPENING.width + 0.11]} />
        <meshStandardMaterial color="#eee9df" roughness={0.68} />
      </mesh>

      {[
        { p: [frameX, bottom, z], s: [frameDepth, frameWidth, WINDOW_OPENING.width + frameWidth * 2] },
        { p: [frameX, top, z], s: [frameDepth, frameWidth, WINDOW_OPENING.width + frameWidth * 2] },
        { p: [frameX, bottom + WINDOW_OPENING.height / 2, z - halfWidth], s: [frameDepth, WINDOW_OPENING.height, frameWidth] },
        { p: [frameX, bottom + WINDOW_OPENING.height / 2, z + halfWidth], s: [frameDepth, WINDOW_OPENING.height, frameWidth] },
        { p: [frameX, bottom + WINDOW_OPENING.height / 2, z], s: [frameDepth * 0.75, WINDOW_OPENING.height - frameWidth * 2, 0.028] },
      ].map((bar, index) => (
        <mesh
          key={index}
          position={bar.p as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={bar.s as [number, number, number]} />
          <meshPhysicalMaterial
            color="#f4f1ea"
            roughness={0.42}
            clearcoat={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function Rug() {
  const cloth = useMemo(() => makeFabric("#d9d1c2", [9, 6]), []);
  return (
    <RoundedBox
      args={[2.9, 0.014, 1.9]}
      radius={0.006}
      smoothness={2}
      position={[0.15, 0.007, -0.25]}
      receiveShadow
    >
      <meshStandardMaterial
        map={cloth.map}
        bumpMap={cloth.bumpMap}
        bumpScale={0.2}
        roughness={0.98}
      />
    </RoundedBox>
  );
}

function Desk() {
  const oak = useMemo(() => makeWood("#d8b489", "#a3784a", [2, 1]), []);
  const oakEnd = useMemo(() => makeWood("#cfa878", "#9a713f", [1, 1]), []);

  const slabThickness = 0.045;
  const slabY = DESK_TOP_Y - slabThickness / 2;
  const legY = slabY - slabThickness / 2;
  const drawerY = slabY - 0.09;
  const drawerCenterX = -0.5;
  const drawerCenterZ = -1.05;
  const legs: [number, number][] = [
    [-0.78, -1.32],
    [0.78, -1.32],
    [-0.78, -0.78],
    [0.78, -0.78],
  ];

  return (
    <group>
      <RoundedBox
        args={[1.7, slabThickness, 0.72]}
        radius={0.012}
        smoothness={4}
        position={[0, slabY, -1.05]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={oak.map}
          bumpMap={oak.bumpMap}
          bumpScale={0.25}
          roughness={0.42}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
        />
      </RoundedBox>

      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, legY / 2, z]} castShadow>
          <cylinderGeometry args={[0.021, 0.019, legY, 20]} />
          <meshStandardMaterial
            color={palette.deskLeg}
            metalness={0.85}
            roughness={0.32}
          />
        </mesh>
      ))}

      {/* stretcher between the legs — desks this thin need one, and it gives
          the shadow under the desk something to describe */}
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.14, -1.05]} castShadow>
          <boxGeometry args={[0.016, 0.016, 0.5]} />
          <meshStandardMaterial color={palette.deskLeg} metalness={0.85} roughness={0.32} />
        </mesh>
      ))}

      {/*
        The drawer now has visible side runners under the slab, so the 18mm
        clearance is a believable slide gap instead of an unexplained void.
        The separate front creates a readable face/reveal without making the
        drawer body intersect the desk's front edge.
      */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[drawerCenterX + side * 0.325, slabY - 0.036, drawerCenterZ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.018, 0.022, 0.55]} />
          <meshStandardMaterial color="#737378" metalness={0.88} roughness={0.32} />
        </mesh>
      ))}

      {/* a shallow drawer under the top — holds the CV */}
      <RoundedBox
        args={[0.62, 0.1, 0.6]}
        radius={0.01}
        smoothness={3}
        position={[drawerCenterX, drawerY, drawerCenterZ]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={oakEnd.map}
          bumpMap={oakEnd.bumpMap}
          bumpScale={0.2}
          roughness={0.5}
          clearcoat={0.25}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.66, 0.118, 0.022]}
        radius={0.008}
        smoothness={3}
        position={[drawerCenterX, drawerY, -0.724]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={oakEnd.map}
          bumpMap={oakEnd.bumpMap}
          bumpScale={0.16}
          roughness={0.48}
          clearcoat={0.2}
        />
      </RoundedBox>
      <mesh position={[drawerCenterX, drawerY, -0.708]} castShadow>
        <boxGeometry args={[0.16, 0.012, 0.014]} />
        <meshStandardMaterial color={palette.brass} metalness={0.9} roughness={0.28} />
      </mesh>
    </group>
  );
}
