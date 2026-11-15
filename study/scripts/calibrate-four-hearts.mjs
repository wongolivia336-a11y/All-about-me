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
  await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return; const r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) el.scrollIntoView({ behavior: "instant", block: "center", inline: "center" }); })()`);
  const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  assert.ok(box, `Missing pointer target ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y, buttons: 0 });
  await sleep(120);
}
async function moveToHeartLeaf(theme) {
  const point = await evaluate(`(() => { const path = document.querySelector('[data-heart-leaf="${theme}"] .heartwheel__leaf-hit'); if (!path) return null; let r = path.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) { path.scrollIntoView({ behavior: "instant", block: "center", inline: "center" }); r = path.getBoundingClientRect(); } for (let row = 1; row < 10; row++) for (let col = 1; col < 10; col++) { const x = r.left + r.width * col / 10; const y = r.top + r.height * row / 10; if (document.elementFromPoint(x, y) === path) return { x, y, width: r.width, height: r.height, target: "svg-leaf-path" }; } return null; })()`);
  assert.ok(point, `Could not find an unobstructed point on the ${theme} SVG leaf`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y, buttons: 0 });
  await sleep(180);
  return point;
}
async function tap(selector) {
  const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  assert.ok(box, `Missing tap target ${selector}`);
  if (currentViewport.mobile) {
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y, id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    return;
  }
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x, y: box.y, button: "left", clickCount: 1 });
}
async function pressEscape() {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
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
await evaluate("document.querySelector('.archive').scrollTop = 0; true");
await sleep(500);
await capture("z0-en-1440x900");
const resume = await evaluate(`({ title: document.querySelector('#archive-title')?.textContent, resume: document.querySelector('#resume')?.innerText, wheel: !!document.querySelector('.heartwheel__stage'), preview: document.querySelector('.leaf-preview')?.dataset.theme, sections: ["#worlds", "#selected-works", "#about", "#contact"].map((id) => Boolean(document.querySelector(id))), hash: location.hash })`);
check("Z0 shows the redesigned portfolio structure, resume and complete clover", Boolean(resume.title) && resume.resume?.includes("Internship") && resume.wheel && resume.preview === "build" && resume.sections.every(Boolean) && resume.hash === "#index", resume);

await sleep(450);
const leafPoint = await moveToHeartLeaf("question");
await sleep(250);
const hoverState = await evaluate(`(() => { const el = document.querySelector('[data-heart-theme="question"]'); const r = el.getBoundingClientRect(); return { preview: document.querySelector('.leaf-preview')?.dataset.theme, hoveredLeaf: document.querySelectorAll('.heartwheel__leaf--hovered').length, activeElement: document.activeElement === el, targetAtCenter: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.className?.baseVal ?? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.className }; })()`);
process.stdout.write(`HOVER_DIAGNOSTIC ${JSON.stringify({ leafPoint, ...hoverState })}\n`);
const physicalHover = hoverState.preview === "question" && hoverState.hoveredLeaf > 0;
if (!physicalHover) {
  await evaluate("document.querySelector('[data-heart-theme=question]')?.focus({ preventScroll: true }); true");
  await waitFor("document.querySelector('.leaf-preview')?.dataset.theme === 'question'");
}
await sleep(500);
await moveToHeartLeaf("build");
await waitFor("document.querySelector('.leaf-preview')?.dataset.theme === 'build'");
await sleep(750);
const buildHover = await evaluate(`({ theme: document.querySelector('.leaf-preview')?.dataset.theme, rotation: parseFloat(getComputedStyle(document.querySelector('.heartwheel__stage')).getPropertyValue('--heartwheel-rotation')) })`);
await capture("z0-hover-build-1440x900");
check("Hovering BUILD rotates that leaf into the content position", buildHover.theme === "build" && Math.abs(buildHover.rotation - 90) < 4, buildHover);
await moveToHeartLeaf("question");
await waitFor("document.querySelector('.leaf-preview')?.dataset.theme === 'question'");
await sleep(500);
const preview = await evaluate(`({ hash: location.hash, theme: document.querySelector('.leaf-preview')?.dataset.theme, title: document.querySelector('.leaf-preview strong')?.textContent, rotation: getComputedStyle(document.querySelector('.heartwheel__stage')).getPropertyValue('--heartwheel-rotation') })`);
await capture("z0-hover-question-1440x900");
check("Pointer hover rotates a leaf and changes its related preview", physicalHover && hoverState.preview === "question" && preview.hash === "#index" && preview.theme === "question" && Boolean(preview.title), { hoverState, preview });
await moveTo(".leaf-preview");
await sleep(250);
const crossedPreview = await evaluate(`(() => { const shell = document.querySelector('.leaf-world-shell').getBoundingClientRect(); const card = document.querySelector('.leaf-preview'); const r = card.getBoundingClientRect(); return { theme: card.dataset.theme, title: card.querySelector('strong')?.textContent, pointerInsideShell: shell.left <= r.left + r.width / 2 && shell.right >= r.left + r.width / 2, hash: location.hash }; })()`);
process.stdout.write(`CROSSING_DIAGNOSTIC ${JSON.stringify(crossedPreview)}\n`);
check("Related preview remains selected while pointer crosses from leaf to card", crossedPreview.theme === "question" && crossedPreview.hash === "#index", crossedPreview);

await tap(".leaf-preview__button");
await waitFor("document.querySelector('.leaf-world') && location.hash === '#index/question'");
await sleep(350);
const world = await evaluate(`({ hash: location.hash, cards: document.querySelectorAll('.leaf-world__card').length, clover: !!document.querySelector('.heartwheel__stage'), title: document.querySelector('.leaf-world h2')?.textContent, nav: document.querySelectorAll('.leaf-world__world-nav button').length, languageSwitch: !!document.querySelector('.leaf-world .language-switch') })`);
await capture("z1-question-1440x900");
check("Preview click zooms into its matching Z1 world with navigation and language controls", world.hash === "#index/question" && world.cards >= 1 && world.clover && world.nav === 4 && world.languageSwitch && Boolean(world.title), world);

const enterZoom = await evaluate(`({ phase: document.querySelector('.leaf-world-shell')?.dataset.transition, clip: getComputedStyle(document.querySelector('.leaf-world-shell__dock')).clipPath })`);
check("Z0 to Z1 uses a source-point clip zoom", enterZoom.phase === "focused" && enterZoom.clip.includes("circle"), enterZoom);
await tap('.leaf-world__world-nav button:nth-child(1)');
await waitFor("location.hash === '#index/build' && document.querySelector('.leaf-world__world-nav button:nth-child(1)')?.getAttribute('aria-current') === 'page'");
await capture("z1-build-1440x900");
check("Z1 switches from QUESTION to BUILD without leaving the world", await evaluate("location.hash === '#index/build' && document.querySelector('.leaf-world__world-nav button:nth-child(1)')?.getAttribute('aria-current') === 'page'"), await evaluate("({ hash: location.hash, title: document.querySelector('.leaf-world h2')?.textContent })"));
await tap('.leaf-world__overlay-actions > button');
await waitFor("location.hash === '#index'");
await sleep(70);
const exitZoom = await evaluate(`({ phase: document.querySelector('.leaf-world-shell')?.dataset.transition, clip: getComputedStyle(document.querySelector('.leaf-world-shell__dock')).clipPath })`);
check("Z1 returns through the same zoom hierarchy", exitZoom.phase === "exiting" && exitZoom.clip.includes("circle"), exitZoom);
await sleep(460);
await tap('[data-heart-theme="build"]');
await waitFor("location.hash === '#index/build' && Boolean(document.querySelector('.leaf-world'))");
await sleep(350);

await moveTo('[data-project-entry="bioaz-agent-workbench"][data-project-context="theme-world"]');
await sleep(200);
const cardOrigin = await evaluate(`(() => { const r = document.querySelector('[data-project-entry="bioaz-agent-workbench"][data-project-context="theme-world"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await tap('[data-project-entry="bioaz-agent-workbench"]');
await waitFor("document.querySelector('.archive__project-detail') && location.hash.includes('/bioaz-agent-workbench')");
await sleep(50);
const projectEnterZoom = await evaluate(`(() => { const el = document.querySelector('.archive__project-detail'); const s = getComputedStyle(el); const r = el?.getBoundingClientRect(); return { phase: el?.dataset.transition, clip: s.clipPath, originX: parseFloat(s.getPropertyValue('--detail-x')), originY: parseFloat(s.getPropertyValue('--detail-y')), left: r?.left, top: r?.top, width: r?.width, height: r?.height }; })()`);
check("Z1 to Z2 zooms from the selected card across the viewport", ["entering", "entered"].includes(projectEnterZoom.phase) && projectEnterZoom.clip.includes("circle") && Math.abs(projectEnterZoom.originX + projectEnterZoom.left - cardOrigin.x) < 2 && Math.abs(projectEnterZoom.originY + projectEnterZoom.top - cardOrigin.y) < 2 && projectEnterZoom.width >= 1400 && projectEnterZoom.height >= 850, { ...projectEnterZoom, source: cardOrigin });
await sleep(300);
const detail = await evaluate(`(() => { const image = document.querySelector('.archive__project-cover'); return { hash: location.hash, title: document.querySelector('.archive__project-detail h2')?.textContent, image: image?.getAttribute('src'), imageLoaded: Boolean(image?.complete && image.naturalWidth > 0) }; })()`);
await capture("z2-bioaz-1440x900");
check("World card enters the canonical project detail with a real illustration", detail.hash === "#index/build/bioaz-agent-workbench" && detail.title?.includes("BioAZ") && detail.imageLoaded, detail);
await tap('.archive__project-detail .language-switch button[lang="zh-CN"]');
await waitFor("document.documentElement.lang === 'zh-CN'");
const detailChinese = await evaluate("({ lang: document.documentElement.lang, title: document.querySelector('.archive__project-detail h2')?.textContent, summary: document.querySelector('.archive__project-summary')?.textContent, back: document.querySelector('.archive__back')?.textContent, meta: document.querySelector('.archive__project-meta')?.textContent })");
await capture("z2-bioaz-zh-1440x900");
check("Project detail copy, metadata and return control switch to Chinese", detailChinese.lang === "zh-CN" && Boolean(detailChinese.title) && detailChinese.summary?.includes("DMPK 报价") && detailChinese.back?.includes("返回") && detailChinese.meta?.includes("已发布"), detailChinese);
await tap(".archive__back");
await sleep(70);
const projectExitZoom = await evaluate(`({ phase: document.querySelector('.archive__project-detail')?.dataset.transition, clip: getComputedStyle(document.querySelector('.archive__project-detail')).clipPath })`);
check("Z2 returns through the same source hierarchy", projectExitZoom.phase === "exiting" && projectExitZoom.clip.includes("circle"), projectExitZoom);
await waitFor("document.querySelector('.leaf-world') && !document.querySelector('.archive__project-detail')");
check("Back returns to the source world", await evaluate("location.hash === '#index/build' && document.querySelector('.leaf-world')?.dataset"), await evaluate("({ hash: location.hash, world: !!document.querySelector('.leaf-world') })"));

await tap('.leaf-world__world-nav button:nth-child(2)');
await waitFor("location.hash === '#index/question' && document.querySelector('.leaf-world__world-nav button:nth-child(2)')?.getAttribute('aria-current') === 'page'");
const question = await evaluate("({ hash: location.hash, title: document.querySelector('.leaf-world h2')?.textContent, active: document.querySelector('.leaf-world__world-nav button:nth-child(2)')?.getAttribute('aria-current') })");
check("Z1 can switch themes without leaving the world", question.hash === "#index/question" && question.active === "page", question);

await click('.leaf-world .language-switch button[lang="zh-CN"]');
await waitFor("document.documentElement.lang === 'zh-CN'");
const chinese = await evaluate("({ lang: document.documentElement.lang, hero: document.querySelector('#archive-title')?.textContent, world: document.querySelector('.leaf-world h2')?.textContent, experience: document.querySelector('#resume')?.innerText.includes('实习') })");
await capture("z1-question-zh-1440x900");
check("Chinese copy reaches resume, world and document language", chinese.lang === "zh-CN" && chinese.hero?.includes("记录我构建") && chinese.world?.includes("追问") && chinese.experience, chinese);

await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await waitFor("location.hash === '#index' && !document.querySelector('.leaf-world')");
check("Escape exits Z1 and restores the overview", await evaluate("location.hash === '#index' && !document.querySelector('.leaf-world')"), await evaluate("({ hash: location.hash, focused: !!document.querySelector('.leaf-world') })"));

await sleep(650);
const restoredFocus = await evaluate("document.activeElement?.getAttribute('data-heart-theme')");
check("Closing Z1 restores focus to the originating clover leaf", restoredFocus === "question", { activeLeaf: restoredFocus });

await evaluate("document.querySelector('[data-heart-theme=build]')?.focus({ preventScroll: true }); true");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
await waitFor("location.hash === '#index/question' && Boolean(document.querySelector('.leaf-world'))");
await sleep(100);
const keyboardNavigation = await evaluate("({ hash: location.hash, world: document.querySelector('.leaf-world h2')?.textContent, focus: document.activeElement === document.querySelector('.leaf-world') })");
check("Keyboard ArrowRight selects the next leaf and moves focus into Z1", keyboardNavigation.hash === "#index/question" && keyboardNavigation.focus && Boolean(keyboardNavigation.world), keyboardNavigation);
await pressEscape();
await waitFor("location.hash === '#index' && !document.querySelector('.leaf-world')");
await sleep(650);
const keyboardExitFocus = await evaluate("document.activeElement?.getAttribute('data-heart-theme')");
check("Keyboard Escape restores focus to the selected clover leaf", keyboardExitFocus === "question", { activeLeaf: keyboardExitFocus });

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await tap('[data-heart-theme="build"]');
await waitFor("location.hash === '#index/build' && Boolean(document.querySelector('.leaf-world'))");
await sleep(60);
const reducedMotion = await evaluate("({ matches: matchMedia('(prefers-reduced-motion: reduce)').matches, phase: document.querySelector('.leaf-world-shell')?.dataset.transition, duration: getComputedStyle(document.querySelector('.leaf-world-shell__dock')).transitionDuration, clip: getComputedStyle(document.querySelector('.leaf-world-shell__dock')).clipPath })");
check("Reduced Motion disables the circular transition while preserving immediate navigation", reducedMotion.matches && reducedMotion.phase === "focused" && (reducedMotion.duration.includes("0.00001") || reducedMotion.duration.includes("1e-05")) && reducedMotion.clip === "none", reducedMotion);
await pressEscape();
await waitFor("location.hash === '#index' && !document.querySelector('.leaf-world')");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

currentViewport = { width: 390, height: 844, deviceScaleFactor: 1, mobile: true };
process.stdout.write("MOBILE: set viewport\n");
await send("Emulation.setDeviceMetricsOverride", currentViewport);
process.stdout.write("MOBILE: navigate\n");
await navigate("#index");
process.stdout.write("MOBILE: capture z0\n");
await capture("z0-zh-mobile-390x844");
await tap(".archive__menu-toggle");
const mobileMenu = await evaluate("({ expanded: document.querySelector('.archive__menu-toggle')?.getAttribute('aria-expanded'), display: getComputedStyle(document.querySelector('.archive__nav')).display })");
check("Mobile navigation opens as an in-flow menu", mobileMenu.expanded === "true" && mobileMenu.display === "grid", mobileMenu);
await tap(".archive__menu-toggle");
process.stdout.write("MOBILE: click question\n");
await tap('[data-heart-theme="question"]');
process.stdout.write("MOBILE: wait world\n");
await waitFor("location.hash === '#index/question' && Boolean(document.querySelector('.leaf-world'))");
await sleep(450);
const mobile = await evaluate("({ hash: location.hash, overflow: document.documentElement.scrollWidth > innerWidth, world: !!document.querySelector('.leaf-world'), back: !!document.querySelector('.leaf-world__overlay-actions > button'), nav: document.querySelectorAll('.leaf-world__world-nav button').length, dockPosition: getComputedStyle(document.querySelector('.leaf-world-shell__dock')).position, dockTop: document.querySelector('.leaf-world-shell__dock').getBoundingClientRect().top })");
await capture("z1-question-zh-mobile-390x844");
check("Mobile single tap enters full-screen Z1 with return, four-world navigation and no horizontal overflow", mobile.hash === "#index/question" && !mobile.overflow && mobile.world && mobile.back && mobile.nav === 4 && mobile.dockPosition === "fixed" && Math.abs(mobile.dockTop) < 1, mobile);

await tap('[data-project-entry="zhang-zao"][data-project-context="theme-world"]');
await waitFor("location.hash === '#index/question/zhang-zao' && Boolean(document.querySelector('.archive__project-detail'))");
await sleep(450);
const mobileDetail = await evaluate("({ hash: location.hash, overflow: document.documentElement.scrollWidth > innerWidth, imageLoaded: Boolean(document.querySelector('.archive__project-cover')?.complete && document.querySelector('.archive__project-cover')?.naturalWidth > 0), width: document.querySelector('.archive__project-detail')?.getBoundingClientRect().width })");
await capture("z2-question-zh-mobile-390x844");
check("Mobile project detail opens with its real image and no horizontal overflow", mobileDetail.hash === "#index/question/zhang-zao" && !mobileDetail.overflow && mobileDetail.imageLoaded && mobileDetail.width === 390, mobileDetail);
await tap(".archive__back");
await waitFor("location.hash === '#index/question' && !document.querySelector('.archive__project-detail')");
check("A real touch on the detail return control goes back to its world", await evaluate("location.hash === '#index/question' && !document.querySelector('.archive__project-detail')"), await evaluate("({ hash: location.hash })"));
await tap('[data-project-entry="zhang-zao"][data-project-context="theme-world"]');
await waitFor("location.hash === '#index/question/zhang-zao' && Boolean(document.querySelector('.archive__project-detail'))");
await evaluate("history.back(); true");
await waitFor("location.hash === '#index/question' && !document.querySelector('.archive__project-detail')");
check("Browser history Back reverses the project overlay into Z1", await evaluate("location.hash === '#index/question' && !document.querySelector('.archive__project-detail')"), await evaluate("({ hash: location.hash })"));
await sleep(450);
await tap('.leaf-world__overlay-actions > button');
await waitFor("location.hash === '#index' && !document.querySelector('.leaf-world')");
await sleep(560);

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
