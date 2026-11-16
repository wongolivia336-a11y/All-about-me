export type JournalLanguage = "en" | "zh";

export type LocalizedText = Record<JournalLanguage, string>;

export type JournalBlock =
  | { type: "paragraph"; text: LocalizedText }
  | { type: "heading"; level: 2 | 3; text: LocalizedText }
  | { type: "quote"; text: LocalizedText; attribution?: LocalizedText }
  | { type: "image"; src: string; alt: LocalizedText; caption?: LocalizedText }
  | { type: "link"; href: string; label: LocalizedText };

export interface JournalArticle {
  id: string;
  status: "published" | "development";
  featured?: boolean;
  title: LocalizedText;
  summary: LocalizedText;
  date?: string;
  dateLabel: LocalizedText;
  topics: Record<JournalLanguage, readonly string[]>;
  blocks: readonly JournalBlock[];
}

/**
 * Add only work Olivia has explicitly prepared for public reading here.
 * The existing Film shelf record remains a prototype object in the project library.
 */
export const publishedJournalArticles: readonly JournalArticle[] = [];

const developmentSample: JournalArticle = {
  id: "layout-sample",
  status: "development",
  featured: true,
  title: {
    en: "A thought is not born flat",
    zh: "想法并不总是一开始就是平的",
  },
  summary: {
    en: "A development-only sample used to test the reading layout. This is not a published Journal entry.",
    zh: "仅用于检查阅读排版的开发样例，不是正式发布的 Journal 文章。",
  },
  dateLabel: { en: "Development sample", zh: "开发排版样例" },
  topics: {
    en: ["Material", "Reading layout"],
    zh: ["材料", "阅读排版"],
  },
  blocks: [
    {
      type: "paragraph",
      text: {
        en: "Development sample — not published. These placeholder words exist only to test the rhythm of a long-form page, and do not represent Olivia’s personal writing.",
        zh: "开发样例 · 未发布。这段占位文字只用于检查长文页面的阅读节奏，不代表 Olivia 的个人文章。",
      },
    },
    {
      type: "heading",
      level: 2,
      text: { en: "A page that can breathe", zh: "让页面也能呼吸" },
    },
    {
      type: "paragraph",
      text: {
        en: "Future entries can combine clear paragraphs, section headings, images, quotations and links. Each block stays as real HTML so it remains selectable, searchable and accessible.",
        zh: "未来的文章可以组合段落、小标题、图片、引文与链接。每个内容块都会保留为真实 HTML，能够选择、搜索并被辅助技术读取。",
      },
    },
    {
      type: "quote",
      text: {
        en: "A layout test quote: the paper may keep a crease, while the words stay easy to read.",
        zh: "排版测试引文：纸张可以留下折痕，文字仍然应该清晰易读。",
      },
      attribution: { en: "Development sample", zh: "开发样例" },
    },
    {
      type: "image",
      src: "/portfolio/mono/05_film-shelf.png",
      alt: {
        en: "Artwork from the existing Film shelf prototype, included only to test image placement.",
        zh: "现有 Film shelf 原型视觉，仅用于测试文章图片排版。",
      },
      caption: {
        en: "Existing prototype artwork · layout test only",
        zh: "已有原型视觉 · 仅用于排版测试",
      },
    },
    {
      type: "link",
      href: "https://github.com/wongolivia336-a11y/All-about-me",
      label: {
        en: "Open the FOUR HEARTS repository · development link test",
        zh: "打开 FOUR HEARTS 仓库 · 开发链接测试",
      },
    },
  ],
};

export const journalArticles: readonly JournalArticle[] = import.meta.env.DEV
  ? [...publishedJournalArticles, developmentSample]
  : publishedJournalArticles;

export function getJournalArticle(id: string | undefined): JournalArticle | undefined {
  if (!id) return undefined;
  return journalArticles.find((article) => article.id === id);
}

