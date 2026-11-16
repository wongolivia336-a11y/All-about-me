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
  status: "published" | "source";
  title: LocalizedText;
  summary: LocalizedText;
  date?: string;
  dateLabel?: LocalizedText;
  topics: Record<JournalLanguage, readonly string[]>;
  body?: LocalizedText;
  blocks?: readonly JournalBlock[];
  sourceUrl?: string;
}

const manuscripts: readonly JournalArticle[] = [
  {
    id: "humanism-in-ai",
    status: "published",
    title: {
      zh: "AI时代，我们为什么仍然需要以人为本？",
      en: "Why Do We Still Need Human-Centered Design in the Age of AI?",
    },
    summary: {
      zh: "从 AI 辅助创作与阅读出发，重新追问人的判断、经验与参与知识生产的意义。",
      en: "A reflection on AI-assisted making and reading, and on why human judgment, experience, and participation in knowledge still matter.",
    },
    topics: { zh: ["人工智能", "设计研究", "人本主义"], en: ["AI", "Design research", "Humanism"] },
  },
  {
    id: "intelligence-as-utility",
    status: "published",
    title: {
      zh: "当智力成为水电煤，谁能打开开关？",
      en: "When Intelligence Becomes a Utility, Who Gets to Turn It On?",
    },
    summary: {
      zh: "借图书馆、知识基础设施与公平机会，讨论智能能力如何抵达不同的人。",
      en: "Through the history of public libraries and the idea of capability, this essay asks how access to intelligence can reach people differently situated.",
    },
    topics: { zh: ["人工智能", "知识公平", "社会基础设施"], en: ["AI", "Access to knowledge", "Social infrastructure"] },
  },
  {
    id: "ai-product-organization",
    status: "published",
    title: {
      zh: "关于 AI 产品、设计和组织的一些混乱思考",
      en: "Untangling Thoughts on AI Products, Design, and Organizations",
    },
    summary: {
      zh: "从一次产品结构调整谈起，记录关于 Agent 产品形态、设计判断与组织工作的未完成思考。",
      en: "A first-person account of reshaping an AI product, and an unfinished inquiry into agentic product forms, design judgment, and organizational work.",
    },
    topics: { zh: ["AI 产品", "产品结构", "组织"], en: ["AI products", "Product architecture", "Organizations"] },
  },
];

const sourceLinks: readonly JournalArticle[] = [
  {
    id: "wechat-source-01",
    status: "source",
    title: { zh: "微信原文 01 · 待补标题", en: "WeChat original 01 · title pending" },
    summary: { zh: "文章标题与正文待补充；可先前往微信查看原文。", en: "Title and article text are pending. Open the original on WeChat in the meantime." },
    dateLabel: { zh: "原文链接", en: "Original link" },
    topics: { zh: ["微信原文"], en: ["WeChat original"] },
    blocks: [],
    sourceUrl: "https://mp.weixin.qq.com/s/ZhNckAzsemozYz8TKcrgXg",
  },
  {
    id: "wechat-source-02",
    status: "source",
    title: { zh: "微信原文 02 · 待补标题", en: "WeChat original 02 · title pending" },
    summary: { zh: "文章标题与正文待补充；可先前往微信查看原文。", en: "Title and article text are pending. Open the original on WeChat in the meantime." },
    dateLabel: { zh: "原文链接", en: "Original link" },
    topics: { zh: ["微信原文"], en: ["WeChat original"] },
    blocks: [],
    sourceUrl: "https://mp.weixin.qq.com/s/IySKH1hwDHSlzQhFQmEJBg",
  },
  {
    id: "wechat-source-03",
    status: "source",
    title: { zh: "微信原文 03 · 待补标题", en: "WeChat original 03 · title pending" },
    summary: { zh: "文章标题与正文待补充；可先前往微信查看原文。", en: "Title and article text are pending. Open the original on WeChat in the meantime." },
    dateLabel: { zh: "原文链接", en: "Original link" },
    topics: { zh: ["微信原文"], en: ["WeChat original"] },
    blocks: [],
    sourceUrl: "https://mp.weixin.qq.com/s/k-YCpeVycDPpElfLzz815A",
  },
];

export const publishedJournalArticles: readonly JournalArticle[] = [...manuscripts, ...sourceLinks];
export const journalArticles = publishedJournalArticles;

export function getJournalArticle(id: string | undefined): JournalArticle | undefined {
  if (!id) return undefined;
  return journalArticles.find((article) => article.id === id);
}