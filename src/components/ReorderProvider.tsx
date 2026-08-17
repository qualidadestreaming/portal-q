"use client";

import {
  createContext,
  useContext,
  useTransition,
  useState,
  type ReactNode,
} from "react";
import { reorderAppsAction } from "@/lib/app-actions";
import type { AppErrorCode } from "@/lib/app-schema";

type ReorderContextValue = {
  moveApp: (id: string, direction: "up" | "down") => void;
  isFirst: (id: string) => boolean;
  isLast: (id: string) => boolean;
  pending: boolean;
  error: AppErrorCode | null;
  dismissError: () => void;
};

const ReorderContext = createContext<ReorderContextValue | null>(null);

/**
 * `ids` vem de `apps.map(a => a.id)` no servidor — já na ordem salva. Mover
 * um item troca dois vizinhos e reenvia a lista inteira: é o formato que
 * `reorderApps_` no Apps Script espera (ver docs/etapa-9-*.md).
 *
 * Sem estado otimista de propósito: `reorderAppsAction` chama `updateTag`,
 * que já traz a UI atualizada no mesmo round-trip (confirmado na doc local
 * de Server Actions). Adicionar estado otimista por cima seria duplicar o
 * que o framework já resolve, com risco de os dois divergirem.
 */
export function ReorderProvider({
  ids,
  children,
}: {
  ids: string[];
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<AppErrorCode | null>(null);

  function moveApp(id: string, direction: "up" | "down") {
    const index = ids.indexOf(id);
    if (index === -1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= ids.length) return;

    const next = ids.slice();
    [next[index], next[target]] = [next[target], next[index]];

    setError(null);
    startTransition(async () => {
      const result = await reorderAppsAction(next);
      if (result.error) setError(result.error);
    });
  }

  return (
    <ReorderContext.Provider
      value={{
        moveApp,
        isFirst: (id) => ids.indexOf(id) <= 0,
        isLast: (id) => ids.indexOf(id) === -1 || ids.indexOf(id) === ids.length - 1,
        pending,
        error,
        dismissError: () => setError(null),
      }}
    >
      {children}
    </ReorderContext.Provider>
  );
}

export function useReorder() {
  const context = useContext(ReorderContext);
  if (!context) {
    throw new Error("useReorder precisa estar dentro de <ReorderProvider>");
  }
  return context;
}
