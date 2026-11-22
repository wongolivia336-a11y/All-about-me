import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { ReadingChair } from "./Chair";
import { Devices } from "./Devices";
import { Marshall } from "./Marshall";
import { DeskProps } from "./Objects";
import { PostFX } from "./PostFX";
import { PosterWall } from "./PosterWall";
import { Corkboard } from "./Shelf";
import { ShellWindow } from "./Shell";
import { ChiselRoomModel } from "./ChiselRoomModel";
import { Studio } from "./Studio";
import { Whiteboard } from "./Whiteboard";
import { Workbench } from "./Workbench";
import { SceneDebug } from "./SceneDebug";
import { sceneDebug } from "./debug";

interface RoomProps {
  isNight: boolean;
}

export function Room({ isNight }: RoomProps) {
  return (
    <Suspense fallback={null}>
      <Studio isNight={isNight} />
      <group name="architecture" userData={{ debugBounds: true }}>
        <ChiselRoomModel />
        <ShellWindow isNight={isNight} />
      </group>
      <group name="furnishings" userData={{ debugBounds: true }}>
        <Devices />
        <DeskProps />
        <Workbench />
        <Marshall />
        <Corkboard />
        <Whiteboard />
        <PosterWall />
        <ReadingChair />
      </group>
      <CameraRig />
      {sceneDebug.postFXEnabled && <PostFX />}
      <SceneDebug />
    </Suspense>
  );
}
