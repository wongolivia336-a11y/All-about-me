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

export function Room() {
  return (
    <Suspense fallback={null}>
      <Studio />
      <Shell />
      <Devices />
      <DeskProps />
      <Workbench />
      <Marshall />
      <Bookshelf />
      <Corkboard />
      <Whiteboard />
      <PosterWall />
      <ReadingChair />
      <CameraRig />
      <PostFX />
    </Suspense>
  );
}
