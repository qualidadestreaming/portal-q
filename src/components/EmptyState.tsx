import { LayoutGrid } from "lucide-react";

/**
 * Estado da grade de aplicativos antes da Etapa 4 (camada de dados) existir.
 * Também é o que aparece em produção se a planilha estiver sem apps ativos.
 */
export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
        <LayoutGrid className="h-5 w-5 text-text-muted" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text">Nenhum aplicativo cadastrado ainda</p>
      <p className="max-w-sm text-sm text-text-muted">
        Os cartões vão aparecer aqui assim que a camada de dados for conectada
        à planilha.
      </p>
    </div>
  );
}
