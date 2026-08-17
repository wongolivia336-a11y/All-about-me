/**
 * Accounts.
 *
 * Only GitHub can be shown live. LinkedIn closed its public API in 2015, and
 * Xiaohongshu, WeChat Official Accounts and NetEase Cloud Music expose nothing
 * a static site may read. Those are honest outbound links, not stale caches
 * dressed up as live data.
 *
 * TODO: fill in the URLs marked `null` — they are yours to supply.
 */
export interface Account {
  id: string;
  label: string;
  handle: string;
  href: string | null;
  /** two-letter mark drawn on the phone's home screen icon */
  mark: string;
  tone: string;
  live?: boolean;
  note?: string;
}

export const GITHUB_USER = "wongolivia336-a11y";

/** Shown on the phone — the platforms you publish to. */
export const phoneApps: Account[] = [
  {
    id: "wechat",
    label: "公众号",
    handle: "微信公众号",
    href: null,
    mark: "微",
    tone: "#2aae67",
    note: "需要你提供文章主页链接或二维码图片",
  },
  {
    id: "xiaohongshu",
    label: "小红书",
    handle: "Xiaohongshu",
    href: null,
    mark: "书",
    tone: "#e2394a",
    note: "需要你提供主页链接",
  },
  {
    id: "netease",
    label: "网易云",
    handle: "NetEase Music",
    href: null,
    mark: "云",
    tone: "#d8322a",
    note: "需要你提供歌单链接",
  },
];

/** Shown on the laptop — professional identity. */
export const deskAccounts: Account[] = [
  {
    id: "github",
    label: "GitHub",
    handle: GITHUB_USER,
    href: `https://github.com/${GITHUB_USER}`,
    mark: "GH",
    tone: "#24292f",
    live: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "—",
    href: null,
    mark: "in",
    tone: "#0a66c2",
    note: "需要你提供主页链接；LinkedIn 无公开 API，只能静态跳转",
  },
];
