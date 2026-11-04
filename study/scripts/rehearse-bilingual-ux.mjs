/** Browser rehearsal for the bilingual Index, room reveal, and mobile controls. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5174/";
const outputDir = path.resolve("audit/evidence/ux-revisit");
await mkdir(outputDir, { recursive: true });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = pages.find((item) => item.type === "page");
assert.ok(page, `No Edge page target on port ${port}`);

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
    await pause(150);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function navigate(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set("ux-revisit", String(Date.now()));
  url.hash = hash;
  await send("Page.navigate", { url: url.href });
}

async function capture(name) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
}

const checks = [];
const check = (name, passed, observed) => {
  const result = { name, passed: Boolean(passed), observed };
  checks.push(result);
  process.stdout.write(`${result.passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify(observed)}\n`);
};

try {
  await Promise.all([
    send("Page.enable"),
    send("Runtime.enable"),
    send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }),
    send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] }),
  ]);
  await navigate("#index");
  await until("Boolean(document.querySelector('.archive'))");
  await evaluate("localStorage.setItem('four-hearts-language', 'en')");
  await navigate("#index");
  await until("Boolean(document.querySelector('.archive'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await pause(350);
  await capture("index-en-1440x900");

  await evaluate(`document.querySelector('.language-switch button[lang="zh-CN"]').click()`);
  await until(`document.documentElement.lang === 'zh-CN'`);
  await send("Page.reload", { ignoreCache: true });
  await until(`document.documentElement.lang === 'zh-CN' && Boolean(document.querySelector('.archive'))`);
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  const chineseIndex = await evaluate(`({title:document.querySelector('#archive-title')?.textContent,
    leaf:document.querySelector('[data-heart-theme="build"] span')?.textContent,
    selected:document.querySelector('.language-switch button[lang="zh-CN"]')?.getAttribute('aria-pressed'),
    persistent:localStorage.getItem('four-hearts-language'),hash:location.hash,
    archive:Boolean(document.querySelector('.archive')),wheel:Boolean(document.querySelector('.heartwheel__stage')),
    detail:document.querySelector('.archive__project-detail h2')?.textContent,
    body:document.body.innerText.slice(0,180)})`);
  await capture("index-zh-1440x900");
  check("Index switches to Chinese and persists selection", chineseIndex.title?.includes("记录我构建") &&
    chineseIndex.leaf === "构建" && chineseIndex.selected === "true" && chineseIndex.persistent === "zh", chineseIndex);

  await evaluate(`document.querySelector('[data-heart-theme="question"]').click()`);
  await until(`document.querySelector('.leaf-canvas')?.dataset.mode === 'focused'`);
  await pause(450);
  const focusState = await evaluate(`({mode:document.querySelector('.leaf-canvas')?.dataset.mode,
    title:document.querySelector('.leaf-canvas__focus-copy h2')?.textContent,
    leaf:document.querySelector('[data-heart-theme="question"] span')?.textContent,
    outlineCount:document.querySelectorAll('.heartwheel__leaf-outline').length,
    idleButtonBorder:getComputedStyle(document.querySelector('[data-heart-theme="question"]')).borderWidth})`);
  await capture("theme-focus-zh-1440x900");
  check("Theme selection keeps copy synchronized without permanent leaf strokes", focusState.mode === "focused" &&
    focusState.leaf === "追问" && focusState.outlineCount === 0 && focusState.idleButtonBorder === "0px", focusState);

  await evaluate(`document.querySelector('.leaf-canvas__actions button').click()`);
  await until(`Boolean(document.querySelector('.archive__project-detail'))`);
  await pause(350);
  const project = await evaluate(`({hash:location.hash,title:document.querySelector('.archive__project-detail h2')?.textContent,
    summary:document.querySelector('.archive__project-summary')?.textContent,
    htmlLang:document.documentElement.lang,headingVisible:(()=>{const r=document.querySelector('.archive__project-detail h2')?.getBoundingClientRect();return !!r&&r.top>=0&&r.bottom<=innerHeight})()})`);
  await capture("project-detail-zh-1440x900");
  check("Project detail is readable in Chinese", project.title === "镜子的两面" && project.htmlLang === "zh-CN" && project.headingVisible, project);

  await evaluate(`document.querySelector('.archive__back').click()`);
  await until(`!document.querySelector('.archive__project-detail')`);
  await evaluate(`document.querySelector('.language-switch button[lang="en"]').click()`);
  await until(`document.documentElement.lang === 'en'`);
  const englishReturn = await evaluate(`({title:document.querySelector('#archive-title')?.textContent,
    leaf:document.querySelector('[data-heart-theme="build"] span')?.textContent})`);
  check("Language toggle returns the whole Index to English", englishReturn.title?.includes("A living archive") && englishReturn.leaf === "BUILD", englishReturn);

  const corner = await evaluate(`document.querySelector('.paper-corner')?.click(); true`);
  void corner;
  await until(`Boolean(document.querySelector('.room-reveal-surface'))`, 20000);
  await pause(125);
  const revealState = await evaluate(`({hash:location.hash,corner:!!document.querySelector('.paper-corner'),
    preview:!!document.querySelector('.room-peek'),progress:Number(document.querySelector('.room-reveal-surface')?.dataset.revealProgress),
    phase:document.querySelector('.room-reveal-surface')?.dataset.revealInteractive})`);
  await capture("room-reveal-mid-1440x900");
  check("Room transition has one reveal surface and no stacked fold preview", revealState.hash === "#room" &&
    !revealState.corner && !revealState.preview && revealState.phase === "false" && revealState.progress > 0, revealState);
  await until(`document.querySelector('.room-reveal-surface')?.dataset.revealInteractive === 'true'`, 120000);
  await pause(300);
  await capture("room-overview-en-1440x900");

  await evaluate(`document.querySelector('.language-switch button[lang="zh-CN"]').click()`);
  await until(`document.documentElement.lang === 'zh-CN'`);
  await evaluate(`import('/src/interaction/studyStore.ts').then(m => m.focus('shelf'))`);
  await until(`Boolean(document.querySelector('.panel__title'))`);
  await pause(150);
  const panel = await evaluate(`({title:document.querySelector('.panel__title')?.textContent,
    language:document.documentElement.lang,exitLabel:document.querySelector('.room-exit')?.getAttribute('aria-label'),
    titleColor:getComputedStyle(document.querySelector('.panel__title')).color,
    panelColor:getComputedStyle(document.querySelector('.panel')).color,
    evening:document.querySelector('.app')?.classList.contains('app--evening')})`);
  await capture("room-hotspot-zh-1440x900");
  check("Room copy and exit control follow the language setting", panel.title === "书单与笔记" &&
    panel.language === "zh-CN" && panel.exitLabel === "返回主题索引", panel);
  check("Room panel text follows the active light or evening palette", panel.evening
    ? panel.titleColor === "rgb(255, 253, 248)"
    : panel.titleColor === "rgb(32, 35, 32)", panel);
  await evaluate(`import('/src/interaction/studyStore.ts').then(m => m.focus(null))`);
  await evaluate(`document.querySelector('.room-exit').click()`);
  await until(`location.hash.startsWith('#index') && !document.querySelector('.room-reveal-surface')`, 120000);

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate("#index");
  await until("Boolean(document.querySelector('.archive'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await pause(350);
  const mobile = await evaluate(`(()=>{const selector=document.querySelector('.archive__language').getBoundingClientRect();
    const corner=document.querySelector('.paper-corner').getBoundingClientRect();
    return {viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,
      switchHeight:Math.min(...[...document.querySelectorAll('.archive__language button')].map(b=>b.getBoundingClientRect().height)),
      switchColor:getComputedStyle(document.querySelector('.archive__language button[aria-pressed="false"]')).color,
      switchCornerOverlap:!(selector.right<=corner.left||selector.left>=corner.right||selector.bottom<=corner.top||selector.top>=corner.bottom),
      title:document.querySelector('#archive-title')?.textContent};})()`);
  await capture("index-mobile-zh-390x844");
  check("Mobile Index fits, keeps the fold clear, and preserves touch target size", mobile.pageWidth <= mobile.viewport &&
    mobile.switchHeight >= 44 && !mobile.switchCornerOverlap && mobile.switchColor === "rgb(92, 98, 93)" &&
    mobile.title?.includes("记录我构建"), mobile);

  const reduced = await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  void reduced;
  const reducedState = await evaluate(`({active:matchMedia('(prefers-reduced-motion: reduce)').matches,
    switchTransition:getComputedStyle(document.querySelector('.language-switch button')).transitionDuration})`);
  check("Reduced-motion preference removes switch animation", reducedState.active && reducedState.switchTransition === "1e-05s", reducedState);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  check("No uncaught browser exceptions", exceptions.length === 0, exceptions);

  const report = { url: baseUrl, browser: "Edge DevTools", desktopViewport: [1440, 900], mobileViewport: [390, 844], checks, exceptions };
  await writeFile(path.join(outputDir, "rehearsal-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  assert.ok(checks.every((item) => item.passed), "One or more bilingual UX rehearsal checks failed");
} finally {
  socket.close();
}
