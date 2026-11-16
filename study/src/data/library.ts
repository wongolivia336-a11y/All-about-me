export const collections = ["work", "research", "make", "journal"] as const;

export type Collection = (typeof collections)[number];

export const themes = ["build", "question", "play", "keep"] as const;

export type ThemeId = (typeof themes)[number];

export type ContentStatus = "published" | "prototype" | "draft" | "private";

export type ContentType = "project" | "research" | "experiment" | "object";

export interface ArchiveLink {
  label: string;
  url: string;
}

export interface ArchiveEntry {
  id: string;
  title: string;
  collection: Collection;
  primaryTheme: ThemeId;
  secondaryThemes: readonly ThemeId[];
  type: ContentType;
  status: ContentStatus;
  year: number;
  summary: string;
  links: readonly ArchiveLink[];
  cover?: string;
  detailCover?: string;
  coverKind?: "conceptual" | "documentary";
  tags: readonly string[];
  /** Stable order for the complete project index and Macintosh desktop. */
  portfolioOrder?: number;
  desktopIcon?: string;
  featured?: boolean;
  featuredOrder?: number;
}

export const collectionLabels: Record<Collection, string> = {
  work: "Work",
  research: "Research",
  make: "Make",
  journal: "Journal",
};

/**
 * Publicly shareable projects only. This is the single source of truth for the
 * Index, four theme worlds, and Macintosh project desk; room-only objects stay out.
 */
