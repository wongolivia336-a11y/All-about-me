import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cdpPort = Number(process.env.STUDY_CDP_PORT || 9225);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5174/";
const outputDir = path.resolve(process.env.CALIBRATION_OUTPUT || "audit/evidence/calibration");
let currentViewport = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
await mkdir(outputDir, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
assert.ok(page, "No Edge page target");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const exceptions = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(`${request.method}: ${message.error.message}`)) : request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timer = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`${method} timed out`));
  }, 30000);
  pending.set(id, {
    resolve: (value) => { clearTimeout(timer); resolve(value); },
    reject: (error) => { clearTimeout(timer); reject(error); },
  });
  pending.get(id).method = method;
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
};
async function waitFor(expression, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(120);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
async function navigate(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set("calibration", String(Date.now()));
  url.hash = hash;
  await send("Page.navigate", { url: url.href });
  await send("Emulation.setDeviceMetricsOverride", currentViewport);
  await waitFor("Boolean(document.querySelector('.archive'))");
  await waitFor("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')", 60000);
  await evaluate("true");
  await sleep(220);
}
async function capture(name) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
}
async function click(selector) {
  const result = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
  assert.equal(result, true, `Missing ${selector}`);
}
async function moveTo(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: "center", inline: "center" })`);
  const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  assert.ok(box, `Missing pointer target ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y, buttons: 0 });
  await sleep(120);
}
async function tap(selector) {
  const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  assert.ok(box, `Missing tap target ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x, y: box.y, button: "left", clickCount: 1 });
}
const checks = [];
const check = (name, condition, observed) => {
  const result = { name, passed: Boolean(condition), observed };
  checks.push(result);
  process.stdout.write(`${result.passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify(observed)}\n`);
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await navigate("#index");
await evaluate("localStorage.setItem('four-hearts-language', 'en')");
await send("Page.reload", { ignoreCache: true });
await waitFor("Boolean(document.querySelector('.archive'))");
await waitFor("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')", 60000);
await sleep(500);
await capture("z0-en-1440x900");
const resume = await evaluate(`({ title: document.querySelector('#archive-title')?.textContent, resume: document.querySelector('#resume')?.innerText, wheel: !!document.querySelector('.heartwheel__stage'), cards: document.querySelectorAll('.leaf-preview').length, hash: location.hash })`);
check("Z0 reads as a resume and keeps a complete clover", resume.title?.includes("A living archive") && resume.resume?.includes("Experience") && resume.wheel && resume.cards === 0 && resume.hash === "#index", resume);

await sleep(450);
await moveTo('[data-heart-theme="build"]');
await evaluate("document.querySelector('[data-heart-theme=build]')?.focus(); true");
await waitFor("document.querySelectorAll('.leaf-preview').length === 1");
await sleep(500);
const preview = await evaluate(`({ hash: location.hash, theme: document.querySelector('.leaf-preview')?.dataset.theme, title: document.querySelector('.leaf-preview strong')?.textContent, rotation: getComputedStyle(document.querySelector('.heartwheel__stage')).getPropertyValue('--heartwheel-rotation') })`);
await capture("z0-hover-build-1440x900");
check("Hover creates one related preview without changing URL", preview.hash === "#index" && preview.theme === "build" && preview.title?.includes("BioAZ"), preview);
await moveTo(".leaf-preview");
await sleep(250);
check("Preview remains stable while pointer crosses from clover to card", await evaluate("document.querySelectorAll('.leaf-preview').length === 1"), await evaluate("({ preview: document.querySelectorAll('.leaf-preview').length, hash: location.hash })"));

await click(".leaf-preview__button");
await waitFor("document.querySelector('.leaf-world') && location.hash === '#index/build'");
await sleep(350);
const world = await evaluate(`({ hash: location.hash, cards: document.querySelectorAll('.leaf-world__card').length, clover: !!document.querySelector('.heartwheel__stage'), title: document.querySelector('.leaf-world h2')?.textContent })`);
await capture("z1-build-1440x900");
check("Preview click becomes a Z1 world while clover remains available", world.hash === "#index/build" && world.cards >= 1 && world.clover, world);

await click('[data-project-entry="bioaz-agent-workbench"]');
await waitFor("document.querySelector('.archive__project-detail') && location.hash.includes('/bioaz-agent-workbench')");
await sleep(300);
const detail = await evaluate(`({ hash: location.hash, title: document.querySelector('.archive__project-detail h2')?.textContent, image: document.querySelector('.archive__project-cover')?.getAttribute('src') })`);
await capture("z2-bioaz-1440x900");
check("World card enters the canonical project detail", detail.hash === "#index/build/bioaz-agent-workbench" && detail.title?.includes("BioAZ"), detail);
await click(".archive__back");
await waitFor("document.querySelector('.leaf-world') && !document.querySelector('.archive__project-detail')");
check("Back returns to the source world", await evaluate("location.hash === '#index/build' && document.querySelector('.leaf-world')?.dataset"), await evaluate("({ hash: location.hash, world: !!document.querySelector('.leaf-world') })"));

await tap('[data-heart-theme="question"]');
await waitFor("document.querySelector('.leaf-world h2')?.textContent.includes('Things I question')");
const question = await evaluate("({ hash: location.hash, title: document.querySelector('.leaf-world h2')?.textContent, active: document.querySelector('[data-heart-theme=question]')?.getAttribute('aria-pressed') })");
check("Z1 can switch themes without leaving the world", question.hash === "#index/question" && question.active === "true", question);

await click('.language-switch button[lang="zh-CN"]');
await waitFor("document.documentElement.lang === 'zh-CN'");
const chinese = await evaluate("({ lang: document.documentElement.lang, hero: document.querySelector('#archive-title')?.textContent, world: document.querySelector('.leaf-world h2')?.textContent, experience: document.querySelector('#resume')?.innerText.includes('实习') })");
await capture("z1-question-zh-1440x900");
check("Chinese copy reaches resume, world and document language", chinese.lang === "zh-CN" && chinese.hero?.includes("记录我构建") && chinese.world?.includes("追问") && chinese.experience, chinese);

currentViewport = { width: 390, height: 844, deviceScaleFactor: 1, mobile: true };
process.stdout.write("MOBILE: set viewport\n");
await send("Emulation.setDeviceMetricsOverride", currentViewport);
process.stdout.write("MOBILE: navigate\n");
await navigate("#index");
process.stdout.write("MOBILE: capture z0\n");
await capture("z0-zh-mobile-390x844");
process.stdout.write("MOBILE: click question\n");
await click('[data-heart-theme="question"]');
process.stdout.write("MOBILE: wait world\n");
await waitFor("location.hash === '#index/question' && Boolean(document.querySelector('.leaf-world'))");
const mobile = await evaluate("({ hash: location.hash, overflow: document.documentElement.scrollWidth > innerWidth, world: !!document.querySelector('.leaf-world'), back: !!document.querySelector('.leaf-world__header > button') })");
await capture("z1-question-zh-mobile-390x844");
check("Mobile single tap enters Z1 without hover or horizontal overflow", mobile.hash === "#index/question" && !mobile.overflow && mobile.world && mobile.back, mobile);

await tap(".paper-corner");
await waitFor("location.hash === '#room' && Boolean(document.querySelector('.room-reveal-surface'))", 60000);
await sleep(150);
const roomMid = await evaluate("({ hash: location.hash, corner: !!document.querySelector('.paper-corner'), reveal: !!document.querySelector('.room-reveal-surface') })");
await capture("room-mid-mobile-390x844");
check("Room still enters through the existing route and reveal", roomMid.hash === "#room" && !roomMid.corner && roomMid.reveal, roomMid);
await waitFor("document.querySelector('.room-reveal-surface')?.dataset.revealInteractive === 'true'", 120000);
await sleep(250);
await capture("room-ready-mobile-390x844");
await tap(".room-exit");
await waitFor("location.hash.startsWith('#index') && !document.querySelector('.room-reveal-surface')", 120000);
check("Room exits back to Index", await evaluate("location.hash.startsWith('#index')"), await evaluate("({ hash: location.hash })"));

const report = { checks, exceptions, outputDir, url: baseUrl };
await writeFile(path.join(outputDir, "calibration-report.json"), JSON.stringify(report, null, 2));
socket.close();
assert.equal(checks.every((result) => result.passed), true, "One or more browser checks failed");
assert.equal(exceptions.length, 0, `Browser exceptions: ${exceptions.join(" | ")}`);
process.stdout.write(`CALIBRATION_OK ${JSON.stringify(report)}\n`);

