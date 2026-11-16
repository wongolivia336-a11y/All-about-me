import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const read = (relativePath) => fs.readFileSync(path.join(scriptDirectory, "..", relativePath), "utf8");

const heartPath = read("src/brand/heartPath.ts");
const wheel = read("src/brand/Heartwheel.tsx");
const themeConfig = read("src/data/themeConfig.ts");
const pageTurn = read("src/PageTurn.css");

assert.match(heartPath, /M 0 0 \$\{HEART_CURVES/);
assert.match(heartPath, /HEART_CURVES\.map/);
assert.doesNotMatch(heartPath, /translate\(50 4\)/);
assert.match(wheel, /<PaperHeart theme=\{theme\} \/>/);
assert.doesNotMatch(wheel, /HeartwheelScene|HeartwheelFallback|heartwheel__hub/);
assert.match(wheel, /viewBox="-170 -170 340 340"/);
assert.match(wheel, /rotate\(\$\{themeConfig\[theme\]\.leafAngle\} 0 0\)/);
assert.match(wheel, /event\.deltaX \|\| \(event\.shiftKey \? event\.deltaY : 0\)/);
assert.doesNotMatch(wheel, /const rawDelta = event\.deltaY \|\| event\.deltaX/);

const leafAngles = [...themeConfig.matchAll(/leafAngle: (\d+)/g)].map((match) => Number(match[1]));
assert.deepEqual(leafAngles, [0, 90, 180, 270]);
assert.equal(new Set(leafAngles).size, 4);
assert.equal(leafAngles[1] - leafAngles[0], 90);
assert.equal(leafAngles[2] - leafAngles[1], 90);
assert.equal(leafAngles[3] - leafAngles[2], 90);

assert.match(pageTurn, /position: fixed;/);
assert.match(pageTurn, /\.paper-corner\s*\{[\s\S]*?top: max\(0px, env\(safe-area-inset-top\)\);/);
assert.match(pageTurn, /right: max\(0px, env\(safe-area-inset-right\)\);/);
assert.match(pageTurn, /width: 88px;[\s\S]*?height: 88px;/);
assert.match(pageTurn, /\.paper-corner__underpage,\s*\.paper-corner__flap\s*\{[\s\S]*?width: 84px;[\s\S]*?height: 84px;/);
assert.match(pageTurn, /@media \(max-width: 720px\)[\s\S]*?width: 72px;[\s\S]*?height: 72px;/);
assert.match(pageTurn, /\.paper-corner__flap\s*\{[\s\S]*?transform-origin: 100% 0;[\s\S]*?filter: drop-shadow/);

console.log("Heartwheel geometry and Paper Corner assertions passed.");