export const library: readonly ArchiveEntry[] = [
  {
    id: "bioaz-agent-workbench",
    title: "BioAZ Agent Workbench",
    collection: "work",
    primaryTheme: "build",
    secondaryThemes: ["question"],
    type: "project",
    status: "published",
    year: 2026,
    summary: "将 DMPK 报价和肿瘤报告整理为可审阅的 Agent workflow 原型。",
    cover: "/portfolio/mono/01_bioaz-research_wide.png",
    detailCover: "/portfolio/mono/01_bioaz-research.png",
    coverKind: "conceptual",
    tags: ["AI products", "Agent workflow", "Prototype"],
    portfolioOrder: 1,
    desktopIcon: "/images/projects/icons/mac-1bit/bioaz-agent-workbench.png",
    featured: true,
    featuredOrder: 1,
    links: [
      { label: "打开原型", url: "https://prototype-bioaz-agent-workbench.vercel.app" },
      {
        label: "GitHub",
        url: "https://github.com/wongolivia336-a11y/bioaz-agent-workbench",
      },
    ],
  },
  {
    id: "healther",
    title: "Healther",
    collection: "work",
    primaryTheme: "build",
    secondaryThemes: ["question"],
    type: "project",
    status: "published",
    year: 2026,
    summary: "本地优先的长期健康管理工具：提醒、记录、报告整理与可信科普。",
    cover: "/portfolio/mono/07_healther-daily_wide.png",
    detailCover: "/portfolio/mono/07_healther-daily.png",
    coverKind: "conceptual",
    tags: ["Health", "Local-first", "Product system"],
    portfolioOrder: 12,
    desktopIcon: "/images/projects/icons/mac-1bit/healther.png",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/healther" }],
  },
  {
    id: "meow-gallery",
    title: "meow gallery",
    collection: "make",
    primaryTheme: "play",
    secondaryThemes: ["keep"],
    type: "experiment",
    status: "published",
    year: 2026,
    summary: "一只可以留在桌面上的小猫，用轻量的互动和猫叫陪你停一会儿。",
    cover: "/portfolio/mono/04_meow-gallery-cat_wide.png",
    detailCover: "/portfolio/mono/04_meow-gallery-cat.png",
    coverKind: "conceptual",
    tags: ["Creative technology", "Sound", "Personal experiment"],
    portfolioOrder: 11,
    desktopIcon: "/images/projects/icons/mac-1bit/meow-gallery.png",
    links: [
      { label: "打开作品", url: "https://domi-meow-gallery.vercel.app" },
      {
        label: "GitHub",
        url: "https://github.com/wongolivia336-a11y/cat-meow-gallery",
      },
    ],
  },
  {
    id: "knock-knock",
    title: "KNOCK KNOCK",
    collection: "make",
    primaryTheme: "play",
    secondaryThemes: ["build"],
    type: "experiment",
    status: "published",
    year: 2026,
    summary: "一个通过光、声音和等待建立关系的陪伴机器人交互原型。",
    cover: "/portfolio/mono/02_knock-knock-presence_wide.png",
    detailCover: "/portfolio/mono/02_knock-knock-presence.png",
    coverKind: "conceptual",
    tags: ["Interaction", "Light", "Companion robot"],
    portfolioOrder: 2,
    desktopIcon: "/images/projects/icons/mac-1bit/knock-knock.png",
    featured: true,
    featuredOrder: 2,
    links: [
      { label: "打开作品", url: "https://knockknock-theta.vercel.app" },
      { label: "GitHub", url: "https://github.com/wongolivia336-a11y/knockknock" },
    ],
  },
  {
    id: "zhang-zao",
    title: "镜子的两面",
    collection: "research",
    primaryTheme: "question",
    secondaryThemes: ["play"],
    type: "research",
    status: "published",
    year: 2026,
    summary: "古典意象如何进入现代经验的多维文本可视化研究。",
    cover: "/portfolio/mono/06_mirror-two-sides_wide.png",
    detailCover: "/portfolio/mono/06_mirror-two-sides.png",
    coverKind: "conceptual",
    tags: ["Research", "Text visualization", "Culture"],
    portfolioOrder: 10,
    desktopIcon: "/images/projects/icons/mac-1bit/mirror-two-sides.png",
    links: [{ label: "打开研究", url: "https://zhangzao.vercel.app" }],
  },
  {
    id: "qiaopi",
    title: "一封侨批，抵达之后",
    collection: "research",
    primaryTheme: "question",
    secondaryThemes: ["keep"],
    type: "research",
    status: "published",
    year: 2026,
    summary: "从海外寄批地到潮汕村庄的侨批数据叙事。",
    cover: "/portfolio/mono/03_qiaopi-letter_wide.png",
    detailCover: "/portfolio/mono/03_qiaopi-letter.png",
    coverKind: "conceptual",
    tags: ["Data story", "Archive", "Geography"],
    portfolioOrder: 3,
    desktopIcon: "/images/projects/icons/mac-1bit/qiaopi-letter.png",
    featured: true,
    featuredOrder: 3,
    links: [
      { label: "打开作品", url: "https://qiaopi-zeta.vercel.app" },
      { label: "GitHub", url: "https://github.com/wongolivia336-a11y/qiaopi" },
    ],
  },
  {
    id: "peekaboo",
    title: "Peekaboo",
    collection: "make",
    primaryTheme: "play",
    secondaryThemes: ["question", "keep"],
    type: "project",
    status: "published",
    year: 2026,
    summary: "将袁哲生小说《寂寞的游戏》转译为一部影像作品。",
    tags: ["Film", "Literary adaptation", "Moving image"],
    portfolioOrder: 4,
    desktopIcon: "/images/projects/icons/mac-1bit/peekaboo.svg",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/peekaboo" }],
  },
  {
    id: "zhenru-temple",
    title: "Zhenru Temple",
    collection: "make",
    primaryTheme: "build",
    secondaryThemes: ["play", "question"],
    type: "project",
    status: "published",
    year: 2026,
    summary: "真如寺的 3D 建模与可交互空间概念，探索寺院空间如何延展为可进入的数字世界。",
    tags: ["3D modeling", "Interactive space", "Digital world"],
    portfolioOrder: 5,
    desktopIcon: "/images/projects/icons/mac-1bit/zhenru-temple.svg",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/zhenru-temple" }],
  },
  {
    id: "so-shaped",
    title: "So Shaped",
    collection: "work",
    primaryTheme: "build",
    secondaryThemes: ["play", "keep"],
    type: "project",
    status: "prototype",
    year: 2026,
    summary: "一个正在构思中的独立站，把产品、品牌与线上购物体验放进同一个小世界。",
    tags: ["Independent store", "Brand", "E-commerce"],
    portfolioOrder: 6,
    desktopIcon: "/images/projects/icons/mac-1bit/so-shaped.svg",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/Sown-Shaped" }],
  },
  {
    id: "gama-qgis",
    title: "Gamma QGIS",
    collection: "research",
    primaryTheme: "question",
    secondaryThemes: ["build", "play"],
    type: "research",
    status: "published",
    year: 2026,
    summary: "以大学路为场域，结合 Grasshopper 与街道智能体，研究街道环境和城市生活。",
    tags: ["University Road", "Grasshopper", "Street agents"],
    portfolioOrder: 7,
    desktopIcon: "/images/projects/icons/mac-1bit/gamma-qgis.svg",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/gama-QGIS" }],
  },
  {
    id: "glassaha",
    title: "glassaha",
    collection: "make",
    primaryTheme: "play",
    secondaryThemes: ["build"],
    type: "experiment",
    status: "published",
    year: 2026,
    summary: "围绕雾面玻璃视觉展开的一组前端实验，研究透明、模糊与层次如何回应交互。",
    tags: ["Frontend", "Frosted glass", "Visual experiment"],
    portfolioOrder: 8,
    desktopIcon: "/images/projects/icons/mac-1bit/glassaha.svg",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/glass-aha" }],
  },
  {
    id: "psychologist-cafe",
    title: "Psychologist Café",
    collection: "make",
    primaryTheme: "question",
    secondaryThemes: ["keep", "play"],
    type: "project",
    status: "published",
    year: 2026,
    summary: "以存在主义为主题的咖啡馆概念，把关于自由、选择与日常的思考放进空间体验。",
    tags: ["Existentialism", "Cafe concept", "Space"],
    portfolioOrder: 9,
    desktopIcon: "/images/projects/icons/mac-1bit/psychologist-cafe.svg",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/Psychologist-Cafe" }],
  },
  {
    id: "film-shelf",
    title: "Film shelf / 片单",
    collection: "journal",
    primaryTheme: "keep",
    secondaryThemes: ["question"],
    type: "object",
    status: "prototype",
    year: 2026,
    summary: "A small shelf for returning to Lynch, Yang Dechang and Hou Hsiao-hsien.",
    cover: "/portfolio/mono/05_film-shelf_wide.png",
    detailCover: "/portfolio/mono/05_film-shelf.png",
    coverKind: "conceptual",
    tags: ["Cinema", "Film notes", "Room object"],
    links: [],
  },
];

export const entriesFor = (collection: Collection) =>
  library.filter((entry) => entry.collection === collection);
