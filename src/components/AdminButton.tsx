"use client";

import { useState } from "react";
import { LogOut, ShieldCheck, ShieldUser } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { useIsAdmin } from "@/components/AdminProvider";
import { AdminLoginDialog } from "@/components/AdminLoginDialog";
import { logoutAdmin } from "@/lib/admin-actions";

export function AdminButton() {
  const { t } = useLocale();
  const isAdmin = useIsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isAdmin) {
    return (
      <div className="ml-1 flex items-center gap-1.5">
        <span className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface-hover px-3 text-sm font-medium text-text">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden sm:inline">{t("adminBadge")}</span>
        </span>
        <form action={logoutAdmin}>
          <button
            type="submit"
            title={t("adminExit")}
            aria-label={t("adminExit")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        title={t("adminEnterTitle")}
        className="ml-1 flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
      >
        <ShieldUser className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        <span className="hidden sm:inline">{t("adminEnter")}</span>
      </button>
      <AdminLoginDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
