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
    adminErrorMisconfigured:
      "A senha está certa, mas o servidor não conseguiu abrir a sessão. Avise quem administra o portal — repetir não resolve.",

    appAdd: "Adicionar aplicativo",
    appEdit: "Editar",
    appEditTitle: "Editar aplicativo",
    appNewTitle: "Novo aplicativo",
    appRemove: "Remover",
    appFieldName: "Nome",
    appFieldUrl: "Link",
    appFieldIcon: "Ícone",
    appFieldDescriptionPt: "Descrição (português)",
    appFieldDescriptionEn: "Descrição (inglês)",
    appOptional: "opcional",
    appSave: "Salvar",
    appSaving: "Salvando…",
    appCancel: "Cancelar",
    appDeleteConfirmTitle: "Remover este aplicativo?",
    appDeleteConfirmBody:
      "O cartão sai do portal para todos os visitantes. A linha é apagada da planilha e isso não pode ser desfeito.",
    appDeleteConfirm: "Remover",
    appDeleting: "Removendo…",
    iconSearchPlaceholder: "Filtrar ícones…",
    iconNoResults: "Nenhum ícone com esse termo.",

    appErrNameRequired: "Informe o nome do aplicativo.",
    appErrNameTooLong: "O nome passa de 60 caracteres.",
    appErrUrlRequired: "Informe o link do aplicativo.",
    appErrUrlTooLong: "O link passa de 500 caracteres.",
    appErrUrlInvalid: "O link precisa começar com http:// ou https://",
    appErrIconInvalid: "Ícone inválido.",
    appErrDescriptionTooLong: "As descrições podem ter no máximo 120 caracteres.",
    appErrMissingId: "Aplicativo sem identificador.",
    appErrSessionExpired: "Sua sessão de administrador expirou. Entre de novo.",
    appErrNotFound: "Esse aplicativo não existe mais na planilha.",
    appErrSheetBusy: "A planilha está ocupada. Tente de novo em instantes.",
    appErrSaveFailed: "Não foi possível salvar na planilha. Tente de novo em instantes.",
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
    adminErrorMisconfigured:
      "The password is right, but the server couldn't open the session. Tell whoever administers the portal — retrying won't help.",

    appAdd: "Add app",
    appEdit: "Edit",
    appEditTitle: "Edit app",
    appNewTitle: "New app",
    appRemove: "Remove",
    appFieldName: "Name",
    appFieldUrl: "Link",
    appFieldIcon: "Icon",
    appFieldDescriptionPt: "Description (Portuguese)",
    appFieldDescriptionEn: "Description (English)",
    appOptional: "optional",
    appSave: "Save",
    appSaving: "Saving…",
    appCancel: "Cancel",
    appDeleteConfirmTitle: "Remove this app?",
    appDeleteConfirmBody:
      "The card leaves the portal for every visitor. The spreadsheet row is deleted and this cannot be undone.",
    appDeleteConfirm: "Remove",
    appDeleting: "Removing…",
    iconSearchPlaceholder: "Filter icons…",
    iconNoResults: "No icon matches that term.",

    appErrNameRequired: "Enter the app name.",
    appErrNameTooLong: "The name is longer than 60 characters.",
    appErrUrlRequired: "Enter the app link.",
    appErrUrlTooLong: "The link is longer than 500 characters.",
    appErrUrlInvalid: "The link must start with http:// or https://",
    appErrIconInvalid: "Invalid icon.",
    appErrDescriptionTooLong: "Descriptions can be at most 120 characters.",
    appErrMissingId: "App has no identifier.",
    appErrSessionExpired: "Your administrator session expired. Sign in again.",
    appErrNotFound: "That app no longer exists in the spreadsheet.",
    appErrSheetBusy: "The spreadsheet is busy. Try again in a moment.",
    appErrSaveFailed: "Couldn't save to the spreadsheet. Try again in a moment.",
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
  misconfigured: "adminErrorMisconfigured",
} as const satisfies Record<string, TranslationKey>;

export type AdminErrorCode = keyof typeof ADMIN_ERROR_KEYS;

/** Mesmo contrato, para o CRUD de aplicativos (Etapa 9). */
export const APP_ERROR_KEYS = {
  nameRequired: "appErrNameRequired",
  nameTooLong: "appErrNameTooLong",
  urlRequired: "appErrUrlRequired",
  urlTooLong: "appErrUrlTooLong",
  urlInvalid: "appErrUrlInvalid",
  iconInvalid: "appErrIconInvalid",
  descriptionTooLong: "appErrDescriptionTooLong",
  missingId: "appErrMissingId",
  sessionExpired: "appErrSessionExpired",
  notFound: "appErrNotFound",
  sheetBusy: "appErrSheetBusy",
  saveFailed: "appErrSaveFailed",
} as const satisfies Record<string, TranslationKey>;
