/**
 * Fonte única dos textos da interface. O LocaleContext importa daqui —
 * não duplicar estas strings em componente nenhum.
 */

export type Locale = "pt" | "en";

export const LOCALE_STORAGE_KEY = "portal-q-locale";

/** Idioma usado no HTML do servidor e no primeiro render do cliente. */
export const DEFAULT_LOCALE: Locale = "pt";

export const translations = {
  pt: {
    searchPlaceholder: "Buscar aplicativo…",
    searchLabel: "Buscar aplicativo",
    searchClear: "Limpar busca",
    themeToggle: "Alternar modo escuro",
    languageLabel: "Idioma",
    emptyTitle: "Nenhum aplicativo cadastrado ainda",
    emptyDescription:
      "Os cartões vão aparecer aqui assim que a camada de dados for conectada à planilha.",
    errorTitle: "Não foi possível carregar os aplicativos",
    errorDescription: "Tente recarregar a página em instantes.",
    noResultsTitle: "Nenhum aplicativo encontrado",
    noResultsDescription: "Tente buscar por outro termo.",

    adminEnter: "Administrador",
    adminEnterTitle: "Entrar como administrador",
    adminPasswordLabel: "Senha",
    adminSubmit: "Entrar",
    adminSubmitting: "Verificando…",
    adminCancel: "Cancelar",
    adminExit: "Sair do modo admin",
    adminBadge: "Modo administrador",
    adminErrorWrong: "Senha incorreta.",
    adminErrorEmpty: "Digite a senha.",
    adminErrorLocked:
      "Muitas tentativas. Aguarde alguns minutos antes de tentar de novo.",
    adminErrorNotConfigured:
      "Nenhuma senha de administrador configurada na planilha.",
    adminErrorGeneric: "Não foi possível entrar. Tente de novo em instantes.",
  },
  en: {
    searchPlaceholder: "Search apps…",
    searchLabel: "Search apps",
    searchClear: "Clear search",
    themeToggle: "Toggle dark mode",
    languageLabel: "Language",
    emptyTitle: "No apps registered yet",
    emptyDescription:
      "Cards will appear here once the data layer is connected to the spreadsheet.",
    errorTitle: "Couldn't load the apps",
    errorDescription: "Try reloading the page in a moment.",
    noResultsTitle: "No apps found",
    noResultsDescription: "Try a different search term.",

    adminEnter: "Administrator",
    adminEnterTitle: "Sign in as administrator",
    adminPasswordLabel: "Password",
    adminSubmit: "Sign in",
    adminSubmitting: "Checking…",
    adminCancel: "Cancel",
    adminExit: "Leave admin mode",
    adminBadge: "Administrator mode",
    adminErrorWrong: "Wrong password.",
    adminErrorEmpty: "Type the password.",
    adminErrorLocked: "Too many attempts. Wait a few minutes before trying again.",
    adminErrorNotConfigured:
      "No administrator password is configured in the spreadsheet.",
    adminErrorGeneric: "Couldn't sign in. Try again in a moment.",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["pt"];

/**
 * Códigos de erro que as Server Actions devolvem. O texto mostrado ao usuário
 * é resolvido no cliente, no idioma ativo — a action nunca devolve texto
 * pronto, nem detalhe técnico.
 */
export const ADMIN_ERROR_KEYS = {
  wrong: "adminErrorWrong",
  empty: "adminErrorEmpty",
  locked: "adminErrorLocked",
  notConfigured: "adminErrorNotConfigured",
  generic: "adminErrorGeneric",
} as const satisfies Record<string, TranslationKey>;

export type AdminErrorCode = keyof typeof ADMIN_ERROR_KEYS;
