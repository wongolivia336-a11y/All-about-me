/**
 * Development-only scene instrumentation.
 *
 * Open `?debug=scene#room` to expose the spatial
 * overlays. Extra comma-separated flags are available for isolated checks:
 * `wireframe`, `normals`, `shadows-off`, `postfx-off`, and individual
 * `ao-off`, `bloom-off`, `vignette-off`, `smaa-off` effect switches.
 * Nothing in this module is enabled in a production build.
 */
const debugQuery = () => {
  if (!import.meta.env.DEV || typeof window === "undefined") return new Set<string>();
  return new Set(
    new URLSearchParams(window.location.search)
      .get("debug")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
};

const flags = debugQuery();
const has = (flag: string) => flags.has("all") || flags.has(flag);

export const sceneDebug = {
  enabled: has("scene") || has("all"),
  wireframe: has("wireframe"),
  normals: has("normals"),
  shadowsEnabled: !has("shadows-off"),
  postFXEnabled: !has("postfx-off"),
  aoEnabled: !flags.has("ao-off"),
  bloomEnabled: !flags.has("bloom-off"),
  vignetteEnabled: !flags.has("vignette-off"),
  smaaEnabled: !flags.has("smaa-off"),
};
