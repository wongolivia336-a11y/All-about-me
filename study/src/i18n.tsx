/* oxlint-disable react/only-export-components -- this module intentionally owns the language context and its copy helpers. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { ArchiveEntry, Collection, ContentStatus, ContentType, ThemeId } from "./data/library";
import { themeConfig } from "./data/themeConfig";
import { content, type Section } from "./data/content";
import type { HotspotId } from "./data/hotspots";

export type Language = "en" | "zh";

export interface Copy {
  language: string;
  switchToEnglish: string;
  switchToChinese: string;
  contact: string;
  archiveAria: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  seeSelected: string;
  startConversation: string;
  backToArchive: string;
  backToIndex: string;
  noPublishedEntries: string;
  practiceEyebrow: string;
  selectedWorks: string;
  selectedWorksDescription: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutBody: string;
  openLine: string;
  exploreRoom: string;
  projectTags: string;
  conceptualCaption: string;
  noPublicCover: string;
  overview: string;
  overviewAll: string;
  overviewAria: string;
  themeNavigation: string;
  themeGroup: string;
  selectTheme: string;
  fourThemeIndex: string;
  portfolioMapAria: string;
  privateIndex: string;
  seeProject: string;
  focusTheme: string;
  noThemeCover: string;
  exploreProject: string;
  viewAllTheme: string;
  overviewTitle: string;
  overviewDescription: string;
  currentTheme: string;
  focusAnnouncement: string;
  overviewAnnouncement: string;
  enterRoom: string;
  returnToIndex: string;
  loadingRoom: string;
  roomLoadError: string;
  retry: string;
  lampBrightness: string;
  turnLampOn: string;
  turnLampOff: string;
  closePanel: string;
  musicTitle: string;
  musicBody: string;
  play: string;
  pause: string;
  volume: string;
  audioMissing: string;
  openPlaylist: string;
  playlistMissing: string;
  musicRights: string;
  githubRateLimit: string;
  githubLoading: string;
  githubOpen: string;
  linkedinMissing: string;
  githubRepos: string;
  githubFollowers: string;
  githubTitle: string;
  githubKicker: string;
  musicKicker: string;
  cinemaKicker: string;
  phoneKicker: string;
  portfolioKicker: string;
  resumeEyebrow: string;
  experienceTitle: string;
  experienceBody: string;
  educationTitle: string;
  educationBody: string;
  selectedWorkTitle: string;
  selectedWorkBody: string;
  openExperience: string;
  openEducation: string;
  browseSelectedWork: string;
  cinemaBody: string;
  cinemaTitle: string;
  posterFallback: string;
  phoneLinksMissing: string;
  phoneSources: string;
  phoneTitle: string;
  phoneBody: string;
  portfolioTitle: string;
  portfolioLoadError: string;
  portfolioLoading: string;
  previousPage: string;
  nextPage: string;
  jumpToPage: string;
  jumpPageSuffix: string;
  themeType: Record<ContentType, string>;
  themeStatus: Record<ContentStatus, string>;
}

const translations: Record<Language, Copy> = {
  en: {
    language: "Language",
    switchToEnglish: "Switch language to English",
    switchToChinese: "切换语言为中文",
    contact: "Contact",
    archiveAria: "Olivia Wong / Four Hearts personal archive",
    heroEyebrow: "Design engineer / AI products / creative technology",
    heroTitle: "A living archive of things I build, question, play with, and keep.",
    heroLead: "I make human-centred tools and interactive systems for ideas that are still becoming.",
    seeSelected: "See selected work ↓",
    startConversation: "Start a conversation ↗",
    backToArchive: "← Back to archive",
    backToIndex: "← Back to Living Index",
    noPublishedEntries: "No published entries for this theme yet.",
    practiceEyebrow: "A cross-section of the practice",
    selectedWorks: "Selected works",
    selectedWorksDescription: "Three starting points across product, inquiry and interaction.",
    aboutEyebrow: "A note from the studio",
    aboutTitle: "Technical work, with attention to how it feels to be inside.",
    aboutBody: "I work where interaction, systems and human attention meet. The work can be technical, but it starts with noticing what people need to feel understood.",
    openLine: "Open line",
    exploreRoom: "Explore Room ↗",
    projectTags: "tags",
    conceptualCaption: "Conceptual artwork · not a project screenshot or result.",
    noPublicCover: "No public cover yet",
    overview: "← Overview",
    overviewAll: "Overview · 4 themes",
    overviewAria: "Return to the four-theme overview",
    themeNavigation: "Four Hearts theme navigation",
    themeGroup: "Four Hearts themes",
    selectTheme: "Select ",
    fourThemeIndex: "THE LIVING INDEX",
    portfolioMapAria: "Four-theme visual index",
    privateIndex: "PRIVATE INDEX",
    seeProject: "View project: ",
    focusTheme: "Focus ",
    noThemeCover: "no public cover",
    exploreProject: "Explore project ↗",
    viewAllTheme: "View all ",
    overviewTitle: "Four hearts. Four ways of seeing.",
    overviewDescription: "A selection of real projects, questions, experiments and things worth keeping.",
    currentTheme: "Current theme: ",
    focusAnnouncement: " is open. Select the same leaf again to return to the overview.",
    overviewAnnouncement: "Four-theme overview is open.",
    enterRoom: "Enter Room",
    returnToIndex: "Return to Index",
    loadingRoom: "Loading Room",
    roomLoadError: "Room resources could not load.",
    retry: "Retry",
    lampBrightness: "Desk lamp brightness",
    turnLampOn: "Turn desk lamp on",
    turnLampOff: "Turn desk lamp off",
    closePanel: "Return to room",
    musicTitle: "Now playing",
    musicBody: "Tap the speaker to play. Add an audio file at public/audio/now-playing.mp3 to use it here.",
    play: "▶  Play",
    pause: "⏸  Pause",
    volume: "Volume",
    audioMissing: "Audio is unavailable because public/audio/now-playing.mp3 has not been added.",
    openPlaylist: "Open the full playlist on NetEase Cloud Music →",
    playlistMissing: "NetEase Cloud Music playlist link not set.",
    musicRights: "Public playback of copyrighted music requires permission. Your own recordings or licensed tracks are safest.",
    githubRateLimit: "GitHub rate limit reached. Please try again later.",
    githubLoading: "Loading GitHub…",
    githubOpen: "Open GitHub profile",
    linkedinMissing: "LinkedIn link not set — the profile can only be opened as a static link.",
    githubRepos: "repositories",
    githubFollowers: "followers",
    githubTitle: "Code and the web",
    githubKicker: "Web · GitHub",
    musicKicker: "Music",
    cinemaKicker: "Cinema",
    phoneKicker: "Apps",
    portfolioKicker: "Portfolio",
    resumeEyebrow: "A quick read",
    experienceTitle: "BioAZ / AI product + agent workflows",
    experienceBody: "Internship practice across product UI, agent workflow prototypes and reviewable systems.",
    educationTitle: "Tongji University / Huaqiao University",
    educationBody: "AI & Data Design / Industrial Design — a practice grounded in research, making and visual thinking.",
    selectedWorkTitle: "BioAZ · KNOCK KNOCK · 侨批",
    selectedWorkBody: "Three representative starting points across product, interaction and research.",
    openExperience: "Open BUILD",
    openEducation: "Open QUESTION",
    browseSelectedWork: "Browse selected work",
    cinemaBody: "Nine films on the wall, by three directors watched most often.",
    cinemaTitle: "Film shelf",
    posterFallback: "Typeset placeholders are shown until the poster assets are added.",
    phoneLinksMissing: "Link not set",
    phoneSources: "Add profile URLs in src/data/links.ts to activate these links.",
    phoneTitle: "Things I write",
    phoneBody: "Open each platform from its own icon. These services do not offer public APIs, so the links open the original sites instead of embedding them.",
    portfolioTitle: "Portfolio · 2022—2026",
    portfolioLoadError: "Could not load the portfolio:",
    portfolioLoading: "Loading portfolio…",
    previousPage: "Previous page",
    nextPage: "Next page",
    jumpToPage: "Go to page ",
    jumpPageSuffix: "",
    themeType: { project: "Project", research: "Research", experiment: "Experiment", object: "Object" },
    themeStatus: { published: "Published", prototype: "Prototype", draft: "Draft", private: "Private" },
  },
  zh: {
    language: "语言",
    switchToEnglish: "Switch language to English",
    switchToChinese: "切换语言为中文",
    contact: "联系",
    archiveAria: "王心蕊 / Four Hearts 个人档案",
    heroEyebrow: "设计工程 / AI 产品 / 创意技术",
    heroTitle: "记录我构建、追问、试验与珍藏的事物。",
    heroLead: "我为仍在成形中的想法，设计以人为本的工具与交互系统。",
    seeSelected: "查看精选作品 ↓",
    startConversation: "开始交流 ↗",
    backToArchive: "← 返回档案",
    backToIndex: "← 返回主题索引",
    noPublishedEntries: "这个主题暂时没有公开内容。",
    practiceEyebrow: "实践的一组切面",
    selectedWorks: "精选作品",
    selectedWorksDescription: "从产品、研究与交互开始了解我的实践。",
    aboutEyebrow: "来自工作室的一段话",
    aboutTitle: "关注技术，也关注身处其中的感受。",
    aboutBody: "我在交互、系统与人的注意力交汇处工作。工作可以很技术，但起点是留意人们需要怎样的理解与回应。",
    openLine: "保持联系",
    exploreRoom: "探索 Room ↗",
    projectTags: "标签",
    conceptualCaption: "概念视觉 · 非项目截图或实际成果。",
    noPublicCover: "暂无公开封面",
    overview: "← 返回概览",
    overviewAll: "概览 · 4 个主题",
    overviewAria: "返回四个主题概览",
    themeNavigation: "Four Hearts 主题导航",
    themeGroup: "Four Hearts 主题",
    selectTheme: "选择 ",
    fourThemeIndex: "四叶生活索引",
    portfolioMapAria: "四个主题的作品视觉索引",
    privateIndex: "私人索引",
    seeProject: "查看项目：",
    focusTheme: "聚焦 ",
    noThemeCover: "暂无公开封面",
    exploreProject: "查看项目 ↗",
    viewAllTheme: "查看全部 ",
    overviewTitle: "四颗心，四种观看方式。",
    overviewDescription: "一些真实项目、问题、实验，以及值得留下的事物。",
    currentTheme: "当前主题：",
    focusAnnouncement: " 已展开。再次选择该叶片可返回概览。",
    overviewAnnouncement: "四主题概览已打开。",
    enterRoom: "进入 Room",
    returnToIndex: "返回主题索引",
    loadingRoom: "正在载入 Room",
    roomLoadError: "Room 场景资源载入失败。",
    retry: "重试",
    lampBrightness: "台灯亮度",
    turnLampOn: "打开台灯",
    turnLampOff: "关闭台灯",
    closePanel: "返回房间",
    musicTitle: "正在播放",
    musicBody: "点击音箱开始播放。添加 public/audio/now-playing.mp3 音频文件后即可使用。",
    play: "▶  播放",
    pause: "⏸  暂停",
    volume: "音量",
    audioMissing: "音频暂不可用：尚未添加 public/audio/now-playing.mp3。",
    openPlaylist: "在网易云音乐打开完整歌单 →",
    playlistMissing: "尚未设置网易云音乐歌单链接。",
    musicRights: "公开播放受版权保护的音乐需要授权。使用自己的录音或已获授权的曲目更稳妥。",
    githubRateLimit: "GitHub 接口调用频率超限，请稍后再试。",
    githubLoading: "正在读取 GitHub…",
    githubOpen: "打开 GitHub 主页",
    linkedinMissing: "尚未设置 LinkedIn 链接；目前只能作为静态链接打开。",
    githubRepos: "个仓库",
    githubFollowers: "位关注者",
    githubTitle: "代码与网页",
    githubKicker: "网页 · GitHub",
    musicKicker: "音乐",
    cinemaKicker: "电影",
    phoneKicker: "应用",
    portfolioKicker: "作品集",
    resumeEyebrow: "快速了解",
    experienceTitle: "BioAZ / AI 产品与 Agent 工作流",
    experienceBody: "实习实践覆盖产品界面、Agent workflow 原型与可审阅的系统设计。",
    educationTitle: "同济大学 / 华侨大学",
    educationBody: "AI & Data Design / 工业设计——从研究、制作与视觉思考出发的设计实践。",
    selectedWorkTitle: "BioAZ · KNOCK KNOCK · 侨批",
    selectedWorkBody: "从产品、交互与研究开始了解我的三组代表性工作。",
    openExperience: "打开 BUILD",
    openEducation: "打开 QUESTION",
    browseSelectedWork: "查看精选作品",
    cinemaBody: "墙上的九部电影，来自最常观看的三位导演。",
    cinemaTitle: "片单",
    posterFallback: "目前显示的是排版占位图，添加海报素材后会替换。",
    phoneLinksMissing: "链接待补",
    phoneSources: "在 src/data/links.ts 中添加个人主页地址即可启用链接。",
    phoneTitle: "我写的东西",
    phoneBody: "发布在哪儿，就从哪个图标进。这些平台不开放 API，因此这里提供的是跳转链接，而非嵌入内容。",
    portfolioTitle: "作品集 · 2022—2026",
    portfolioLoadError: "作品集载入失败：",
    portfolioLoading: "正在载入作品集…",
    previousPage: "上一页",
    nextPage: "下一页",
    jumpToPage: "跳到第 ",
    jumpPageSuffix: " 页",
    themeType: { project: "项目", research: "研究", experiment: "实验", object: "物件" },
    themeStatus: { published: "已发布", prototype: "原型", draft: "草稿", private: "私密" },
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Copy;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "four-hearts-language";

function readLanguage(): Language {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(readLanguage);
  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The switch still works for this session when storage is unavailable.
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, copy: translations[language] }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

const chineseThemeText: Record<ThemeId, { label: string; descriptor: string; shortLabel: string; description: string; verb: string; texture: readonly string[] }> = {
  build: { label: "构建", descriptor: "AI 产品", shortLabel: "我构建的", description: "把 AI 产品、界面与系统做成能在现实中派上用场的工具。", verb: "让系统变得清晰", texture: ["系统", "交付", "关照", "迭代", "界面"] },
  question: { label: "追问", descriptor: "研究 / HCI", shortLabel: "我追问的", description: "为尚不明朗的事物寻找证据、开展研究，并形成视觉论证。", verb: "和问题多待一会儿", texture: ["为什么", "证据", "图谱", "观察", "方法"] },
  play: { label: "玩耍", descriptor: "创意技术", shortLabel: "我试验的", description: "有生命力的创意技术、原型与小型实验。", verb: "跟随好奇心", texture: ["尝试", "倾听", "循环", "制作", "再来"] },
  keep: { label: "珍藏", descriptor: "电影 / 物件", shortLabel: "我珍藏的", description: "为值得再度翻阅的参考、物件与记忆留一方安静的架子。", verb: "留下重要的事物", texture: ["阅读", "观看", "聆听", "收藏", "记住"] },
};

export function themeText(theme: ThemeId, language: Language) {
  const definition = themeConfig[theme];
  return language === "zh" ? { ...definition, ...chineseThemeText[theme] } : definition;
}

interface ProjectText {
  title: string;
  summary: string;
  tags: readonly string[];
}

const projectTextById: Record<string, Record<Language, ProjectText>> = {
  "bioaz-agent-workbench": {
    en: { title: "BioAZ Agent Workbench", summary: "A reviewable agent-workflow prototype for DMPK quotes and oncology reports.", tags: ["AI products", "Agent workflow", "Prototype"] },
    zh: { title: "BioAZ Agent Workbench", summary: "将 DMPK 报价和肿瘤报告整理为可审阅的 Agent workflow 原型。", tags: ["AI 产品", "Agent 工作流", "原型"] },
  },
  healther: {
    en: { title: "Healther", summary: "A local-first health tool for reminders, records, report organization and trusted health information.", tags: ["Health", "Local-first", "Product system"] },
    zh: { title: "Healther", summary: "本地优先的长期健康管理工具：提醒、记录、报告整理与可信科普。", tags: ["健康", "本地优先", "产品系统"] },
  },
  "meow-gallery": {
    en: { title: "meow gallery", summary: "A small ritual for pausing with real cat sounds—easy to ignore, worth stopping for.", tags: ["Creative technology", "Sound", "Personal experiment"] },
    zh: { title: "meow gallery", summary: "把真实猫叫做成可被忽略、也值得停一下的休息仪式。", tags: ["创意技术", "声音", "个人实验"] },
  },
  "knock-knock": {
    en: { title: "KNOCK KNOCK", summary: "An interaction prototype for a companion robot that builds connection through light, sound and waiting.", tags: ["Interaction", "Light", "Companion robot"] },
    zh: { title: "KNOCK KNOCK", summary: "一个通过光、声音和等待建立关系的陪伴机器人交互原型。", tags: ["交互", "光", "陪伴机器人"] },
  },
  "zhang-zao": {
    en: { title: "Two Sides of a Mirror", summary: "A multidimensional text-visualization study on bringing classical imagery into contemporary experience.", tags: ["Research", "Text visualization", "Culture"] },
    zh: { title: "镜子的两面", summary: "古典意象如何进入现代经验的多维文本可视化研究。", tags: ["研究", "文本可视化", "文化"] },
  },
  qiaopi: {
    en: { title: "A Letter, After It Arrives", summary: "A data narrative tracing overseas remittance letters to a village in Chaoshan.", tags: ["Data story", "Archive", "Geography"] },
    zh: { title: "一封侨批，抵达之后", summary: "从海外寄批地到潮汕村庄的侨批数据叙事。", tags: ["数据叙事", "档案", "地理"] },
  },
  "film-shelf": {
    en: { title: "Film shelf", summary: "A small shelf for returning to the films of Lynch, Edward Yang and Hou Hsiao-hsien.", tags: ["Cinema", "Film notes", "Room object"] },
    zh: { title: "Film shelf / 片单", summary: "一方小小的架子，留给林奇、杨德昌与侯孝贤的电影。", tags: ["电影", "观影笔记", "房间物件"] },
  },
};

const linkLabels: Record<string, Record<Language, string>> = {
  "打开原型": { en: "Open prototype", zh: "打开原型" },
  "打开作品": { en: "View project", zh: "打开作品" },
  "打开研究": { en: "View research", zh: "打开研究" },
};

export function projectText(entry: ArchiveEntry, language: Language) {
  const localized = projectTextById[entry.id]?.[language];
  return {
    title: localized?.title ?? entry.title,
    summary: localized?.summary ?? entry.summary,
    tags: localized?.tags ?? entry.tags,
    type: translations[language].themeType[entry.type],
    status: translations[language].themeStatus[entry.status],
    links: entry.links.map((link) => linkLabels[link.label]?.[language] ?? link.label),
  };
}

const englishSections: Partial<Record<HotspotId, Section>> = {
  laptop: { kicker: "Web · GitHub", title: "Code and the web", body: "GitHub data is fetched live, so each visit shows the current state. LinkedIn is a static link; its public API was discontinued in 2015." },
  phone: { kicker: "App", title: "Things I write", body: "Open each platform from its own icon. These services do not offer public APIs, so the links open the original sites instead of embedding them." },
  portfolio: { kicker: "Portfolio", title: "Complete portfolio", body: "Twenty pages across four projects. Browse it here or download the PDF." },
  shelf: { kicker: "Reading", title: "Books and notes", body: "Each spine opens a cover and a personal note. The notes are the part that makes a reading list worth returning to.", items: [{ title: "Book title placeholder 1", meta: "Finished · 2026" }, { title: "Book title placeholder 2", meta: "In progress" }, { title: "Book title placeholder 3", meta: "Finished · 2025" }] },
  camera: { kicker: "Photography", title: "Photography", body: "Tap the camera to spread the photographs from the desk into a wall of images." },
  board: { kicker: "About", title: "About", body: "The corkboard is for personal notes: who you are, what you are working on, and what is on your mind. This space is intentionally distinct from the work area." },
  marshall: { kicker: "Music", title: "Now playing", body: "Tap the speaker to start playback. Configure the playlist link and audio file in the project data and public audio folder." },
  posters: { kicker: "Cinema", title: "Film shelf", body: "Lynch, Edward Yang and Hou Hsiao-hsien. The wall currently uses typeset placeholders until real poster assets are added." },
  domi: { kicker: "Domi", title: "Domi", body: "The family cat. She breathes, blinks, looks around and swishes her tail when tapped. Add a recording to public/audio/domi-meow.mp3 to hear her meow." },
  sketchbook: { kicker: "Sketchbook", title: "Sketchbook", body: "The open spread is dot-grid paper. No sketches have been fabricated; real scans can replace it when available." },
  materials: { kicker: "Materials", title: "Material samples", body: "Aluminium, oak, injection-moulded plastic, wool, frosted glass and glazed ceramic. Their differences come from metalness, roughness, clearcoat and transmission under the same lighting." },
  whiteboard: { kicker: "In progress", title: "What is still unresolved", body: "The board gives a physical form to the line, “I like building where things are still a little unclear”: a half-drawn flow, two dashed arrows, a question mark and traces of erasure." },
};

const englishHotspots: Record<HotspotId, { label: string; blurb: string }> = {
  laptop: { label: "Work", blurb: "Projects and systems" },
  phone: { label: "Apps", blurb: "Mobile products and prototypes" },
  portfolio: { label: "Portfolio", blurb: "Portfolio PDF" },
  shelf: { label: "Reading", blurb: "Books and reading notes" },
  camera: { label: "Photography", blurb: "Photographs" },
  board: { label: "About", blurb: "About and current practice" },
  marshall: { label: "Music", blurb: "Now playing" },
  posters: { label: "Cinema", blurb: "Films and poster wall" },
  domi: { label: "Domi", blurb: "The family cat" },
  sketchbook: { label: "Sketchbook", blurb: "Sketches and studies" },
  materials: { label: "Materials", blurb: "Prototypes and experiments" },
  whiteboard: { label: "Research", blurb: "Questions, evidence and maps" },
  lamp: { label: "Light", blurb: "Desk lamp brightness" },
};

export function sectionText(id: HotspotId, language: Language) {
  const base = content[id];
  if (language === "en") return { ...base, ...englishSections[id] };
  return base;
}

export function hotspotText(id: HotspotId, language: Language, fallback: { label: string; blurb: string }) {
  return language === "en" ? englishHotspots[id] : fallback;
}

export function collectionText(collection: Collection, language: Language) {
  const labels: Record<Collection, Record<Language, string>> = {
    work: { en: "Work", zh: "作品" },
    research: { en: "Research", zh: "研究" },
    make: { en: "Make", zh: "创作" },
    journal: { en: "Journal", zh: "手记" },
  };
  return labels[collection][language];
}

const englishPhoneApps: Record<string, string> = {
  wechat: "WeChat Official Account",
  xiaohongshu: "Xiaohongshu",
  netease: "NetEase Cloud Music",
};

export function phoneAppText(id: string, fallback: string, language: Language) {
  return language === "en" ? englishPhoneApps[id] ?? fallback : fallback;
}

