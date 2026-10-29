import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { ReadingChair } from "./Chair";
import { Devices } from "./Devices";
import { Marshall } from "./Marshall";
import { DeskProps } from "./Objects";
import { PostFX } from "./PostFX";
import { PosterWall } from "./PosterWall";
import { Bookshelf, Corkboard } from "./Shelf";
import { Shell } from "./Shell";
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
        <Shell isNight={isNight} />
      </group>
      <group name="furnishings" userData={{ debugBounds: true }}>
        <Devices />
        <DeskProps />
        <Workbench />
        <Marshall />
        <Bookshelf />
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
