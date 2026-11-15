export const HEART_CURVES = [
  [-8, -18, -58, -46, -66, -88],
  [-73, -126, -28, -150, 0, -116],
  [28, -150, 73, -126, 66, -88],
  [58, -46, 8, -18, 0, 0],
] as const;

export const HEART_PATH = `M 0 0 ${HEART_CURVES.map((curve) => `C ${curve.join(" ")}`).join(" ")} Z`;
