import "server-only";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { LucideIcon } from "lucide-react";

const FALLBACK_ICON_NAME = "app-window";

/**
 * Carrega o componente do ícone Lucide pelo nome (kebab-case) salvo na
 * planilha. Roda no servidor — cada cartão chega ao navegador já com o SVG
 * certo, sem etapa de carregamento client-side.
 */
export async function resolveAppIcon(name: string): Promise<LucideIcon> {
  const key = name in dynamicIconImports ? name : FALLBACK_ICON_NAME;
  const load = dynamicIconImports[key as keyof typeof dynamicIconImports];
  const mod = await load();
  return mod.default;
}
