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
 * quick-scan Index; room objects remain an experiential way into the site.
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
    summary: "把真实猫叫做成可被忽略、也值得停一下的休息仪式。",
    cover: "/portfolio/mono/04_meow-gallery-cat_wide.png",
    detailCover: "/portfolio/mono/04_meow-gallery-cat.png",
    coverKind: "conceptual",
    tags: ["Creative technology", "Sound", "Personal experiment"],
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
    featured: true,
    featuredOrder: 3,
    links: [
      { label: "打开作品", url: "https://qiaopi-zeta.vercel.app" },
      { label: "GitHub", url: "https://github.com/wongolivia336-a11y/qiaopi" },
    ],
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
