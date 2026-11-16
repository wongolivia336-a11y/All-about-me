import { BLUR_FRAGMENT, CARD_FRAGMENT, VERTEX } from './shaders';

export type Finish = 'polished' | 'satin' | 'ticket';

export interface RenderFrame {
  time: number;
  tiltX: number;
  tiltY: number;
  finish: Finish;
  tint: string;
  pointerX: number;
  pointerY: number;
  hover: number;
}

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

const ENV_WIDTH = 320;
const ENV_HEIGHT = 500;
const MAX_DPR = 1.6;
const getDpr = () => Math.min(window.matchMedia("(max-width: 720px)").matches ? 1.2 : MAX_DPR, window.devicePixelRatio || 1);

function compile(gl: WebGL2RenderingContext, kind: number, source: string) {
  const shader = gl.createShader(kind);
  if (!shader) throw new Error('Cannot create GLSL shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown GLSL compilation error';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function program(gl: WebGL2RenderingContext, fragment: string) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  let pixel: WebGLShader;
  try { pixel = compile(gl, gl.FRAGMENT_SHADER, fragment); }
  catch (error) { gl.deleteShader(vertex); throw error; }
  const handle = gl.createProgram();
  if (!handle) { gl.deleteShader(vertex); gl.deleteShader(pixel); throw new Error('Cannot create GLSL program'); }
  gl.attachShader(handle, vertex);
  gl.attachShader(handle, pixel);
  gl.linkProgram(handle);
  gl.deleteShader(vertex);
  gl.deleteShader(pixel);
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(handle) || 'Cannot link GLSL program';
    gl.deleteProgram(handle);
    throw new Error(message);
  }
  return handle;
}

function texture(gl: WebGL2RenderingContext, width: number, height: number) {
  const handle = gl.createTexture();
  if (!handle) throw new Error('Cannot create texture');
  gl.bindTexture(gl.TEXTURE_2D, handle);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  return handle;
}

function target(gl: WebGL2RenderingContext, width: number, height: number): Target {
  const color = texture(gl, width, height);
  const framebuffer = gl.createFramebuffer();
  if (!framebuffer) { gl.deleteTexture(color); throw new Error('Cannot create framebuffer'); }
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteTexture(color);
    gl.deleteFramebuffer(framebuffer);
    throw new Error('Blur framebuffer incomplete');
  }
  return { texture: color, framebuffer };
}

function paintEnvironment(ctx: CanvasRenderingContext2D, t: number) {
  // A real flat Canvas2D scene, NOT an equirectangular map or CSS gradient:
  // a neutral silver studio board with white softboxes. Pastel color is added
  // only by the cursor-following shader glint, never as a static painted wash.
  ctx.clearRect(0, 0, ENV_WIDTH, ENV_HEIGHT);
  ctx.fillStyle = '#e6eaed';
  ctx.fillRect(0, 0, ENV_WIDTH, ENV_HEIGHT);

  // Broad neutral panels give polished silver a readable value range.
  ctx.fillStyle = '#87939a';
  ctx.fillRect(-28, -10, 58, ENV_HEIGHT + 20);
  ctx.fillStyle = '#c3cbd0';
  ctx.fillRect(285, -12, 55, ENV_HEIGHT + 24);

  // Two hard white softbox strips. The horizontal and vertical GPU blur passes
  // diffuse these into white metallic reflections without revealing hard props.
  ctx.save();
  ctx.translate(226 + Math.sin(t * .17) * 8, 224);
  ctx.rotate(-0.27);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-17, -330, 42, 670);
  ctx.fillStyle = 'rgba(255,255,255,.91)';
  ctx.fillRect(-65, -295, 12, 630);
  ctx.restore();
}

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return [0.85, 0.9, 0.94];
  return [0, 2, 4].map(i => Number.parseInt(value.slice(i, i + 2), 16) / 255) as [number, number, number];
}

/**
 * Browser-level GPU fallback still samples the same neutral studio scene.
 * The semantic HTML foreground remains visible in either rendering mode.
 */
function createCanvasFallbackRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;
  const scene = document.createElement('canvas');
  scene.width = ENV_WIDTH;
  scene.height = ENV_HEIGHT;
  const sceneCtx = scene.getContext('2d', { alpha: false });
  if (!sceneCtx) return null;
  const softened = document.createElement('canvas');
  softened.width = ENV_WIDTH;
  softened.height = ENV_HEIGHT;
  const softCtx = softened.getContext('2d');
  if (!softCtx) return null;
  let width = 0;
  let height = 0;
  const render = ({ time, tiltX, tiltY, finish }: RenderFrame) => {
    const bounds = canvas.getBoundingClientRect();
    const dpr = getDpr();
    const w = Math.max(1, Math.round(bounds.width * dpr));
    const h = Math.max(1, Math.round(bounds.height * dpr));
    if (w !== width || h !== height) {
      width = w;
      height = h;
      canvas.width = width;
      canvas.height = height;
    }
    paintEnvironment(sceneCtx, time);
    softCtx.clearRect(0, 0, ENV_WIDTH, ENV_HEIGHT);
    softCtx.save();
    softCtx.filter = finish === 'satin' ? 'blur(45px)' : 'blur(20px)';
    softCtx.drawImage(scene, -24, -24, ENV_WIDTH + 48, ENV_HEIGHT + 48);
    softCtx.restore();

    const dx = Math.sin(tiltY * Math.PI / 180) * 48;
    const dy = -Math.sin(tiltX * Math.PI / 180) * 48;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#e9eff3';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = finish === 'satin' ? 0.19 : 0.42;
    ctx.drawImage(softened, dx - 20, dy - 20, w + 40, h + 40);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = finish === 'satin' ? 0.25 : 0.55;
    ctx.drawImage(softened, dx - 20, dy - 20, w + 40, h + 40);
    ctx.restore();
    // Metal edge catch: one understated highlight, no nested wireframe.
    ctx.strokeStyle = 'rgba(255,255,255,.83)';
    ctx.lineWidth = Math.max(1, dpr);
    ctx.strokeRect(1, 1, w - 2, h - 2);
  };
  return { render, dispose: () => { ctx.clearRect(0, 0, width, height); }, mode: 'canvas2d' as const };
}

