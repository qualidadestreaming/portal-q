"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createApp, deleteApp, updateApp } from "@/lib/sheets";
import { validateAppInput, type AppErrorCode } from "@/lib/app-schema";

/**
 * CRUD de aplicativos. Toda função aqui começa com `requireAdmin()` — é o
 * portão de verdade. O que o navegador mostra (botões de editar/remover) é
 * enfeite: sem cookie de sessão válido, nada disto grava.
 *
 * Depois de cada escrita vem `updateTag("apps")`, que derruba o cache de 5
 * minutos de getApps() — senão o admin salvaria e não veria a própria mudança.
 * É `updateTag` e não `revalidateTag("apps", "max")` justamente por isso: o
 * segundo serve dado velho enquanto busca o novo por trás (bom para catálogo
 * público, péssimo para quem acabou de salvar), enquanto o primeiro é feito
 * para "ler a própria escrita" e faz a requisição seguinte esperar o dado
 * fresco. Só funciona dentro de Server Action, que é o nosso caso.
 */

export type AppFormState = { error: AppErrorCode | null; ok: boolean };

const OK: AppFormState = { error: null, ok: true };

function fail(error: AppErrorCode): AppFormState {
  return { error, ok: false };
}

/** Traduz a falha para um código; o texto é resolvido no cliente. */
function classify(error: unknown): AppErrorCode {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("restrita ao modo administrador")) return "sessionExpired";
  if (raw.includes("não encontrado")) return "notFound";
  if (raw.includes("Planilha ocupada")) return "sheetBusy";
  return "saveFailed";
}

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "");
}

export async function saveAppAction(
  _prev: AppFormState,
  formData: FormData
): Promise<AppFormState> {
  const parsed = validateAppInput({
    name: texto(formData, "name"),
    url: texto(formData, "url"),
    icon: texto(formData, "icon"),
    description_pt: texto(formData, "description_pt"),
    description_en: texto(formData, "description_en"),
  });
  if (typeof parsed === "string") return fail(parsed);

  const id = texto(formData, "id").trim();

  try {
    await requireAdmin();
    if (id) {
      await updateApp(id, parsed);
    } else {
      await createApp(parsed);
    }
  } catch (error) {
    console.error("[portal-q] falha ao salvar aplicativo:", error);
    return fail(classify(error));
  }

  updateTag("apps");
  return OK;
}

export async function deleteAppAction(
  _prev: AppFormState,
  formData: FormData
): Promise<AppFormState> {
  const id = texto(formData, "id").trim();
  if (!id) return fail("missingId");

  try {
    await requireAdmin();
    await deleteApp(id);
  } catch (error) {
    console.error("[portal-q] falha ao remover aplicativo:", error);
    return fail(classify(error));
  }

  updateTag("apps");
  return OK;
}
