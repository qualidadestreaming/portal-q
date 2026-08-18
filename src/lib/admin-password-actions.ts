"use server";

import { updateTag } from "next/cache";
import {
  MIN_PASSWORD_LENGTH,
  checkAdminPassword,
  hashPassword,
  requireAdmin,
} from "@/lib/admin-auth";
import { setAdminPasswordHash } from "@/lib/sheets";
import {
  clearLoginAttempts,
  isLoginLocked,
  registerFailedLogin,
} from "@/lib/login-rate-limit";
import { clientKey } from "@/lib/client-key";
import type { AdminErrorCode } from "@/lib/i18n";

/**
 * Troca de senha, só para quem já está autenticado (`requireAdmin()` primeiro
 * de tudo). Ainda assim pede a senha atual: um cookie de sessão comprometido
 * (aba esquecida aberta, roubo do valor do cookie) não deveria bastar sozinho
 * para tomar o portal — quem troca precisa provar que sabe a senha de agora.
 *
 * O mesmo freio de tentativas do login (5/10min, por IP) se aplica aqui, com
 * uma chave própria: sem ele, um cookie roubado viraria uma via de força
 * bruta contra a senha atual, sem o custo de precisar logar de novo a cada
 * tentativa.
 */

export type ChangePasswordState = { error: AdminErrorCode | null; ok: boolean };

const OK: ChangePasswordState = { error: null, ok: true };

function fail(error: AdminErrorCode): ChangePasswordState {
  return { error, ok: false };
}

function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  try {
    await requireAdmin();
  } catch {
    // O diálogo só é oferecido a quem já está em modo admin; isto só dispara
    // se a sessão expirar com o diálogo aberto (janela de até 8h) ou numa
    // chamada direta sem cookie. De qualquer forma, sem crash não tratado.
    return fail("sessionExpired");
  }

  const currentPassword = texto(formData, "currentPassword");
  const newPassword = texto(formData, "newPassword");
  const confirmPassword = texto(formData, "confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) return fail("empty");
  if (newPassword.length < MIN_PASSWORD_LENGTH) return fail("tooShort");
  if (newPassword !== confirmPassword) return fail("mismatch");

  const key = "changepw:" + (await clientKey());
  if (isLoginLocked(key)) return fail("locked");

  let result;
  try {
    result = await checkAdminPassword(currentPassword);
  } catch (error) {
    console.error("[portal-q] troca de senha: falha ao ler a senha atual na planilha:", error);
    return fail("generic");
  }

  if (result === "not-configured") return fail("notConfigured");

  if (result === "wrong") {
    registerFailedLogin(key);
    return fail("wrong");
  }

  clearLoginAttempts(key);

  try {
    await setAdminPasswordHash(hashPassword(newPassword));
  } catch (error) {
    console.error("[portal-q] troca de senha: falha ao gravar o novo hash na planilha:", error);
    return fail("generic");
  }

  // Sem isto, getAdminPasswordHash() continuaria servindo o hash antigo pelo
  // cache de 60s (ver docs/etapa-8-*.md) — quem tentasse entrar com a senha
  // nova nesse intervalo seria recusado.
  updateTag("admin-config");

  return OK;
}
