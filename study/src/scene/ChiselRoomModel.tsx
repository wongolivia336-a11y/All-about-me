import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, MeshStandardMaterial, type Object3D } from "three";
import { Hotspot } from "../interaction/Hotspot";
import { layout } from "./layout";
import { makeFabric, makePlaster, makeWood } from "./textures";
import { cloneChiselMaterials, eachChiselMaterial, FOUR_HEARTS_ROOM_MODEL } from "./chiselModelNodes";

const SHELF_ROOT = "SHELF_interaction_root";

function applyChiselSurfaceTreatment(root: Object3D, surfaces: RoomSurfaces) {
  eachChiselMaterial(root, (material) => {
    if (!(material instanceof MeshStandardMaterial)) return;
    const surface = material;
    const name = material.name.toLowerCase();

    if (name.includes("plaster") || name.includes("chalk")) {
      surface.color.set("#ffffff");
      surface.map = surfaces.plaster.map;
      surface.bumpMap = surfaces.plaster.bumpMap;
      surface.bumpScale = 0.022;
      surface.roughness = 0.94;
    } else if (name.includes("oak")) {
      surface.color.set("#ffffff");
      surface.map = surfaces.oak.map;
      surface.bumpMap = surfaces.oak.bumpMap;
      surface.bumpScale = 0.035;
      surface.roughness = 0.74;
    } else if (name.includes("fabric")) {
      surface.color.set("#ffffff");
      surface.map = surfaces.fabric.map;
      surface.bumpMap = surfaces.fabric.bumpMap;
      surface.bumpScale = 0.014;
      surface.roughness = 0.98;
    } else if (name.includes("graphite")) {
      surface.color.set("#3e4a4d");
      surface.metalness = 0.12;
      surface.roughness = 0.52;
    }
  });
}

type RoomSurfaces = ReturnType<typeof createRoomSurfaces>;

function createRoomSurfaces() {
  return {
    plaster: makePlaster("#f1f0e9", [2.5, 1.5]),
    oak: makeWood("#d4b38b", "#98704a", [1.6, 2]),
    fabric: makeFabric("#eee9df", [2.3, 2.3]),
  };
}

function createRoomParts(source: Group, surfaces: RoomSurfaces) {
  const scene = source.clone(true);
  const shell = new Group();
  shell.name = "chisel-room-envelope";

  for (const child of [...scene.children]) {
    const isWindowSill = child.name === "ARCH_window_sill";
    const isArchitecture = child.name.startsWith("ARCH_") && !isWindowSill;
    const isDesk = child.name.startsWith("HERO_");
    const isRug = child.name === "ENV_rug";

    if (isArchitecture || isDesk || isRug) shell.add(child);
  }

  const shelf = scene.getObjectByName(SHELF_ROOT)?.clone(true);
  if (!shelf) throw new Error(`Chisel room model is missing ${SHELF_ROOT}`);

  const shellWithMaterials = cloneChiselMaterials(shell);
  const shelfWithMaterials = cloneChiselMaterials(shelf);
  applyChiselSurfaceTreatment(shellWithMaterials, surfaces);
  applyChiselSurfaceTreatment(shelfWithMaterials, surfaces);

  return { shell: shellWithMaterials, shelf: shelfWithMaterials };
}

/**
 * Provides the shared room envelope and shelf. Individual named prop meshes
 * are mounted beside their React content layers by their existing components.
 */
export function ChiselRoomModel() {
  const { scene } = useGLTF(FOUR_HEARTS_ROOM_MODEL);
  const surfaces = useMemo(createRoomSurfaces, []);
  const { shell, shelf } = useMemo(() => createRoomParts(scene, surfaces), [scene, surfaces]);

  useEffect(() => () => {
    eachChiselMaterial(shell, (material) => material.dispose());
    eachChiselMaterial(shelf, (material) => material.dispose());
    Object.values(surfaces).forEach(({ map, bumpMap }) => {
      map.dispose();
      bumpMap.dispose();
    });
  }, [shell, shelf, surfaces]);

  return (
    <>
      <primitive object={shell} dispose={null} />
      <Hotspot id="shelf" labelAt={[layout.shelf.pos[0] + 0.3, 1.15, layout.shelf.pos[2]]}>
        <primitive object={shelf} dispose={null} />
      </Hotspot>
    </>
  );
}
