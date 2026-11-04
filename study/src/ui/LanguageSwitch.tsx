import { useLanguage } from "../i18n";
import "./LanguageSwitch.css";

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { language, setLanguage, copy } = useLanguage();

  return (
    <div className={["language-switch", className].filter(Boolean).join(" ")} role="group" aria-label={copy.language}>
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        aria-label={copy.switchToEnglish}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={language === "zh"}
        aria-label={copy.switchToChinese}
        onClick={() => setLanguage("zh")}
      >
        中文
      </button>
    </div>
  );
}
