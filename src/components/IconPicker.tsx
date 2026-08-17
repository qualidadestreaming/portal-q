"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { ICON_CATALOG, ICON_GROUPS } from "@/lib/icon-catalog";

/**
 * Escolha visual do ícone. O valor selecionado viaja num input escondido, para
 * o formulário seguir sendo um <form> comum enviado por Server Action.
 */
export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const { locale, t } = useLocale();
  const [filtro, setFiltro] = useState("");

  const gruposVisiveis = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    if (!termo) return ICON_GROUPS;
    return ICON_GROUPS.map((grupo) => ({
      ...grupo,
      icons: grupo.icons.filter((nome) => nome.includes(termo)),
    })).filter((grupo) => grupo.icons.length > 0);
  }, [filtro]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="search"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
          placeholder={t("iconSearchPlaceholder")}
          aria-label={t("iconSearchPlaceholder")}
          className="h-8 w-full rounded-md border border-border bg-bg pl-8 pr-2 text-xs text-text placeholder:text-text-muted"
        />
      </div>

      <div className="max-h-44 overflow-y-auto rounded-md border border-border bg-bg p-2">
        {gruposVisiveis.length === 0 && (
          <p className="px-1 py-2 text-xs text-text-muted">{t("iconNoResults")}</p>
        )}

        {gruposVisiveis.map((grupo) => (
          <div key={grupo.id} className="mb-2 last:mb-0">
            <p className="mb-1 px-0.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">
              {grupo.label[locale]}
            </p>
            <div className="grid grid-cols-8 gap-1">
              {grupo.icons.map((nome) => {
                const Icone = ICON_CATALOG[nome];
                const selecionado = nome === value;
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => onChange(nome)}
                    title={nome}
                    aria-label={nome}
                    aria-pressed={selecionado}
                    className={`flex h-8 items-center justify-center rounded border transition-colors ${
                      selecionado
                        ? "border-focus bg-surface-hover text-text"
                        : "border-transparent text-text-muted hover:bg-surface-hover hover:text-text"
                    }`}
                  >
                    <Icone className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <input type="hidden" name="icon" value={value} />
    </div>
  );
}
