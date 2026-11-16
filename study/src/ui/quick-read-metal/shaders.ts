/** Self-contained GLSL ES 3.00. No video, camera, cubemap or external textures. */
export const VERTEX = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// Separable 9-tap Gaussian: first horizontal into FBO A, then vertical into FBO B.
export const BLUR_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uSource;
uniform vec2 uStep;
void main() {
  vec3 s = texture(uSource, vUv).rgb * 0.227027;
  s += (texture(uSource, vUv + uStep).rgb + texture(uSource, vUv - uStep).rgb) * 0.1945946;
  s += (texture(uSource, vUv + 2.0*uStep).rgb + texture(uSource, vUv - 2.0*uStep).rgb) * 0.1216216;
  s += (texture(uSource, vUv + 3.0*uStep).rgb + texture(uSource, vUv - 3.0*uStep).rgb) * 0.054054;
  s += (texture(uSource, vUv + 4.0*uStep).rgb + texture(uSource, vUv - 4.0*uStep).rgb) * 0.016216;
  outColor = vec4(s, 1.0);
}`;

export const CARD_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uEnvironment;
uniform sampler2D uBlurred;
uniform vec2 uTilt; // Exact degrees used by the card's CSS rotateX/rotateY.
uniform vec3 uTint; // One card's pastel glint, NOT its base material.
uniform float uFinish; // 0 mirror chrome, 1 brushed silver, 2 pearl chrome
uniform float uTime;
uniform vec2 uPointer;
uniform float uHover;

float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 vlv = vUv;
  vec2 edge2 = min(vlv, 1.0 - vlv);
  float edge = min(edge2.x, edge2.y);
  // Rounded corners are physically clipped by CSS; shader adds the bevel normals.
  vec2 bevel = vec2(
    (1.0 - smoothstep(0.0, 0.052, edge2.x)) * sign(0.5 - vlv.x),
    (1.0 - smoothstep(0.0, 0.052, edge2.y)) * sign(0.5 - vlv.y)
  );
  float grain = hash21(floor(vlv * vec2(760.0, 1190.0))) - 0.5;
  vec3 normal = normalize(vec3(
    bevel.x * 0.65 + sin(radians(uTilt.y)) * 0.72 + grain * 0.037,
    bevel.y * 0.65 - sin(radians(uTilt.x)) * 0.72 + grain * 0.037,
    1.0
  ));
  // Camera -> surface vector, then reflected direction. Environment is an actual
  // neutral-grey studio painted with white rectangular softboxes in Canvas2D.
  vec3 view = normalize(vec3((vlv - 0.5) * vec2(0.5, 0.8), -1.35));
  vec3 bounce = reflect(view, normal);
  vec2 q = clamp(bounce.xy / max(abs(bounce.z), 0.36), vec2(-1.0), vec2(1.0));
  vec2 uv = clamp(vlv + 0.12 * q, vec2(0.002), vec2(0.998));
  vec3 broad = texture(uBlurred, uv).rgb;
  vec3 sharp = texture(uEnvironment, uv).rgb;

  float isSatin = step(0.5, uFinish) * (1.0 - step(1.5, uFinish));
  float isPearl = step(1.5, uFinish);
  vec3 env = mix(broad, sharp, mix(0.12, 0.27, 1.0-isSatin));
  float studio = dot(env, vec3(0.299,0.587,0.114));
  float reflection = smoothstep(0.43, 0.98, studio);
  vec3 surface = mix(vec3(0.58,0.64,0.68), vec3(0.988,0.995,1.0), reflection);
  // Keep the studio reflection neutral silver. Pastel color is reserved for
  // the brief cursor-following glint below, never a static surface wash.
  surface += (env - vec3(studio)) * 0.35;
  surface = mix(surface, vec3(0.83,0.87,0.89), isSatin * 0.34);
  surface = mix(surface, surface * 0.88 + vec3(0.11), isPearl * 0.4);
  float metallicLight = pow(max(dot(normal, normalize(vec3(-0.38,0.52,1.0))), 0.0), 25.0);
  surface += vec3(0.15) * metallicLight;
  surface += grain * mix(0.011, 0.022, isSatin);

  // A wide, slanted iridescent swish follows the cursor instead of painting an
  // isolated coloured spot. Each card's assigned pastel dominates the glint.
  vec2 cursorDelta = vlv - uPointer;
  float sweep = cursorDelta.x + cursorDelta.y * 0.41
              + 0.038 * sin(vlv.y * 6.0 + uTime * 0.30);
  float beam = exp(-pow(sweep / 0.17, 2.0));
  float proximity = 1.0 - smoothstep(0.22, 0.85, length(cursorDelta));
  vec3 spectrum = vec3(0.0);
  spectrum += vec3(0.847,0.929,0.882) * exp(-pow((sweep+0.088)/0.12,2.0));
  spectrum += vec3(0.855,0.922,0.961) * exp(-pow(sweep/0.12,2.0));
  spectrum += vec3(0.961,0.871,0.847) * exp(-pow((sweep-0.088)/0.12,2.0));
  spectrum /= 2.15;
  vec3 chroma = mix(spectrum, uTint, 0.42);
  float chromaStrength = clamp(uHover,0.0,1.0) * proximity * beam;
  surface = mix(surface, chroma, chromaStrength * mix(0.28,0.18,isSatin));
  surface += vec3(0.035) * chromaStrength;

  float rim = 1.0-smoothstep(0.001, 0.009, edge);
  float rimInner = 1.0-smoothstep(0.011, 0.027, edge);
  vec3 rimColor = mix(vec3(1.0), vec3(0.55,0.64,0.70), step(0.46, vlv.x));
  surface = mix(surface, rimColor, rim * 0.52 + rimInner * 0.08);
  outColor = vec4(clamp(surface, 0.0, 1.0), 1.0);
}`;
