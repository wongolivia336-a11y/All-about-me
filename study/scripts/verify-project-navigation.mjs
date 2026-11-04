/** Browser regression for the archive project route. */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5173/";
const stage = process.argv[2] || "after";
const afterMode = stage.startsWith("after");
const outputDir = path.resolve("audit/evidence", stage);
await mkdir(outputDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("No Edge page target on port " + port);

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timeout = setTimeout(() => {
    pending.delete(id);
    reject(new Error(method + " timed out"));
  }, 30000);
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

async function until(expression, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(120);
  }
  throw new Error("Timed out waiting for " + expression);
}

async function navigate(hash = "#index") {
  const url = new URL(baseUrl);
  url.searchParams.set("audit", String(Date.now()));
  url.hash = hash;
  await send("Page.navigate", { url: url.href });
  await until("Boolean(document.querySelector('.archive'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await until("Array.from(document.querySelectorAll('.leaf-canvas__tile img')).every((image) => image.complete)");
}

async function click(selector) {
  const result = await evaluate("(() => { const element=document.querySelector(" + JSON.stringify(selector) + "); " +
    "if(!element) return {found:false}; const box=element.getBoundingClientRect(); " +
    "const visible=box.width>0&&box.height>0&&box.top<innerHeight&&box.bottom>0; " +
    "if(visible) { element.focus(); element.click(); } return {found:true,visible}; })()");
  if (!result.found || !result.visible) throw new Error("Target is not visible: " + selector + " " + JSON.stringify(result));
}

const checks = [];
const check = (name, passed, observed) => {
  const result = { name, passed: Boolean(passed), observed };
  checks.push(result);
  process.stdout.write((result.passed ? "PASS " : "OBSERVE ") + name + ": " + JSON.stringify(observed) + "\n");
};

async function openFromSelectedWorks() {
  const origin = await evaluate("(() => { const archive=document.querySelector('.archive'); " +
    "const selected=document.querySelector('#selected-works'); " +
    "archive.scrollTop += selected.getBoundingClientRect().top - 112; " +
    "const button=document.querySelector('#selected-works .project-card__open'); const box=button.getBoundingClientRect(); " +
    "return {scrollTop:archive.scrollTop," +
    "buttonVisible:box.top<innerHeight&&box.bottom>0,button:button.innerText.trim()}; })()");
  if (!origin.buttonVisible) throw new Error("Selected work card is not visible: " + JSON.stringify(origin));
  await capture("selected-works-before-open-1440x900");
  await evaluate("(() => { const button=document.querySelector('#selected-works .project-card__open'); button.focus(); button.click(); })()");
  await until("Boolean(document.querySelector('.archive__project-detail'))");
  await sleep(850);
  return origin;
}

async function capture(name) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  const file = path.join(outputDir, name + ".png");
  await writeFile(file, Buffer.from(result.data, "base64"));
  return file;
}

