"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleContext";
import { useIsAdmin } from "@/components/AdminProvider";
import { AppCardAdminControls } from "@/components/AppCardAdminControls";
import type { App } from "@/lib/sheets";

interface AppCardClientProps {
  app: App;
  /** Elemento pronto, vindo do servidor — ver o comentário em AppCard.tsx. */
  icon: ReactNode;
}

export function AppCardClient({ app, icon }: AppCardClientProps) {
  const { locale } = useLocale();
  const isAdmin = useIsAdmin();

  const description = locale === "en" ? app.description_en : app.description_pt;

  return (
    // Os controles de admin ficam fora do <a>, como irmãos: aninhados dentro
    // dele, clicar em "editar" abriria o link do cartão também.
    <div className="relative">
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg text-text-muted transition-colors group-hover:text-text">
          {icon}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-text">{app.name}</span>
          {description && (
            <span className="line-clamp-2 text-xs text-text-muted">
              {description}
            </span>
          )}
        </span>
      </a>
      {isAdmin && <AppCardAdminControls app={app} />}
    </div>
  );
}
