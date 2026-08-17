import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { Devices } from "./Devices";
import { DeskProps } from "./Objects";
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
      <Bookshelf />
      <Corkboard />
      <CameraRig />
    </Suspense>
  );
}
