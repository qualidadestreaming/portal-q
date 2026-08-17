"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Distribui o estado de "modo admin" para a árvore de componentes cliente.
 *
 * O valor vem do servidor (layout.tsx, que valida o cookie assinado) — este
 * contexto não decide nada, só carrega a resposta. E ele governa apenas o que
 * aparece na tela: cada ação de escrita revalida a sessão no servidor por
 * conta própria (requireAdmin), então forjar este valor no navegador rende
 * botões inúteis, não permissão.
 */

const AdminContext = createContext<boolean>(false);

export function AdminProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  return <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>;
}

export function useIsAdmin(): boolean {
  return useContext(AdminContext);
}
