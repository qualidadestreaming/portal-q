"use client";

import { useLocale } from "@/components/LocaleContext";

export function LocaleSelector() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className="flex items-center rounded-md border border-border p-0.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => setLocale("pt")}
        className={`rounded px-2 py-1 transition-colors ${
          locale === "pt"
            ? "bg-surface-hover text-text"
            : "text-text-muted hover:text-text"
        }`}
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded px-2 py-1 transition-colors ${
          locale === "en"
            ? "bg-surface-hover text-text"
            : "text-text-muted hover:text-text"
        }`}
      >
        EN
      </button>
    </div>
  );
}
