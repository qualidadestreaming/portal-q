"use client";

import { X } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { useReorder } from "@/components/ReorderProvider";
import { APP_ERROR_KEYS } from "@/lib/i18n";

export function ReorderErrorBanner() {
  const { t } = useLocale();
  const { error, dismissError } = useReorder();

  if (!error) return null;

  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-3 text-xs text-text-muted md:px-6"
    >
      <span>{t(APP_ERROR_KEYS[error])}</span>
      <button
        type="button"
        onClick={dismissError}
        aria-label={t("appCancel")}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:text-text"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
