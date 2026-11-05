import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.STUDY_CDP_PORT || 9230);
const url = process.env.STUDY_URL || "http://127.0.0.1:5176/";
const output = path.resolve(process.env.MOTION_OUTPUT || "audit/evidence/motion");
await mkdir(output, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("No Edge page target");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let id = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => {
    pending.delete(requestId);
    reject(new Error(`${method} timed out`));
  }, 30000);
  pending.set(requestId, {
    resolve: (value) => { clearTimeout(timer); resolve(value); },
    reject: (error) => { clearTimeout(timer); reject(error); },
  });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
};
const capture = async (name) => {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path.join(output, `${name}.png`), Buffer.from(result.data, "base64"));
};
const waitFor = async (expression, timeout = 30000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${expression}`);
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await send("Page.navigate", { url: `${url}?motion=${Date.now()}#index` });
await sleep(220);
await capture("loader-220ms");
await sleep(480);
await capture("loader-700ms");
await waitFor("Boolean(document.querySelector('.archive'))");
await sleep(600);
await capture("index-ready");

await evaluate("document.querySelector('[data-heart-theme=\\\"build\\\"]')?.click()");
await waitFor("location.hash === '#index/build'");
await sleep(140);
await capture("zoom-enter-140ms");
await sleep(620);
await capture("zoom-entered");

socket.close();
console.log(`Motion evidence written to ${output}`);

