/** Browser rehearsal for the three follow-up interaction comments. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cdpPort = Number(process.env.STUDY_CDP_PORT || 9224);
const baseUrl = process.env.STUDY_URL || "http://127.0.0.1:5175/";
const outputDir = path.resolve("audit/evidence/annotation-follow-up");
await mkdir(outputDir, { recursive: true });

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 1;
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  });
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const send = async (method, params = {}) => {
    await ready;
    return new Promise((resolve, reject) => {
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
  };
  return { socket, send };
}

const browserVersion = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json();
const browser = connect(browserVersion.webSocketDebuggerUrl);
const created = await browser.send("Target.createTarget", { url: baseUrl });
const targetId = created.targetId;
let page;
let pageTarget;
const checks = [];
function check(name, passed, observed) {
  const result = { name, passed: Boolean(passed), observed };
  checks.push(result);
  process.stdout.write(`${result.passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify(observed)}\n`);
  assert.ok(result.passed, name);
}
async function until(evaluate, expression, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
async function capture(send, name, clip) {
  const params = { format: "png", fromSurface: true, captureBeyondViewport: false };
  if (clip) params.clip = clip;
  const result = await send("Page.captureScreenshot", params);
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
}

try {
  const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
  page = targets.find((target) => target.id === targetId && target.type === "page");
  assert.ok(page, `Could not find target ${targetId}`);
  pageTarget = connect(page.webSocketDebuggerUrl);
  const send = pageTarget.send;
  await Promise.all([
    send("Page.enable"),
    send("Runtime.enable"),
    send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }),
    send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] }),
  ]);
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await until(evaluate, "Boolean(document.querySelector('.archive .heartwheel__stage'))");
  await until(evaluate, "!document.querySelector('.speech-loader:not(.speech-loader--hidden)')");
  await new Promise((resolve) => setTimeout(resolve, 250));

  await evaluate("document.querySelector('[data-heart-theme=\"keep\"]').focus({focusVisible:true})");
  await new Promise((resolve) => setTimeout(resolve, 180));
  const focus = await evaluate(`(() => {
    const label=document.querySelector('[data-heart-theme="keep"]');
    const style=getComputedStyle(label);
    const mark=getComputedStyle(label,'::after');
    return {focusVisible:label.matches(':focus-visible'),outline:style.outlineStyle,outlineWidth:style.outlineWidth,
      background:style.backgroundColor,markerOpacity:mark.opacity,markerWidth:mark.width,markerColor:mark.backgroundColor};
  })()`);
  check("Theme keyboard focus uses an editorial marker instead of a rectangle",
    focus.focusVisible && focus.outline === "none" && focus.background === "rgba(0, 0, 0, 0)" &&
    Number(focus.markerOpacity) > 0.9 && parseFloat(focus.markerWidth) >= 20,
    focus);
  await capture(send, "theme-focus-detail-1440x900", { x: 150, y: 250, width: 390, height: 390, scale: 2 });

  await evaluate("document.activeElement.blur()");
  const cornerBefore = await evaluate(`(() => {
    const button=document.querySelector('.paper-corner');
    const leaf=button.querySelector('.paper-corner__leaf');
    const r=button.getBoundingClientRect();
    return {button:{left:r.left,top:r.top,width:r.width,height:r.height},transform:getComputedStyle(leaf).transform,
      transformOrigin:getComputedStyle(leaf).transformOrigin,labelTransform:getComputedStyle(button.querySelector('.paper-corner__label')).transform};
  })()`);
  const cornerPoint = await evaluate(`(() => {const r=document.querySelector('.paper-corner').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
  await capture(send, "paper-corner-rest-detail-1440x900", { x: 1350, y: 0, width: 90, height: 100, scale: 3 });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: cornerPoint.x, y: cornerPoint.y });
  await new Promise((resolve) => setTimeout(resolve, 120));
  const cornerMid = await evaluate(`(() => ({transform:getComputedStyle(document.querySelector('.paper-corner__leaf')).transform,
    labelTransform:getComputedStyle(document.querySelector('.paper-corner__label')).transform}))()`);
  await capture(send, "paper-corner-mid-hover-detail-1440x900", { x: 1350, y: 0, width: 90, height: 100, scale: 3 });
  await new Promise((resolve) => setTimeout(resolve, 340));
  const cornerHover = await evaluate(`(() => {
    const button=document.querySelector('.paper-corner');
    const leaf=button.querySelector('.paper-corner__leaf');
    const r=button.getBoundingClientRect();
    const matrix=new DOMMatrixReadOnly(getComputedStyle(leaf).transform);
    return {hovered:button.matches(':hover'),button:{left:r.left,top:r.top,width:r.width,height:r.height},
      transform:getComputedStyle(leaf).transform,hinge:getComputedStyle(leaf).transformOrigin,
      translation:{x:matrix.m41,y:matrix.m42},labelTransform:getComputedStyle(button.querySelector('.paper-corner__label')).transform,
      shadow:getComputedStyle(leaf).boxShadow};
  })()`);
  check("Paper fold responds around its diagonal hinge without moving the control or label", cornerHover.hovered &&
    cornerHover.hinge.startsWith("0px 0px") && Math.abs(cornerHover.translation.x) < 0.1 &&
    Math.abs(cornerHover.translation.y) < 0.1 && cornerHover.labelTransform === "none" &&
    cornerHover.transform !== cornerBefore.transform && cornerHover.button.left === cornerBefore.button.left &&
    cornerHover.button.top === cornerBefore.button.top && cornerMid.transform !== cornerBefore.transform &&
    cornerMid.transform !== cornerHover.transform && cornerMid.labelTransform === "none",
    { before: cornerBefore, mid: cornerMid, hover: cornerHover });
  await capture(send, "paper-corner-hover-detail-1440x900", { x: 1350, y: 0, width: 90, height: 100, scale: 3 });

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await new Promise((resolve) => setTimeout(resolve, 120));
  const reduced = await evaluate(`(() => ({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,
    leafTransform:getComputedStyle(document.querySelector('.paper-corner__leaf')).transform}))()`);
  check("Reduced motion removes the expressive fold transform", reduced.matches && reduced.leafTransform === "none", reduced);
  await capture(send, "paper-corner-reduced-motion-detail-1440x900", { x: 1350, y: 0, width: 90, height: 100, scale: 3 });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

  await evaluate("document.querySelector('.paper-corner').click()");
  await until(evaluate, "location.hash === '#room'");
  await until(evaluate, "Boolean(document.querySelector('.hud .hud__actions .hud__btn--icon'))");
  await new Promise((resolve) => setTimeout(resolve, 300));
  const exitPoint = await evaluate(`(() => {const r=document.querySelector('.room-exit').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: exitPoint.x, y: exitPoint.y });
  const exitHover = await evaluate(`(() => {
    const button=document.querySelector('.room-exit');
    return {hovered:button.matches(':hover'),ariaLabel:button.getAttribute('aria-label'),
      symbolTransform:getComputedStyle(button.firstElementChild).transform,
      beforeTransform:getComputedStyle(button.firstElementChild,'::before').transform,
      afterTransform:getComputedStyle(button.firstElementChild,'::after').transform};
  })()`);
  check("Room return control keeps its close meaning on hover", exitHover.hovered &&
    /index/i.test(exitHover.ariaLabel) && exitHover.symbolTransform === "none" &&
    exitHover.beforeTransform !== exitHover.afterTransform, exitHover);
  const roomControls = await evaluate(`(() => ({
    iconButtons:[...document.querySelectorAll('.hud__actions .hud__btn--icon')].map(button=>button.getAttribute('aria-label')),
    tactileLabels:[...document.querySelectorAll('.hud button')].map(button=>button.getAttribute('aria-label')).filter(label=>/tactile|触觉|机械反馈/i.test(label||'')),
    slider:Boolean(document.querySelector('.hud__brightness')),
    hud:document.querySelector('.hud')?.getBoundingClientRect().toJSON()
  }))()`);
  check("Room HUD keeps the lamp power control and brightness slider without a global tactile toggle",
    roomControls.iconButtons.length === 1 && roomControls.tactileLabels.length === 0 && roomControls.slider,
    roomControls);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 720, y: 120 });
  await capture(send, "room-hud-controls-detail-1440x900", { x: 1160, y: 0, width: 280, height: 110, scale: 2 });

  const report = { date: new Date().toISOString(), browser: "Microsoft Edge via DevTools Protocol",
    url: baseUrl, viewport: [1440, 900], checks };
  await writeFile(path.join(outputDir, "comment-fixes-report.json"), JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(`\n${checks.length}/${checks.length} comment-fix checks passed. Evidence: ${outputDir}\n`);
} finally {
  pageTarget?.socket.close();
  await browser.send("Target.closeTarget", { targetId }).catch(() => {});
  browser.socket.close();
}
