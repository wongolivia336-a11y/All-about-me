/** Runtime smoke for Index ↔ Room, room content surfaces and browser history. */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5173/";
const outputDir = path.resolve("audit/evidence/after-final");
await mkdir(outputDir, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("No Edge page target on port " + port);
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
    errors.push(message.params.exceptionDetails.text);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timeout = setTimeout(() => {
    pending.delete(id);
    reject(new Error(method + " timed out"));
  }, 60000);
  pending.set(id, {
    resolve: (value) => { clearTimeout(timeout); resolve(value); },
    reject: (error) => { clearTimeout(timeout); reject(error); },
  });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
};
async function until(expression, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(150);
  }
  throw new Error("Timed out waiting for " + expression);
}
async function navigate(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set("room-audit", String(Date.now()));
  url.hash = hash;
  await send("Page.navigate", { url: url.href });
}
async function capture(name) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path.join(outputDir, name + ".png"), Buffer.from(result.data, "base64"));
}

const checks = [];
const check = (name, passed, observed) => {
  checks.push({ name, passed: Boolean(passed), observed });
  process.stdout.write(`${passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify(observed)}\n`);
};

try {
  await Promise.all([
    send("Page.enable"),
    send("Runtime.enable"),
    send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }),
  ]);
  await navigate("#index");
  await until("Boolean(document.querySelector('.archive'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await evaluate("window.__auditFocusTrace=[];const originalFocus=HTMLElement.prototype.focus;" +
    "HTMLElement.prototype.focus=function(){window.__auditFocusTrace.push(this.getAttribute('aria-label')||this.className||this.tagName);" +
    "return originalFocus.apply(this,arguments)}");
  const indexState = await evaluate("({hash:location.hash,archive:Boolean(document.querySelector('.archive'))," +
    "enterRoom:Boolean(document.querySelector('button[aria-label=\"Enter Room\"]'))})");
  check("Index exposes the Room entry", indexState.archive && indexState.enterRoom, indexState);

  await evaluate("document.querySelector('button[aria-label=\"Enter Room\"]').click()");
  await until("Boolean(document.querySelector('.hud') && document.querySelector('.room-reveal-surface[data-reveal-interactive=\"true\"]'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await evaluate("import('/src/interaction/studyStore.ts').then(m => m.setNightMode(false))");
  await sleep(600);
  const roomState = await evaluate("({hash:location.hash,hud:Boolean(document.querySelector('.hud'))," +
    "canvasCount:document.querySelectorAll('.room-reveal-surface canvas').length," +
    "revealInteractive:document.querySelector('.room-reveal-surface')?.dataset.revealInteractive," +
    "exit:Boolean(document.querySelector('button[aria-label=\"Return to Index\"]'))})");
  await capture("room-overview-1280x800");
  check("Room loads and becomes interactive", roomState.hash === "#room" && roomState.hud &&
    roomState.canvasCount > 0 && roomState.revealInteractive === "true" && roomState.exit, roomState);
  const roomFocus = await evaluate("document.activeElement===document.querySelector('button[aria-label=\"Return to Index\"]')");
  check("Room entry moves focus to its exit control", roomFocus, roomFocus);

  const objectIds = ["laptop", "phone", "portfolio", "shelf", "camera", "board", "marshall", "posters", "domi", "sketchbook", "materials", "whiteboard"];
  for (const id of objectIds) {
    await evaluate(`import('/src/interaction/studyStore.ts').then(m => m.focus(${JSON.stringify(id)}))`);
    await sleep(140);
    const panel = await evaluate("document.querySelector('.panel__title, .viewer__title')?.textContent || null");
    check(`Room object ${id} opens its content surface`, Boolean(panel), panel);
  }
  await evaluate("import('/src/interaction/studyStore.ts').then(m => m.focus('domi'))");
  await sleep(150);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await sleep(120);
  const escapeState = await evaluate("({panel:Boolean(document.querySelector('.panel')),hash:location.hash})");
  check("Escape closes the focused object panel", !escapeState.panel && escapeState.hash === "#room", escapeState);

  await evaluate("(() => {const button=document.querySelector('button[aria-label=\"Return to Index\"]');button.focus();button.click()})()");
  await until("Boolean(document.querySelector('.archive') && !document.querySelector('.room-reveal-surface[data-reveal-interactive=\"true\"]'))");
  await until("!document.querySelector('.room-reveal-surface')");
  await sleep(100);
  const exitState = await evaluate("({hash:location.hash,archive:Boolean(document.querySelector('.archive'))," +
    "roomMounted:Boolean(document.querySelector('.room-reveal-surface'))," +
    "focusRestored:document.activeElement===document.querySelector('button[aria-label=\"Enter Room\"]')," +
    "focusTrace:window.__auditFocusTrace})");
  await capture("index-after-room-1280x800");
  check("Room exit returns to Index and restores the trigger focus", exitState.hash === "#index" &&
    exitState.archive && !exitState.roomMounted && exitState.focusRestored, exitState);

  await evaluate("history.back()");
  await until("location.hash === '#room'");
  await until("Boolean(document.querySelector('.hud') && document.querySelector('.room-reveal-surface[data-reveal-interactive=\"true\"]'))");
  await sleep(350);
  const backState = await evaluate("({hash:location.hash,hud:Boolean(document.querySelector('.hud'))})");
  check("Browser Back restores Room", backState.hash === "#room" && backState.hud, backState);
  await evaluate("history.forward()");
  await until("location.hash === '#index'");
  await until("Boolean(document.querySelector('.archive'))");
  const forwardState = await evaluate("({hash:location.hash,archive:Boolean(document.querySelector('.archive'))})");
  check("Browser Forward restores Index", forwardState.hash === "#index" && forwardState.archive, forwardState);
  check("No uncaught browser exceptions", errors.length === 0, errors);

  const report = { url: baseUrl, browser: "Edge DevTools", viewport: [1280, 800], checks, errors };
  await writeFile(path.join(outputDir, "room-navigation-report.json"), JSON.stringify(report, null, 2) + "\n");
  if (checks.some((result) => !result.passed)) process.exitCode = 1;
} finally {
  socket.close();
}
