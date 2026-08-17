"use server";

import { cookies, headers } from "next/headers";
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

async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  // Primeiro IP da cadeia é o cliente; o resto são proxies.
  return forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "desconhecido";
}

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
    // Planilha fora do ar, cota estourada, segredo faltando: o detalhe fica
    // no log do servidor, o usuário recebe uma mensagem genérica.
    console.error("[portal-q] Falha ao verificar a senha de administrador:", error);
    return { error: "generic" };
  }

  if (result === "not-configured") return { error: "notConfigured" };

  if (result === "wrong") {
    registerFailedLogin(key);
    return { error: "wrong" };
  }

  clearLoginAttempts(key);
  (await cookies()).set({
    name: SESSION_COOKIE,
    value: createSessionToken(),
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
