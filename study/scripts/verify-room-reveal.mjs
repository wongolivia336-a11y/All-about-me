import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const app = read("src/App.tsx");
const geometry = read("src/ui/roomRevealGeometry.ts");
const transition = read("src/ui/RoomRevealTransition.tsx");
const pageTurn = read("src/PageTurn.css");
const paperCorner = read("src/ui/PaperCorner.tsx");
const archive = read("src/ui/Archive.tsx");
const heartwheel = read("src/brand/Heartwheel.tsx");
const heartwheelCss = read("src/brand/Heartwheel.css");

assert.match(app, /RoomRevealSurface/);
assert.match(app, /RoomExitButton/);
assert.doesNotMatch(app, /RoomPeek|cornerPeeking/);
assert.match(app, /route\.view === "index" && viewTransition === "idle"/);
assert.doesNotMatch(app, /page-sheet--folding|foldTimer|page-turn-away/);
assert.match(geometry, /safeWidth \+ safeHeight/);
assert.match(geometry, /polygon\(/);
assert.match(transition, /roomRevealClipPath/);
assert.match(pageTurn, /\.room-reveal-surface/);
assert.match(pageTurn, /\.room-exit/);
assert.doesNotMatch(pageTurn, /room-peek|paper-corner--opening/);
assert.match(pageTurn, /\.room-reveal-surface > \.hud/);
assert.doesNotMatch(pageTurn, /page-turn-away|\.page-sheet--folding/);
assert.doesNotMatch(paperCorner, /onPeekChange|onPointerEnter|onFocus/);
assert.match(app, /pointerEvents: route\.view === "room" \? "none" : "auto"/);
assert.match(app, /roomInteractive && \(/);
assert.match(archive, /<LeafCanvas/);
assert.match(archive, /viewMode === "focused"/);
assert.match(heartwheel, /heartwheel__leaf-visual/);
assert.doesNotMatch(heartwheel, /heartwheel__leaf-outline/);
assert.doesNotMatch(heartwheelCss, /\.heartwheel__leaf-outline/);
assert.match(heartwheelCss, /\.heartwheel__leaf--active \.heartwheel__leaf-visual/);

console.log("Room reveal and Leaf & Canvas spatial assertions passed.");
