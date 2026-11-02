/**
 * Capture repeatable room views from a local Edge DevTools endpoint.
 *
 * Start Vite, then launch Edge with --headless=new --enable-webgl
 * --remote-debugging-port=9224 and a separate user-data-dir. Run:
 *   node scripts/capture-3d.mjs before
 *   node scripts/capture-3d.mjs after
 *
 * No browser automation dependency is required. The probe records browser
 * frame intervals and WebGL submissions; it does not claim GPU timer results.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const stage = process.argv[2];
if (!stage || !/^[a-z0-9-]+$/.test(stage)) {
  throw new Error("Pass an output stage, such as before or after");
}
const port = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5173/";
const outputDir = path.resolve("docs/evidence/3d-pilot", stage);
await mkdir(outputDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.pending = new Map();
    this.nextId = 1;
    this.errors = [];
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        this.errors.push(message.params.exceptionDetails.text);
      } else if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
        this.errors.push(message.params.entry.text);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, 30000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.text);
    }
    return response.result.value;
  }

  close() { this.socket.close(); }
}

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No Edge page target is available");
const cdp = new Cdp(target.webSocketDebuggerUrl);
await cdp.open();
await Promise.all([
  cdp.send("Page.enable"),
  cdp.send("Runtime.enable"),
  cdp.send("Log.enable"),
  cdp.send("Network.enable"),
]);

await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
  source: `(() => {
    const probe = window.__roomProbe = { frames: [], drawCalls: 0, triangles: 0, last: 0 };
    const triangleCount = (mode, count) => mode === 4 ? count / 3 :
      mode === 5 || mode === 6 ? Math.max(0, count - 2) : 0;
    const instrument = (proto, name, indexed, instanced) => {
      if (!proto || !Object.prototype.hasOwnProperty.call(proto, name)) return;
      const original = proto[name];
      proto[name] = function (...args) {
        probe.drawCalls++;
        const count = args[indexed ? 1 : 2];
        const instances = instanced ? args[indexed ? 4 : 3] : 1;
        probe.triangles += triangleCount(args[0], count) * instances;
        return original.apply(this, args);
      };
    };
    for (const proto of [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype]) {
      instrument(proto, 'drawArrays');
      instrument(proto, 'drawElements');
      instrument(proto, 'drawArraysInstanced', false, true);
      instrument(proto, 'drawElementsInstanced', true, true);
    }
    requestAnimationFrame(function tick(now) {
      if (probe.last) {
        probe.frames.push({ ms: now - probe.last, draws: probe.drawCalls, triangles: probe.triangles });
        if (probe.frames.length > 300) probe.frames.shift();
      }
      probe.last = now;
      probe.drawCalls = 0;
      probe.triangles = 0;
      requestAnimationFrame(tick);
    });
  })();`,
});

async function viewport(width, height, mobile = false) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile,
  });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
}

async function navigate(suffix = "#room") {
  // A unique query forces a new document even when the previous capture left
  // this tab on #room, so the frame probe always installs before R3F mounts.
  const url = new URL(suffix, baseUrl);
  url.searchParams.set("capture", String(Date.now()));
  await cdp.send("Page.navigate", { url: url.href });
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    const ready = await cdp.evaluate(`Boolean(window.__roomProbe && document.querySelector('.hud') &&
      [...document.querySelectorAll('canvas')].some((c) => c.getContext('webgl2')))`);
    if (ready) break;
    if (i === 59) {
      const state = await cdp.evaluate(`({ url: location.href, title: document.title,
        body: document.body?.innerText.slice(0, 600),
        canvases: document.querySelectorAll('canvas').length,
        hud: Boolean(document.querySelector('.hud')) })`);
      throw new Error(`Room canvas did not become ready: ${JSON.stringify(state)}; errors: ${cdp.errors.join(' | ')}`);
    }
  }
  for (let i = 0; i < 120; i++) {
    const hidden = await cdp.evaluate(`document.querySelector('.ascii-loader')?.classList.contains('ascii-loader--hidden')`);
    if (hidden) return;
    await sleep(500);
  }
  throw new Error(`Room loader remained visible: ${JSON.stringify(await cdp.evaluate(`({
    loader: document.querySelector('.ascii-loader')?.className,
    roomLoading: Boolean(document.querySelector('.room-loading')),
    canvases: document.querySelectorAll('canvas').length
  })`))}`);
}

async function setRoom({ night = false, power = false, brightness = 0.5, focus = null }) {
  await cdp.evaluate(`(async () => {
    const m = await import('/src/interaction/studyStore.ts');
    m.setNightMode(${night});
    m.setLampBrightness(${brightness});
    const on = document.querySelector('button[aria-label="关闭台灯"]') !== null;
    if (on !== ${power}) m.toggleLampPower();
    m.focus(${JSON.stringify(focus)});
    return true;
  })()`);
  await sleep(1800);
  await cdp.evaluate(`window.__roomProbe.frames.length = 0`);
  await sleep(3000);
}

async function capture(name) {
  const facts = await cdp.evaluate(`(() => {
    const canvas = [...document.querySelectorAll('canvas')].find((c) => c.getContext('webgl2'));
    const gl = canvas?.getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    const frames = (window.__roomProbe?.frames || []).slice(-120);
    const moving = frames.filter((f) => f.ms > 0 && f.ms < 1000);
    const active = moving.filter((f) => f.draws > 0);
    const mean = (items) => items.length ? items.reduce((a, b) => a + b, 0) / items.length : null;
    const ms = moving.map((f) => f.ms).sort((a, b) => a - b);
    const p99 = ms[Math.floor(ms.length * .99)] || null;
    const resources = performance.getEntriesByType('resource');
    return {
      viewport: [innerWidth, innerHeight],
      webgl: gl ? {
        renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      } : null,
      frameMsMean: mean(moving.map((f) => f.ms)),
      frameMsP99: p99,
      fpsMean: moving.length ? 1000 / mean(moving.map((f) => f.ms)) : null,
      fpsLow1Percent: p99 ? 1000 / p99 : null,
      drawCallsMean: mean(active.map((f) => f.draws)),
      trianglesMean: mean(active.map((f) => f.triangles)),
      sampledFrames: moving.length,
      activeFrames: active.length,
      resourceTransferBytes: resources.reduce((n, r) => n + (r.transferSize || 0), 0),
      resourceDecodedBytes: resources.reduce((n, r) => n + (r.decodedBodySize || 0), 0),
      resourceCount: resources.length,
      canvasCount: document.querySelectorAll('canvas').length,
      rendererInfo: window.__studyRenderInfo?.() || null,
      hudVisible: Boolean(document.querySelector('.hud')),
      indexVisible: Boolean(document.querySelector('.archive')),
      loaderClass: document.querySelector('.ascii-loader')?.className,
    };
  })()`);
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png", fromSurface: true, captureBeyondViewport: false,
  });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
  return facts;
}

try {
  const effectsOnly = process.argv.includes("--effects-only");
  const onlyView = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);
  const report = { stage, browser: "Edge DevTools", sampledAt: new Date().toISOString(), views: {}, errors: cdp.errors };
  await viewport(1280, 800);
  const views = effectsOnly ? [] : [
    ["overview-day", { night: false, power: false, focus: null }],
    ["overview-night-off", { night: true, power: false, focus: null }],
    ["overview-night-50", { night: true, power: true, brightness: 0.5, focus: null }],
    ["overview-night-100", { night: true, power: true, brightness: 1, focus: null }],
    ["laptop-focus", { night: false, power: false, focus: "laptop" }],
    ["domi-focus", { night: false, power: false, focus: "domi" }],
    ["lamp-focus", { night: false, power: false, focus: "lamp" }],
    ["shelf-window-focus", { night: false, power: false, focus: "shelf" }],
  ];
  if (!effectsOnly) await navigate("#room");
  for (const [name, settings] of views.filter(([name]) => !onlyView || name === onlyView)) {
    await setRoom(settings);
    report.views[name] = await capture(name);
    process.stdout.write(`${name} ${JSON.stringify(report.views[name])}\n`);
  }
  if (!effectsOnly && (!onlyView || onlyView === "overview-mobile")) {
    await viewport(390, 844, true);
    await setRoom({ night: false, power: false, focus: null });
    report.views["overview-mobile"] = await capture("overview-mobile");
  }
  if (stage === "before" || effectsOnly) {
    await viewport(1280, 800);
    const variants = effectsOnly ? [
      ["fx-all", "?debug=probe#room"],
      ["fx-no-ao", "?debug=ao-off#room"],
      ["fx-no-bloom", "?debug=bloom-off#room"],
      ["fx-no-vignette", "?debug=vignette-off#room"],
      ["fx-no-smaa", "?debug=smaa-off#room"],
      ["fx-none", "?debug=postfx-off#room"],
      ["shadows-none", "?debug=shadows-off#room"],
      ["fx-and-shadows-none", "?debug=postfx-off,shadows-off#room"],
    ] : [
      ["debug-bounds", "?debug=scene#room"],
      ["debug-wireframe", "?debug=scene,wireframe#room"],
      ["debug-normals", "?debug=scene,normals#room"],
      ["debug-no-fx", "?debug=scene,shadows-off,postfx-off#room"],
    ];
    for (const [name, suffix] of variants.filter(([name]) => !onlyView || name === onlyView)) {
      await navigate(suffix);
      await setRoom({ night: false, power: false, focus: null });
      report.views[name] = await capture(name);
      process.stdout.write(`${name} ${JSON.stringify(report.views[name])}\n`);
    }
  }
  await writeFile(path.join(outputDir, "metrics.json"), JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(`Saved ${Object.keys(report.views).length} views to ${outputDir}\n`);
} finally {
  cdp.close();
}
