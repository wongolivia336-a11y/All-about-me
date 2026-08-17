import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { ReadingChair } from "./Chair";
import { Devices } from "./Devices";
import { Marshall } from "./Marshall";
import { DeskProps } from "./Objects";
import { PosterWall } from "./PosterWall";
import { Bookshelf, Corkboard } from "./Shelf";
import { Shell } from "./Shell";
import { Studio } from "./Studio";

export function Room() {
  return (
    <Suspense fallback={null}>
      <Studio />
      <Shell />
      <Devices />
      <DeskProps />
      <Marshall />
      <Bookshelf />
      <Corkboard />
      <PosterWall />
      <ReadingChair />
      <CameraRig />
    </Suspense>
  );
}
