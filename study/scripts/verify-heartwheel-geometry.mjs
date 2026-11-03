import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const read = (relativePath) => fs.readFileSync(path.join(scriptDirectory, "..", relativePath), "utf8");

const texture = read("src/brand/HeartTextTexture.tsx");
const wheel = read("src/brand/Heartwheel.tsx");
const themeConfig = read("src/data/themeConfig.ts");
const pageTurn = read("src/PageTurn.css");

assert.match(texture, /"M 0 0 C/);
assert.doesNotMatch(texture, /translate\(50 4\)/);
assert.match(wheel, /viewBox="-170 -170 340 340"/);
assert.match(wheel, /rotate\(\$\{themeConfig\[theme\]\.leafAngle\} 0 0\)/);

const leafAngles = [...themeConfig.matchAll(/leafAngle: (\d+)/g)].map((match) => Number(match[1]));
assert.deepEqual(leafAngles, [0, 90, 180, 270]);
assert.equal(new Set(leafAngles).size, 4);
assert.equal(leafAngles[1] - leafAngles[0], 90);
assert.equal(leafAngles[2] - leafAngles[1], 90);
assert.equal(leafAngles[3] - leafAngles[2], 90);

assert.match(pageTurn, /position: fixed;/);
assert.match(pageTurn, /top: max\(12px, env\(safe-area-inset-top\)\);/);
assert.match(pageTurn, /right: max\(12px, env\(safe-area-inset-right\)\);/);
assert.match(pageTurn, /width: 72px;/);
assert.match(pageTurn, /height: 72px;/);
assert.match(pageTurn, /width: 52px;/);
assert.match(pageTurn, /height: 52px;/);

console.log("Heartwheel geometry and Paper Corner assertions passed.");
