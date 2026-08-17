/**
 * Formato e limites de um aplicativo, compartilhados pelo servidor e pelo
 * cliente. Sem `server-only` de propósito: o formulário precisa dos limites
 * para os `maxLength` dos campos.
 *
 * Os números repetem os de google-apps-script/Code.gs. A duplicação é
 * consciente: valida no formulário dá erro na hora, em vez de uma ida de ~2s à
 * planilha para ouvir não. O Apps Script continua validando — ele é a defesa,
 * isto aqui é conveniência.
 */

export type AppInput = {
  name: string;
  url: string;
  icon: string;
  description_pt: string;
  description_en: string;
};

export const APP_LIMITS = {
  name: 60,
  url: 500,
  icon: 40,
  description: 120,
} as const;

/**
 * Códigos de erro, não texto. Quem traduz é o cliente, no idioma ativo — o
 * mesmo contrato usado no login de administrador.
 */
export type AppErrorCode =
  | "nameRequired"
  | "nameTooLong"
  | "urlRequired"
  | "urlTooLong"
  | "urlInvalid"
  | "iconInvalid"
  | "descriptionTooLong"
  | "missingId"
  | "sessionExpired"
  | "notFound"
  | "sheetBusy"
  | "saveFailed";

export function validateAppInput(raw: {
  name: string;
  url: string;
  icon: string;
  description_pt: string;
  description_en: string;
}): AppInput | AppErrorCode {
  const name = raw.name.trim();
  const url = raw.url.trim();
  const icon = raw.icon.trim() || "app-window";
  const description_pt = raw.description_pt.trim();
  const description_en = raw.description_en.trim();

  if (!name) return "nameRequired";
  if (name.length > APP_LIMITS.name) return "nameTooLong";

  if (!url) return "urlRequired";
  if (url.length > APP_LIMITS.url) return "urlTooLong";
  // Só http/https. Bloquear javascript: e data: importa porque este valor vira
  // o href de um cartão clicável.
  if (!/^https?:\/\/\S+$/i.test(url)) return "urlInvalid";

  if (!/^[a-z0-9-]{1,40}$/.test(icon)) return "iconInvalid";

  if (
    description_pt.length > APP_LIMITS.description ||
    description_en.length > APP_LIMITS.description
  ) {
    return "descriptionTooLong";
  }

  return { name, url, icon, description_pt, description_en };
}
