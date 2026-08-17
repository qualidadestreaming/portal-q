import { TriangleAlert } from "lucide-react";

/**
 * Falha ao buscar os aplicativos (endpoint fora do ar, cota do Apps Script
 * excedida, etc). Mensagem propositalmente genérica — o detalhe técnico vai
 * só para o log do servidor, nunca para o navegador.
 */
export function ErrorState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
        <TriangleAlert className="h-5 w-5 text-text-muted" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text">Não foi possível carregar os aplicativos</p>
      <p className="max-w-sm text-sm text-text-muted">
        Tente recarregar a página em instantes.
      </p>
    </div>
  );
}
