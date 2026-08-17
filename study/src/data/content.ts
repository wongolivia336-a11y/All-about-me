import type { HotspotId } from "./hotspots";

/**
 * Section copy. Replace the placeholder bodies with your own words — the
 * volumes here are roughly what the layout is designed for.
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
    kicker: "Web · GitHub",
    title: "代码与网页",
    body: "GitHub 的数据是实时拉取的，每次打开都是当前状态。LinkedIn 只能静态跳转——它的公开 API 在 2015 年就关停了。",
  },
  phone: {
    kicker: "App",
    title: "我写的东西",
    body: "公众号、小红书、网易云——发布在哪儿，就从哪个图标进。这几个平台都不开放 API，所以是跳转，不是嵌入。",
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
  // The music surface is MusicPanel, not the generic panel — but this entry
  // still has to exist, because the Index lists whatever `content` knows about.
  marshall: {
    kicker: "Music",
    title: "在听什么",
    body: "点音箱开始播放。歌单链接和音频文件都在 src/data/links.ts 和 public/audio/ 里配。",
  },
  posters: {
    kicker: "Cinema",
    title: "片单",
    body: "林奇、杨德昌、侯孝贤。墙上现在挂的是排版占位图——把海报文件放进 public/posters/，再在 data/films.ts 里填上路径就会自动替换。",
  },
  domi: {
    kicker: "Domi",
    title: "多米",
    body: "家里的猫。坐在椅子上，会呼吸。这一段留给你自己写。",
  },
};
