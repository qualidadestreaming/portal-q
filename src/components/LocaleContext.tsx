"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "portal-q-locale";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // localStorage indisponível — idioma só não persiste.
    }
  }

  function t(key: string): string {
    if (!mounted) return "";
    try {
      return (translations[locale] as Record<string, string>)[key] || key;
    } catch {
      return key;
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

// Import translations inline to avoid circular dependency.
const translations = {
  pt: {
    searchPlaceholder: "Buscar aplicativo…",
    searchLabel: "Buscar aplicativo",
    searchClear: "Limpar busca",
    themeToggle: "Alternar modo escuro",
    languageLabel: "Idioma",
    adminButton: "Administrador",
    adminTitle: "Entrar como administrador — disponível na Etapa 8",
    emptyTitle: "Nenhum aplicativo cadastrado ainda",
    emptyDescription:
      "Os cartões vão aparecer aqui assim que a camada de dados for conectada à planilha.",
    errorTitle: "Não foi possível carregar os aplicativos",
    errorDescription: "Tente recarregar a página em instantes.",
    noResultsTitle: "Nenhum aplicativo encontrado",
    noResultsDescription: "Tente buscar por outro termo.",
  },
  en: {
    searchPlaceholder: "Search apps…",
    searchLabel: "Search apps",
    searchClear: "Clear search",
    themeToggle: "Toggle dark mode",
    languageLabel: "Language",
    adminButton: "Administrator",
    adminTitle: "Sign in as administrator — available in Step 8",
    emptyTitle: "No apps registered yet",
    emptyDescription:
      "Cards will appear here once the data layer is connected to the spreadsheet.",
    errorTitle: "Couldn't load the apps",
    errorDescription: "Try reloading the page in a moment.",
    noResultsTitle: "No apps found",
    noResultsDescription: "Try a different search term.",
  },
} as const;