try {
  await Promise.all([
    send("Page.enable"),
    send("Runtime.enable"),
    send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }),
  ]);
  await navigate("#index");
  await sleep(450);
  await capture("index-overview-1440x900");
  const projectAssets = await evaluate("import('/src/data/library.ts').then(async ({library}) => Promise.all(library.filter(entry => entry.cover).flatMap(entry => " +
    "[entry.cover, entry.detailCover].filter(Boolean).map(async path => {const response=await fetch(path); const bytes=await response.arrayBuffer(); " +
    "return {path,status:response.status,bytes:bytes.byteLength,type:response.headers.get('content-type')}}))))");
  check("all mapped portfolio art assets are served", afterMode ? projectAssets.length === 14 &&
    projectAssets.every((asset) => asset.status === 200 && asset.bytes > 0 && asset.type?.includes("image/png")) : true, projectAssets);

  const origin = await openFromSelectedWorks();
  const detail = await evaluate("(() => { const archive=document.querySelector('.archive'); " +
    "const section=document.querySelector('.archive__project-detail'); const heading=section&&section.querySelector('h2'); " +
    "const box=heading&&heading.getBoundingClientRect(); return {hash:location.hash,scrollTop:archive.scrollTop," +
    "detailTop:section?section.getBoundingClientRect().top:null," +
    "headingVisible:Boolean(box&&box.top>=0&&box.bottom<=innerHeight)," +
    "art:section?(()=>{const figure=section.querySelector('figure');const image=figure?.querySelector('img');" +
    "const r=image?.getBoundingClientRect();return {imageLoaded:Boolean(image?.complete&&image.naturalWidth)," +
    "naturalSize:image?[image.naturalWidth,image.naturalHeight]:null,renderedSize:r?[Math.round(r.width),Math.round(r.height)]:null," +
    "caption:figure?.querySelector('figcaption')?.textContent||null}})():null," +
    "focusOnDetail:document.activeElement===section,title:document.title,project:heading?heading.innerText:null}; })()");
  await capture("project-detail-from-selected-works-1440x900");
  check("project detail is placed in reading view", afterMode ? detail.headingVisible : true, detail);
  check("detail receives keyboard focus", afterMode ? detail.focusOnDetail : true, detail.focusOnDetail);
  check("document title follows the selected project", afterMode ? detail.title.includes(detail.project) : true, detail.title);
  check("project slug is present in the URL", afterMode ? locationHashHasProject(detail.hash) : true, detail.hash);
  check("project art keeps its source ratio and conceptual provenance", afterMode ? detail.art?.imageLoaded &&
    Math.abs(detail.art.renderedSize[1] - detail.art.renderedSize[0] / 1.6) <= 2 &&
    detail.art.caption?.includes("not a project screenshot") : true, detail.art);

  await click(".archive__back");
  await until("!location.hash.split('/')[2]");
  await sleep(150);
  const returned = await evaluate("(() => ({hash:location.hash,scrollTop:document.querySelector('.archive').scrollTop," +
    "focusContext:document.activeElement&&document.activeElement.dataset.projectContext||null," +
    "focusEntry:document.activeElement&&document.activeElement.dataset.projectEntry||null,title:document.title}))()");
  await capture("project-return-1440x900");
  check("return restores source scroll position", afterMode ? Math.abs(returned.scrollTop - origin.scrollTop) <= 3 : true,
    { origin: origin.scrollTop, returned: returned.scrollTop });
  check("return restores source focus", afterMode ? returned.focusContext === "selected" : true, returned);

  await click("#selected-works .project-card__open");
  await until("Boolean(document.querySelector('.archive__project-detail'))");
  await evaluate("history.back()");
  await until("!location.hash.split('/')[2]");
  const backState = await evaluate("({hash:location.hash,detail:Boolean(document.querySelector('.archive__project-detail'))})");
  check("browser Back leaves project detail", afterMode ? !backState.detail : true, backState);
  await evaluate("history.forward()");
  await until("Boolean(document.querySelector('.archive__project-detail'))");
  await sleep(600);
  const forwardState = await evaluate("({hash:location.hash,detail:Boolean(document.querySelector('.archive__project-detail'))})");
  check("browser Forward restores project detail", afterMode ? forwardState.detail : true, forwardState);

  await send("Page.reload", { ignoreCache: true });
  await until("Boolean(document.querySelector('.archive__project-detail'))");
  await until("!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await sleep(700);
  const direct = await evaluate("(() => ({hash:location.hash,title:document.title," +
    "focused:document.activeElement===document.querySelector('.archive__project-detail')," +
    "headingVisible:(()=>{const r=document.querySelector('.archive__project-detail h2')?.getBoundingClientRect();" +
    "return Boolean(r&&r.top>=0&&r.bottom<=innerHeight)})()}))()");
  await capture("direct-project-route-1440x900");
  check("refresh restores the project route", afterMode ? direct.headingVisible && direct.focused : true, direct);

  await navigate("#index");
  for (const theme of ["build", "question", "play", "keep"]) {
    await click(`[data-heart-theme="${theme}"]`);
    await until(`Boolean(document.querySelector('.leaf-canvas[data-mode="focused"]'))`);
    const themeState = await evaluate("(() => { const leaf=document.querySelector(" + JSON.stringify(`[data-heart-theme="${theme}"]`) + "); " +
      "const tile=document.querySelector(" + JSON.stringify(`.leaf-canvas__tile--${theme}`) + "); const image=tile?.querySelector('img'); " +
      "return {selected:leaf?.getAttribute('aria-pressed'),tileActive:tile?.dataset.active,imageLoaded:Boolean(image?.complete&&image.naturalWidth)," +
      "title:document.querySelector('.leaf-canvas__focus-copy h2')?.textContent}; })()");
    check(`${theme} theme selects matching artwork`, afterMode ? themeState.selected === "true" && themeState.tileActive === "true" && themeState.imageLoaded : true, themeState);
  }
  await click(".leaf-canvas__overview");
  await until(`Boolean(document.querySelector('.leaf-canvas[data-mode="overview"]'))`);
  await sleep(700);
  const cancelStart = await evaluate("(() => ({hash:location.hash,mode:document.querySelector('.leaf-canvas')?.dataset.mode," +
    "rotation:parseFloat(document.querySelector('.heartwheel__stage').style.getPropertyValue('--heartwheel-rotation'))}))()");
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const wheelPoint = await evaluate("(() => { const r=document.querySelector('.heartwheel__stage').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()");
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...wheelPoint, id: 1 }] });
  await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...wheelPoint, x: wheelPoint.x + 82, id: 1 }] });
  await send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await sleep(950);
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  const cancelEnd = await evaluate("(() => ({hash:location.hash,mode:document.querySelector('.leaf-canvas')?.dataset.mode," +
    "rotation:parseFloat(document.querySelector('.heartwheel__stage').style.getPropertyValue('--heartwheel-rotation'))}))()");
  check("touch pointer cancel restores the starting theme rotation", afterMode ? cancelEnd.hash === cancelStart.hash &&
    cancelEnd.mode === cancelStart.mode && Math.abs(cancelEnd.rotation - cancelStart.rotation) < 0.5 : true,
    { start: cancelStart, end: cancelEnd });

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await click('[data-heart-theme="build"]');
  await sleep(50);
  const reducedMotion = await evaluate("(() => ({preferred:matchMedia('(prefers-reduced-motion: reduce)').matches," +
    "tileTransition:getComputedStyle(document.querySelector('.leaf-canvas__tile')).transitionDuration," +
    "copyAnimation:getComputedStyle(document.querySelector('.leaf-canvas__focus-copy')).animationName," +
    "mode:document.querySelector('.leaf-canvas')?.dataset.mode}))()");
  check("reduced motion uses a static theme transition", afterMode ? reducedMotion.preferred && reducedMotion.tileTransition === "0s" &&
    reducedMotion.copyAnimation === "none" && reducedMotion.mode === "focused" : true, reducedMotion);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate("#index");
  await sleep(350);
  const mobile = await evaluate("({viewport:innerWidth,pageWidth:document.documentElement.scrollWidth," +
    "archiveWidth:document.querySelector('.archive').scrollWidth,tileCount:document.querySelectorAll('.leaf-canvas__tile').length})");
  await capture("index-mobile-390x844");
  check("mobile index has no horizontal overflow", afterMode ? mobile.pageWidth <= mobile.viewport && mobile.archiveWidth <= mobile.viewport : true, mobile);

  const report = { stage, url: baseUrl, viewport: [1440, 900], mobileViewport: [390, 844], checks };
  await writeFile(path.join(outputDir, "navigation-report.json"), JSON.stringify(report, null, 2) + "\n");
  if (afterMode && checks.some((item) => !item.passed)) process.exitCode = 1;
} finally {
  socket.close();
}

function locationHashHasProject(hash) {
  return hash.split("/").filter(Boolean).length >= 3;
}
