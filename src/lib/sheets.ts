import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Camada de dados do Portal Q — fala com o Web App do Apps Script.
 * Nunca importar este arquivo em um Client Component: o token de acesso
 * (`PORTAL_Q_SHEETS_TOKEN`) só pode existir no servidor.
 */

export type App = {
  id: string;
  name: string;
  url: string;
  icon: string;
  description_pt: string;
  description_en: string;
  category: string;
  order: number;
  active: boolean;
  updated_at: string;
};

type SheetsResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function callSheetsApi<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const endpoint = process.env.PORTAL_Q_SHEETS_ENDPOINT;
  const token = process.env.PORTAL_Q_SHEETS_TOKEN;

  if (!endpoint || !token) {
    throw new Error(
      "PORTAL_Q_SHEETS_ENDPOINT / PORTAL_Q_SHEETS_TOKEN não configurados no ambiente do servidor"
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ token, action, payload }),
    redirect: "follow",
    // O cache de leitura é controlado por unstable_cache em getApps(), não aqui.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Apps Script respondeu HTTP ${response.status}`);
  }

  const text = await response.text();
  let body: SheetsResponse<T>;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error("Apps Script não retornou um JSON válido");
  }

  if (!body.ok) {
    throw new Error(body.error);
  }
  return body.data;
}

async function fetchActiveApps(): Promise<App[]> {
  const data = await callSheetsApi<{ apps: App[] }>("listApps");
  return data.apps;
}

/**
 * Lista os aplicativos ativos, ordenados. Cacheada por 5 minutos — folga
 * confortável dentro da cota diária do Apps Script (ver docs/etapa-2-*.md)
 * mesmo com muitos acessos simultâneos ao portal.
 */
export const getApps = unstable_cache(fetchActiveApps, ["portal-q-apps"], {
  revalidate: 300,
  tags: ["apps"],
});

async function fetchAdminPasswordHash(): Promise<string> {
  const data = await callSheetsApi<{ value: string }>("getConfig", {
    key: "admin_password_hash",
  });
  return data.value;
}

/**
 * Hash da senha de administrador, como está na aba `config`.
 *
 * Cacheado de propósito: cada tentativa de login leria a planilha, então uma
 * rajada de tentativas erradas gastaria a cota diária do Apps Script. Com o
 * cache, a rajada custa uma leitura por minuto. A troca de senha (Etapa 11)
 * deve invalidar a tag `admin-config` para não continuar aceitando a antiga.
 */
export const getAdminPasswordHash = unstable_cache(
  fetchAdminPasswordHash,
  ["portal-q-admin-password-hash"],
  { revalidate: 60, tags: ["admin-config"] }
);
