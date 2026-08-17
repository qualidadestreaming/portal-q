"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { useIsAdmin } from "@/components/AdminProvider";
import { AppFormDialog } from "@/components/AppFormDialog";

export function AddAppButton() {
  const { t } = useLocale();
  const isAdmin = useIsAdmin();
  const [aberto, setAberto] = useState(false);

  if (!isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        {t("appAdd")}
      </button>
      {aberto && <AppFormDialog open onClose={() => setAberto(false)} />}
    </>
  );
}
