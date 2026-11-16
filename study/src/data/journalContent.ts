import aiHumanismZh from "./journal-content/01-humanism.zh.md?raw";
import aiHumanismEn from "./journal-content/01-humanism.en.md?raw";
import aiUtilityZh from "./journal-content/02-ai-as-utility.zh.md?raw";
import aiUtilityEn from "./journal-content/02-ai-as-utility.en.md?raw";
import productOrgZh from "./journal-content/03-product-organization.zh.md?raw";
import productOrgEn from "./journal-content/03-product-organization.en.md?raw";
import type { LocalizedText } from "./journal";

export const journalBodies: Record<string, LocalizedText> = {
  "humanism-in-ai": { zh: aiHumanismZh, en: aiHumanismEn },
  "intelligence-as-utility": { zh: aiUtilityZh, en: aiUtilityEn },
  "ai-product-organization": { zh: productOrgZh, en: productOrgEn },
};