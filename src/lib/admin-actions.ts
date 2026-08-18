"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkAdminPassword,
  createSessionToken,
} from "@/lib/admin-auth";
import {
  clearLoginAttempts,
  isLoginLocked,
  registerFailedLogin,
} from "@/lib/login-rate-limit";
import { clientKey } from "@/lib/client-key";
import type { AdminErrorCode } from "@/lib/i18n";

/**
 * Ações de entrada e saída do modo administrador.
 *
 * São Server Actions (não Route Handlers) por dois motivos: o Next verifica
 * Origin/Host automaticamente, o que já cobre CSRF; e não abrem um endpoint
 * público de login para ser varrido de fora.
 *
 * O retorno só carrega um código de erro — a mensagem em português/inglês é
 * resolvida no cliente. Nenhum detalhe técnico atravessa a fronteira.
 */

export type AdminLoginState = { error: AdminErrorCode | null };

export async function loginAdmin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const raw = formData.get("password");
  // O mesmo trim de scripts/hash-password.mjs, senão uma senha colada com
  // espaço sobrando nunca casaria com o hash gravado.
  const password = typeof raw === "string" ? raw.trim() : "";

  if (!password) return { error: "empty" };

  const key = await clientKey();
  if (isLoginLocked(key)) return { error: "locked" };

  let result;
  try {
    result = await checkAdminPassword(password);
  } catch (error) {
    // Planilha fora do ar, cota estourada, rede caindo: o detalhe fica no log
    // do servidor, o usuário recebe uma mensagem de "tente de novo" — que aqui
    // é o conselho certo, porque a falha costuma ser passageira.
    console.error(
      "[portal-q] login: falha ao ler ou verificar a senha na planilha (tentar de novo pode resolver):",
      error
    );
    return { error: "generic" };
  }

  if (result === "not-configured") return { error: "notConfigured" };

  if (result === "wrong") {
    registerFailedLogin(key);
    return { error: "wrong" };
  }

  // Senha certa. Assinar a sessão é a última coisa que pode dar errado, e o
  // motivo mais provável é PORTAL_Q_SESSION_SECRET ausente ou curto no
  // ambiente. Isso merece um erro próprio: repetir não resolve, e dizer
  // "tente de novo" mandaria o usuário para o lugar errado.
  let sessionToken: string;
  try {
    sessionToken = createSessionToken();
  } catch (error) {
    console.error(
      "[portal-q] login: senha correta, mas não foi possível assinar a sessão. " +
        "Confira PORTAL_Q_SESSION_SECRET no ambiente do servidor:",
      error
    );
    return { error: "misconfigured" };
  }

  clearLoginAttempts(key);
  (await cookies()).set({
    name: SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  revalidatePath("/", "layout");
  return { error: null };
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
}
