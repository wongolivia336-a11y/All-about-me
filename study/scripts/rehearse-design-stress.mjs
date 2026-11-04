/** Real-pointer and interruption rehearsal for the Index's spatial navigation. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5174/";
const outputDir = path.resolve("audit/evidence/design-stress");
await mkdir(outputDir, { recursive: true });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = pages.find((item) => item.type === "page" && item.url.includes("127.0.0.1:5174"));
assert.ok(page, `No local Edge page target on port ${port}`);

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
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") {
    exceptions.push(message.params.exceptionDetails.text);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timer = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`${method} timed out`));
  }, 90000);
  pending.set(id, {
    resolve: (value) => { clearTimeout(timer); resolve(value); },
    reject: (error) => { clearTimeout(timer); reject(error); },
  });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
};
async function until(expression, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await pause(100);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
async function navigate(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set("design-stress", String(Date.now()));
  url.hash = hash;
  await send("Page.navigate", { url: url.href });
}
async function capture(name) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
}
const checks = [];
function check(name, passed, observed) {
  const result = { name, passed: Boolean(passed), observed };
  checks.push(result);
  process.stdout.write(`${result.passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify(observed)}\n`);
  assert.ok(result.passed, name);
}
async function clickSelector(selector) {
  const point = await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()`);
  assert.ok(point, `Missing click target ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
}
async function state() {
  return evaluate(`(() => {
    const stage=document.querySelector('.heartwheel__stage');
    const wheel=document.querySelector('.leaf-canvas');
    const selected=[...document.querySelectorAll('[data-heart-theme]')].filter(el=>el.getAttribute('aria-pressed')==='true').map(el=>el.dataset.heartTheme);
    const tile=[...document.querySelectorAll('.leaf-canvas__tile')].find(el=>el.dataset.active==='true');
    return {hash:location.hash,selected,activeTile:tile?.className.match(/leaf-canvas__tile--([a-z]+)/)?.[1]||null,
      mode:wheel?.dataset.mode,rotation:parseFloat(stage?.style.getPropertyValue('--heartwheel-rotation')||'0')};
  })()`);
}

try {
  await Promise.all([
    send("Page.enable"),
    send("Runtime.enable"),
    send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }),
    send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] }),
  ]);
  await evaluate("localStorage.setItem('four-hearts-language','en')");
  await navigate("#index");
  await until("Boolean(document.querySelector('.archive .heartwheel__stage'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await pause(300);
  await capture("index-before-stress-1440x900");

  const headerGeometry = await evaluate(`(() => {
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
    const a=rect('.archive__bar-links'), b=rect('.paper-corner');
    return {contact:a,room:b,overlapX:Math.min(a.right,b.right)-Math.max(a.left,b.left),overlapY:Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)};
  })()`);
  check("Header contact and Room entry have independent hit areas", headerGeometry.overlapX <= 0 || headerGeometry.overlapY <= 0, headerGeometry);

  const rapidSequence = ["question", "play", "keep", "build", "question", "keep", "play", "question"];
  for (const theme of rapidSequence) {
    await clickSelector(`[data-heart-theme="${theme}"]`);
    await pause(45);
  }
  await pause(850);
  const afterRapid = await state();
  const expectedRotation = { build: 0, question: -90, play: -180, keep: -270 }[afterRapid.selected[0]];
  const rotationError = Math.abs((((afterRapid.rotation - expectedRotation + 540) % 360) + 360) % 360 - 180);
  check("Rapid selections settle on matching leaf and artwork", afterRapid.selected.length === 1 &&
    afterRapid.selected[0] === "question" && afterRapid.activeTile === "question" &&
    afterRapid.mode === "focused" && rotationError < 0.5,
    { ...afterRapid, rotationError, rapidSequence });
  await capture("index-after-rapid-switch-1440x900");

  await clickSelector('[data-heart-theme="question"]');
  await pause(120);
  const overview = await state();
  check("Second intentional selection of the active theme returns to overview",
    overview.mode === "overview" && overview.selected.length === 0, overview);
  await clickSelector('[data-heart-theme="question"]');
  await pause(120);

  await evaluate(`document.querySelector('[data-heart-theme="question"]').focus()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await pause(800);
  const keyboard = await state();
  const focusedTheme = await evaluate("document.activeElement?.dataset.heartTheme||null");
  check("Arrow navigation changes theme and keeps focus on its control",
    keyboard.selected[0] === "play" && keyboard.activeTile === "play" && focusedTheme === "play",
    { ...keyboard, focusedTheme });

  await clickSelector('[data-heart-theme="question"]');
  await pause(600);
  const beforeScrollTop = await evaluate(`(() => { const a=document.querySelector('.archive'),p=document.querySelector('#theme-panel');
    a.scrollTo({top:a.scrollTop+p.getBoundingClientRect().top-a.getBoundingClientRect().top-130,behavior:'instant'}); return a.scrollTop; })()`);
  await pause(180);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1400, y: 450 });
  await pause(150);
  await capture("source-theme-before-project-1440x900");
  await evaluate("document.querySelector('#selected-works').scrollIntoView({behavior:'instant',block:'start'})");
  await clickSelector("#selected-works .project-card__open");
  await until("Boolean(document.querySelector('.archive__project-detail'))");
  await pause(750);
  const projectRoute = await evaluate("({hash:location.hash,title:document.querySelector('.archive__project-detail h2')?.textContent})");
  check("Project detail is reachable from the selected works list", projectRoute.hash.split("/").length >= 3 && Boolean(projectRoute.title), projectRoute);
  await evaluate("document.querySelector('.archive__back').scrollIntoView({behavior:'instant',block:'center'})");
  await pause(80);
  await clickSelector(".archive__back");
  await until("!document.querySelector('.archive__project-detail')");
  await pause(250);
  const contextReturn = await state();
  check("Project return restores the theme the visitor was exploring",
    contextReturn.selected[0] === "question" && contextReturn.activeTile === "question" && contextReturn.mode === "focused",
    { ...contextReturn, projectRoute });
  const afterScrollTop = await evaluate(`(() => { const a=document.querySelector('.archive'),p=document.querySelector('#theme-panel');
    a.scrollTo({top:a.scrollTop+p.getBoundingClientRect().top-a.getBoundingClientRect().top-130,behavior:'instant'}); return a.scrollTop; })()`);
  await pause(180);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1400, y: 450 });
  await pause(150);
  await capture("source-theme-after-project-return-1440x900");
  await evaluate("history.forward()");
  await until("Boolean(document.querySelector('.archive__project-detail'))");
  await evaluate("history.back()");
  await until("!document.querySelector('.archive__project-detail')");
  await pause(250);
  const browserBackReturn = await state();
  check("Browser Back and Forward preserve the source theme context",
    browserBackReturn.selected[0] === "question" && browserBackReturn.activeTile === "question" && browserBackReturn.mode === "focused",
    browserBackReturn);
  await send("Page.reload", { ignoreCache: true });
  await until("Boolean(document.querySelector('.archive .heartwheel__stage'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await pause(300);
  const reloadReturn = await state();
  check("Focused theme survives a refresh on its current history entry",
    reloadReturn.selected[0] === "question" && reloadReturn.activeTile === "question" && reloadReturn.mode === "focused",
    reloadReturn);

  await clickSelector('[data-heart-theme="build"]');
  await pause(800);
  const pointerGeometry = await evaluate(`(() => {
    const stage=document.querySelector('.heartwheel__stage');
    const path=document.querySelector('.heartwheel__leaf-hit');
    const p=document.querySelector('.heartwheel__svg').createSVGPoint(); p.x=0; p.y=-50;
    const screen=p.matrixTransform(path.getScreenCTM());
    return {x:screen.x,y:screen.y,target:document.elementFromPoint(screen.x,screen.y)?.getAttribute('class'),
      stage:stage.getBoundingClientRect().toJSON()};
  })()`);
  check("Exposed leaf surface receives pointer input outside its label", pointerGeometry.target === "heartwheel__leaf-hit", pointerGeometry);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pointerGeometry.x, y: pointerGeometry.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pointerGeometry.x, y: pointerGeometry.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pointerGeometry.x + 100, y: pointerGeometry.y, button: "left", buttons: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pointerGeometry.x + 100, y: pointerGeometry.y, button: "left", clickCount: 1 });
  await pause(850);
  const afterDrag = await state();
  check("Dragging the SVG leaf rotates and commits a neighboring theme without a ghost click",
    afterDrag.mode === "focused" && afterDrag.selected.length === 1 && afterDrag.selected[0] === "keep" && afterDrag.activeTile === "keep",
    { ...afterDrag, start: pointerGeometry });
  await capture("index-after-leaf-drag-1440x900");

  check("No uncaught browser exceptions during the stress rehearsal", exceptions.length === 0, exceptions);
  const report = { date: new Date().toISOString(), browser: "Microsoft Edge via DevTools Protocol", url: baseUrl,
    viewport: [1440, 900],
    baselineReproduction: {
      status: "confirmed-before-fix",
      steps: "Focus QUESTION, open BUILD / BioAZ from Selected Works, then use project Back.",
      observed: { sourceTheme: "question", projectTheme: "build", returnedTheme: "build" },
      expectedReturnTheme: "question",
    },
    matchedThemeFrames: { beforeScrollTop, afterScrollTop }, checks, exceptions };
  await writeFile(path.join(outputDir, "design-stress-report.json"), JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(`\n${checks.length}/${checks.length} stress checks passed. Evidence: ${outputDir}\n`);
} finally {
  socket.close();
}
