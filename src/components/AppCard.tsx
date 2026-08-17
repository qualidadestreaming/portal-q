import { resolveAppIcon } from "@/lib/icons";
import type { App } from "@/lib/sheets";

/**
 * Cartão clicável de um aplicativo. Abre o link em nova aba — o Portal Q é
 * só o ponto de acesso, não embute os sistemas.
 */
export async function AppCard({ app }: { app: App }) {
  const Icon = await resolveAppIcon(app.icon);

  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg text-text-muted transition-colors group-hover:text-text">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text">{app.name}</span>
        {app.description_pt && (
          <span className="line-clamp-2 text-xs text-text-muted">
            {app.description_pt}
          </span>
        )}
      </span>
    </a>
  );
}
