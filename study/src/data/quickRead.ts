export const quickReadPageIds = ["experience", "education", "work"] as const;
export type QuickReadPageId = (typeof quickReadPageIds)[number];

export const isQuickReadPageId = (value: string | undefined): value is QuickReadPageId =>
  Boolean(value && quickReadPageIds.includes(value as QuickReadPageId));
