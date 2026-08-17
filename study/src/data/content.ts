import type { HotspotId } from "./hotspots";

/**
 * Placeholder copy. Everything here is meant to be replaced with the real
 * thing — it exists so the layout can be judged with realistic volumes of text
 * rather than lorem ipsum.
 */
export interface Section {
  title: string;
  kicker: string;
  body: string;
  items?: { title: string; meta: string }[];
  cta?: { label: string; href: string };
}

export const content: Partial<Record<HotspotId, Section>> = {
  laptop: {
    kicker: "Web",
    title: "网页与界面",
    body: "屏幕里跑的是真实项目。后续这块会换成 <Html transform> 承载的实际 DOM，可以直接在书桌上操作站点本身。",
    items: [
      { title: "Project One", meta: "2026 · 设计 + 前端" },
      { title: "Project Two", meta: "2025 · 界面系统" },
      { title: "Project Three", meta: "2024 · 品牌官网" },
    ],
  },
  phone: {
    kicker: "App",
    title: "移动端产品",
    body: "手机屏幕是可滑动的原型区。放交互录屏或真实的可点原型都可以。",
    items: [
      { title: "App One", meta: "2026 · 产品设计" },
      { title: "App Two", meta: "2024 · 概念原型" },
    ],
  },
  portfolio: {
    kicker: "Portfolio",
    title: "完整作品集",
    body: "20 个跨页，四个项目。点开在页面内直接翻，也可以下载 PDF。",
  },
  shelf: {
    kicker: "Reading",
    title: "书单与笔记",
    body: "每本书的书脊都可以点开，展开成封面加上你自己写的那段话。书单这种东西的价值全在批注里。",
    items: [
      { title: "书名占位一", meta: "读完 · 2026" },
      { title: "书名占位二", meta: "在读" },
      { title: "书名占位三", meta: "读完 · 2025" },
    ],
  },
  camera: {
    kicker: "Photography",
    title: "摄影",
    body: "点相机把桌上那叠照片摊开，铺成一面照片墙。",
  },
  board: {
    kicker: "About",
    title: "关于我",
    body: "软木板放最私人的内容：你是谁、最近在做什么、在想什么。手写体，别用正文字体——这块要跟作品区拉开语气。",
  },
};
