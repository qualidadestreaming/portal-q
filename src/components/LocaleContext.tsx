"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  translations,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

/**
 * O idioma escolhido mora no localStorage, que é um store externo ao React —
 * então quem lê é `useSyncExternalStore`, e não um efeito que chama setState.
 * Além de ser o padrão recomendado, sai de graça a sincronia entre abas.
 *
 * `getServerSnapshot` devolve DEFAULT_LOCALE: é o que o HTML do servidor
 * mostra e o que a hidratação espera. Quem tem "en" salvo vê a troca logo
 * depois de hidratar, sem aviso de divergência.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === "pt" || stored === "en" ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function writeLocale(next: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // localStorage indisponível (ex.: navegação privada) — só não persiste.
  }
  // O evento `storage` não dispara na aba que escreveu; avisamos à mão.
  for (const listener of listeners) listener();
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function t(key: TranslationKey) {
    return translations[locale][key];
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: writeLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale precisa estar dentro de <LocaleProvider>");
  }
  return context;
}
