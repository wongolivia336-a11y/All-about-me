/** Browser regression against a running local Edge DevTools endpoint. */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const port = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5173/";
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("No browser page target");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const errors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") {
    const detail = message.params.exceptionDetails;
    errors.push({ text: detail.text, url: detail.url, line: detail.lineNumber,
      description: detail.exception?.description || null });
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timeout = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`${method} timed out`));
  }, 30000);
  pending.set(id, {
    resolve: (value) => { clearTimeout(timeout); resolve(value); },
    reject: (error) => { clearTimeout(timeout); reject(error); },
  });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
async function until(expression, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
async function navigate(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set("regression", String(Date.now()));
  url.hash = hash;
  await send("Page.navigate", { url: url.href });
}
async function readyRoom() {
  await until("Boolean(document.querySelector('.hud') && document.querySelector('.ascii-loader--hidden'))", 60000);
  await sleep(1800);
  await evaluate("import('/src/interaction/studyStore.ts').then(m => { m.setNightMode(false); m.focus(null); })");
  await sleep(1200);
}
async function mouse(x, y, type, buttons = 0) {
  await send("Input.dispatchMouseEvent", {
    type, x, y, button: type === "mouseMoved" ? "none" : "left",
    buttons, clickCount: type === "mouseMoved" ? 0 : 1,
  });
}
async function click3d(x, y) {
  await mouse(x, y, "mouseMoved");
  await mouse(x, y, "mousePressed", 1);
  await mouse(x, y, "mouseReleased");
  await sleep(600);
}
async function key(key, code, virtualKeyCode) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: virtualKeyCode });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: virtualKeyCode });
}
const checks = [];
const check = (name, passed, observed) => {
  checks.push({ name, passed: Boolean(passed), observed });
  process.stdout.write(`${passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify(observed)}\n`);
};
const snapshot = () => evaluate(`({ hash:location.hash, archive:!!document.querySelector('.archive'),
  hud:!!document.querySelector('.hud'), panel:document.querySelector('.panel__title')?.textContent || null,
  canvas:[...document.querySelectorAll('canvas')].some(c => Boolean(c.getContext('webgl2'))),
  lamp:document.querySelector('button[aria-label*="台灯"]')?.getAttribute('aria-label') || null,
  brightness:document.querySelector('.hud__brightness')?.value || null })`);

