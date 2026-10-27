export const collections = ["work", "research", "make", "journal"] as const;

export type Collection = (typeof collections)[number];

export interface ArchiveLink {
  label: string;
  url: string;
}

export interface ArchiveEntry {
  id: string;
  title: string;
  collection: Collection;
  year: number;
  summary: string;
  links: readonly ArchiveLink[];
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
    year: 2026,
    summary: "将 DMPK 报价和肿瘤报告整理为可审阅的 Agent workflow 原型。",
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
    year: 2026,
    summary: "本地优先的长期健康管理工具：提醒、记录、报告整理与可信科普。",
    links: [{ label: "GitHub", url: "https://github.com/wongolivia336-a11y/healther" }],
  },
  {
    id: "meow-gallery",
    title: "meow gallery",
    collection: "make",
    year: 2026,
    summary: "把真实猫叫做成可被忽略、也值得停一下的休息仪式。",
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
    year: 2026,
    summary: "一个通过光、声音和等待建立关系的陪伴机器人交互原型。",
    links: [
      { label: "打开作品", url: "https://knockknock-theta.vercel.app" },
      { label: "GitHub", url: "https://github.com/wongolivia336-a11y/knockknock" },
    ],
  },
  {
    id: "zhang-zao",
    title: "镜子的两面",
    collection: "research",
    year: 2026,
    summary: "古典意象如何进入现代经验的多维文本可视化研究。",
    links: [{ label: "打开研究", url: "https://zhangzao.vercel.app" }],
  },
  {
    id: "qiaopi",
    title: "一封侨批，抵达之后",
    collection: "research",
    year: 2026,
    summary: "从海外寄批地到潮汕村庄的侨批数据叙事。",
    links: [
      { label: "打开作品", url: "https://qiaopi-zeta.vercel.app" },
      { label: "GitHub", url: "https://github.com/wongolivia336-a11y/qiaopi" },
    ],
  },
];

export const entriesFor = (collection: Collection) =>
  library.filter((entry) => entry.collection === collection);
