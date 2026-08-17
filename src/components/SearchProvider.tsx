"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Estado da busca (etapa 5), compartilhado entre o input na TopBar
 * (dentro de layout.tsx) e a grade de aplicativos (dentro de page.tsx).
 * Filtragem é só no navegador — sem requisição nenhuma por tecla.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch precisa estar dentro de um SearchProvider");
  }
  return context;
}

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

/** Remove acentos (NFD) para "acao" encontrar "Ações". */
export function normalizeSearchTerm(value: string) {
  return value.normalize("NFD").replace(DIACRITICS_PATTERN, "").toLowerCase().trim();
}