try {
  await Promise.all([send("Page.enable"), send("Runtime.enable")]);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await navigate("#index");
  await until("Boolean(document.querySelector('.archive'))");
  let state = await snapshot();
  check("Index opens without WebGL", state.archive && !state.canvas && !state.hud, state);
  check("Index starts with keyboard focus", await evaluate("document.activeElement?.classList.contains('archive__close')"),
    await evaluate("document.activeElement?.textContent"));

  await evaluate("document.querySelector('.archive__close').click()");
  await readyRoom();
  state = await snapshot();
  check("Room entry and ASCII loader settle", state.hash === "#room" && state.hud && state.canvas && !state.archive, state);
  check("Room restores Index trigger focus", await evaluate("document.activeElement?.textContent?.trim() === 'Index'"),
    await evaluate("document.activeElement?.textContent"));

  const lifecycle = [];
  for (let index = 0; index < 3; index++) {
    lifecycle.push(await evaluate("window.__studyRenderInfo?.() || null"));
    await evaluate("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Index').click()");
    await until("Boolean(document.querySelector('.archive'))");
    await evaluate("document.querySelector('.archive__close').click()");
    await readyRoom();
  }
  const noGrowth = lifecycle.every((entry) => entry &&
    entry.geometries === lifecycle[0].geometries &&
    entry.textures <= lifecycle[0].textures) &&
    lifecycle.slice(1).every((entry) => entry.textures === lifecycle[1].textures);
  check("Three Room reentries show no resource growth", noGrowth, lifecycle);

  await evaluate("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Index').click()");
  await until("Boolean(document.querySelector('.archive'))");
  await evaluate("history.back()");
  await until("Boolean(document.querySelector('.hud'))");
  check("Browser history returns to Room", (await snapshot()).hash === "#room", await snapshot());

  const initialLamp = await snapshot();
  await evaluate("document.querySelector('button[aria-label=\"打开台灯\"]').click()");
  state = await snapshot();
  check("HUD power switches on", state.lamp === "关闭台灯", state);
  await evaluate("document.querySelector('.hud__brightness').focus()");
  await key("End", "End", 35);
  state = await snapshot();
  check("HUD range keyboard reaches 100%", state.brightness === "100", state);
  await evaluate("document.querySelector('button[aria-label=\"关闭台灯\"]').click()");
  state = await snapshot();
  check("HUD power switches off and retains preset", state.lamp === "打开台灯" && state.brightness === "100", { initialLamp, state });

  const focusIds = ["laptop", "phone", "portfolio", "shelf", "camera", "board", "marshall", "posters", "domi", "sketchbook", "materials", "whiteboard", "lamp"];
  for (const id of focusIds) {
    await evaluate(`import('/src/interaction/studyStore.ts').then(m => m.focus(${JSON.stringify(id)}))`);
    await sleep(120);
    const surface = await evaluate("Boolean(document.querySelector('.panel, .viewer'))");
    if (id === "lamp") {
      await sleep(1200);
      const target = await evaluate("window.__studyCameraControls?.getTarget().toArray() || null");
      check("Lamp camera focus", target && Math.abs(target[0] + 0.68) < 0.1, target);
    } else {
      check(`Focus surface: ${id}`, surface, await evaluate("document.querySelector('.panel__title')?.textContent || document.querySelector('aside')?.className || null"));
    }
  }
  await evaluate("import('/src/interaction/studyStore.ts').then(m => m.focus(null))");
  await sleep(1500);

  await click3d(928, 550);
  state = await snapshot();
  check("Domi pointer opens content", state.panel === "多米", state);
  await key("Escape", "Escape", 27);
  await sleep(800);
  check("Escape closes object focus", (await snapshot()).panel === null, await snapshot());

  await click3d(594, 406);
  state = await snapshot();
  check("Laptop pointer routes to Work Index", state.archive && state.hash === "#index", state);
  if (state.archive) {
    await evaluate("document.querySelector('.archive__close').click()");
    await readyRoom();
  }
  await click3d(456, 272);
  state = await snapshot();
  check("Whiteboard pointer routes to Research Index", state.archive && state.hash === "#index", state);
  if (state.archive) {
    await evaluate("document.querySelector('.archive__close').click()");
    await readyRoom();
  }
  await click3d(202, 354);
  state = await snapshot();
  check("Shelf pointer opens Reading", state.panel !== null, state);
  await key("Escape", "Escape", 27);
  await sleep(700);

  await evaluate("import('/src/interaction/studyStore.ts').then(m => {m.setLampBrightness(.5); m.focus('lamp')})");
  await sleep(1800);
  const powerBeforeDial = (await snapshot()).lamp;
  await click3d(630, 410);
  state = await snapshot();
  check("Physical dial short press changes power", state.lamp !== powerBeforeDial, { before: powerBeforeDial, after: state.lamp });
  const beforeDrag = Number(state.brightness);
  await mouse(630, 410, "mouseMoved");
  await mouse(630, 410, "mousePressed", 1);
  await mouse(648, 410, "mouseMoved", 1);
  await mouse(665, 410, "mouseMoved", 1);
  await mouse(665, 410, "mouseReleased");
  state = await snapshot();
  check("Physical dial drag changes continuous brightness", Number(state.brightness) > beforeDrag && Number(state.brightness) < 80,
    { beforeDrag, after: state.brightness });

  await evaluate("import('/src/interaction/studyStore.ts').then(m => m.setLampBrightness(.5))");
  const powerBeforeRapid = (await snapshot()).lamp;
  await mouse(630, 410, "mouseMoved");
  await mouse(630, 410, "mousePressed", 1);
  for (const x of [650, 740, 560, 695]) await mouse(x, 410, "mouseMoved", 1);
  await mouse(695, 410, "mouseReleased");
  state = await snapshot();
  check("Rapid physical drag keeps power stable", state.lamp === powerBeforeRapid && Number(state.brightness) >= 0 && Number(state.brightness) <= 100, state);

  await evaluate("import('/src/interaction/studyStore.ts').then(m => m.setLampBrightness(.5))");
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 630, y: 410, id: 1 }] });
  await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 700, y: 410, id: 1 }] });
  const duringCancel = (await snapshot()).brightness;
  await send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await sleep(250);
  state = await snapshot();
  check("Cancelled physical drag restores preset", Number(duringCancel) !== 50 && state.brightness === "50", { duringCancel, after: state.brightness });

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await navigate("#room");
  await readyRoom();
  const mobilePowerPoint = await evaluate(`(() => {const r=document.querySelector('button[aria-label="打开台灯"]').getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...mobilePowerPoint, id: 1 }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  check("Mobile touch operates lamp HUD", (await snapshot()).lamp === "关闭台灯", await snapshot());
  const touchPoint = await evaluate(`(() => {const r=[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Index').getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...touchPoint, id: 1 }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(500);
  state = await snapshot();
  check("Mobile touch opens Index fallback", state.archive && state.hash === "#index", state);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await navigate("#room");
  await readyRoom();
  await evaluate("import('/src/interaction/studyStore.ts').then(m => m.focus('domi'))");
  await sleep(3000);
  const movingA = await evaluate("window.__studyDomiPose?.() || null");
  await sleep(1500);
  const movingB = await evaluate("window.__studyDomiPose?.() || null");
  check("Domi idles with ordinary motion preference", JSON.stringify(movingA) !== JSON.stringify(movingB), [movingA, movingB]);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  check("Reduced motion media query is available", await evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"), true);
  await sleep(400);
  const stillA = await evaluate("window.__studyDomiPose?.() || null");
  await sleep(1500);
  const stillB = await evaluate("window.__studyDomiPose?.() || null");
  check("Reduced motion holds Domi's idle pose", JSON.stringify(stillA) === JSON.stringify(stillB), [stillA, stillB]);

  const out = path.resolve("docs/evidence/3d-pilot/regression.json");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify({ browser: "Edge DevTools", sampledAt: new Date().toISOString(),
    checks, errors }, null, 2) + "\n");
  process.stdout.write(`Saved ${checks.length} checks to ${out}\n`);
} finally {
  socket.close();
}
