const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Returns the viewport intersection of a right-corner reveal triangle.
 * The fourth point becomes the bottom intersection once the diagonal passes
 * the viewport height, allowing one continuous polygon to reach full cover.
 */
export function roomRevealClipPath(width: number, height: number, progress: number) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const normalized = clamp(progress, 0, 1);

  if (normalized <= 0.0001) {
    return "polygon(100% 0, 100% 0, 100% 0, 100% 0)";
  }

  const distance = normalized * (safeWidth + safeHeight);
  const topX = Math.max(0, safeWidth - distance);
  const rightY = Math.min(safeHeight, distance);
  const bottomX = Math.max(0, safeWidth + safeHeight - distance);

  return `polygon(${topX}px 0px, ${safeWidth}px 0px, ${safeWidth}px ${rightY}px, ${bottomX}px ${safeHeight}px)`;
}
