"use client";

import { TriangleAlert } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";

export function ErrorState() {
  const { t } = useLocale();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
        <TriangleAlert className="h-5 w-5 text-text-muted" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text">{t("errorTitle")}</p>
      <p className="max-w-sm text-sm text-text-muted">{t("errorDescription")}</p>
    </div>
  );
}