/** Pure WebGL2. One renderer lives for one mounted card, then fully disposes. */
export function createMetalRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, premultipliedAlpha: false,
    depth: false, stencil: false, preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  });
  if (!gl) return createCanvasFallbackRenderer(canvas);

  const envCanvas = document.createElement('canvas');
  envCanvas.width = ENV_WIDTH;
  envCanvas.height = ENV_HEIGHT;
  const ctx = envCanvas.getContext('2d', { alpha: false });
  if (!ctx) return null;

  let blurProgram: WebGLProgram | null = null;
  let cardProgram: WebGLProgram | null = null;
  let envTexture: WebGLTexture | null = null;
  let first: Target | null = null;
  let second: Target | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let width = 0;
  let height = 0;

  const freeTargets = () => {
    for (const value of [first, second]) {
      if (value) {
        gl.deleteTexture(value.texture);
        gl.deleteFramebuffer(value.framebuffer);
      }
    }
    first = second = null;
  };

  const dispose = () => {
    freeTargets();
    if (envTexture) gl.deleteTexture(envTexture);
    if (blurProgram) gl.deleteProgram(blurProgram);
    if (cardProgram) gl.deleteProgram(cardProgram);
    if (vao) gl.deleteVertexArray(vao);
    envTexture = null;
    blurProgram = null;
    cardProgram = null;
    vao = null;
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  try {
    blurProgram = program(gl, BLUR_FRAGMENT);
    cardProgram = program(gl, CARD_FRAGMENT);
    envTexture = texture(gl, ENV_WIDTH, ENV_HEIGHT);
    vao = gl.createVertexArray();
    if (!vao) throw new Error('Cannot create VAO');
    gl.bindVertexArray(vao);
  } catch (error) {
    dispose();
    throw error;
  }

  const blurUniforms = {
    source: gl.getUniformLocation(blurProgram!, 'uSource'),
    step: gl.getUniformLocation(blurProgram!, 'uStep'),
  };
  const cardUniforms = {
    environment: gl.getUniformLocation(cardProgram!, 'uEnvironment'),
    blurred: gl.getUniformLocation(cardProgram!, 'uBlurred'),
    tilt: gl.getUniformLocation(cardProgram!, 'uTilt'),
    tint: gl.getUniformLocation(cardProgram!, 'uTint'),
    finish: gl.getUniformLocation(cardProgram!, 'uFinish'),
    time: gl.getUniformLocation(cardProgram!, 'uTime'),
    pointer: gl.getUniformLocation(cardProgram!, 'uPointer'),
    hover: gl.getUniformLocation(cardProgram!, 'uHover'),
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = getDpr();
    const nextWidth = Math.max(1, Math.round(rect.width * dpr));
    const nextHeight = Math.max(1, Math.round(rect.height * dpr));
    // Only resize canvas backing store and blur framebuffer when size or DPR changes.
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    canvas.width = width;
    canvas.height = height;
    freeTargets();
    first = target(gl, width, height);
    second = target(gl, width, height);
  };

  const sample = (unit: number, handle: WebGLTexture | null) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, handle);
  };

  const render = ({ time, tiltX, tiltY, tint, finish, pointerX, pointerY, hover }: RenderFrame) => {
    resize();
    if (!first || !second || !envTexture || !blurProgram || !cardProgram) return;

    paintEnvironment(ctx, time);
    sample(0, envTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Same allocated texture; only upload changed Canvas pixels each render frame.
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, envCanvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    gl.useProgram(blurProgram);
    gl.uniform1i(blurUniforms.source, 0);
    gl.uniform2f(blurUniforms.step, 1 / ENV_WIDTH, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, first.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    sample(0, first.texture);
    gl.uniform2f(blurUniforms.step, 0, 1 / height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, second.framebuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(cardProgram);
    sample(0, envTexture);
    sample(1, second.texture);
    gl.uniform1i(cardUniforms.environment, 0);
    gl.uniform1i(cardUniforms.blurred, 1);
    gl.uniform2f(cardUniforms.tilt, tiltX, tiltY);
    gl.uniform3fv(cardUniforms.tint, parseHex(tint));
    gl.uniform1f(cardUniforms.finish, finish === 'satin' ? 1 : finish === 'ticket' ? 2 : 0);
    gl.uniform1f(cardUniforms.time, time);
    gl.uniform2f(cardUniforms.pointer, pointerX, pointerY);
    gl.uniform1f(cardUniforms.hover, hover);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return { render, dispose, mode: 'webgl2' as const };
}
