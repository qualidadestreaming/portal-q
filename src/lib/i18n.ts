export type Locale = "pt" | "en";

export const translations = {
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
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof translations)["pt"];
