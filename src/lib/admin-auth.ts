import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAdminPasswordHash } from "@/lib/sheets";

/**
 * Autenticação do modo administrador.
 *
 * Não é um sistema de contas: existe uma senha única, cujo hash mora na aba
 * `config` da planilha (chave `admin_password_hash`). Este arquivo é
 * `server-only` — a senha, o hash e o segredo de sessão nunca chegam ao
 * navegador. O que o navegador recebe é apenas um cookie HttpOnly assinado.
 */

export const SESSION_COOKIE = "portal-q-admin";

/** 8 horas: cobre um dia de trabalho sem repetir a senha (decidido na Etapa 8). */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

/** Precisa bater com scripts/hash-password.mjs. */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

function sessionSecret(): string {
  const secret = process.env.PORTAL_Q_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "PORTAL_Q_SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres)"
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

/** Compara em tempo constante, sem vazar o tamanho por caminho de saída. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* ------------------------------------------------------------------ *
 * Senha
 * ------------------------------------------------------------------ */

/**
 * Confere a senha contra o hash `scrypt$<salt-hex>$<hash-hex>` da planilha.
 * Devolve false para qualquer hash malformado ou ausente — nunca "passa" por
 * omissão. Um portal sem senha configurada simplesmente não deixa entrar.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], "hex");
    expected = Buffer.from(parts[2], "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length !== SCRYPT.keylen) return false;

  const derived = scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return timingSafeEqual(derived, expected);
}

export type PasswordCheck = "ok" | "wrong" | "not-configured";

export async function checkAdminPassword(password: string): Promise<PasswordCheck> {
  const storedHash = (await getAdminPasswordHash()).trim();
  if (!storedHash) return "not-configured";
  return verifyPassword(password, storedHash) ? "ok" : "wrong";
}

/* ------------------------------------------------------------------ *
 * Sessão (cookie assinado, sem estado no servidor)
 * ------------------------------------------------------------------ */

/**
 * `<payload>.<assinatura>`, onde payload é um JSON base64url com a validade.
 * Sem estado no servidor de propósito: guardar sessões na planilha gastaria
 * cota a cada navegação, e a Vercel não dá memória compartilhada entre
 * instâncias no plano gratuito.
 */
export function createSessionToken(now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: now + SESSION_TTL_SECONDS * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string, now = Date.now()): boolean {
  const separator = token.indexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  // Assinatura primeiro: só depois de provar que o payload é nosso é que
  // vale a pena interpretá-lo.
  if (!safeEqual(signature, sign(payload))) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded?.exp === "number" && now < decoded.exp;
  } catch {
    return false;
  }
}

/**
 * Fonte da verdade de "está em modo admin" — tanto para a interface quanto
 * para as ações de escrita das Etapas 9 a 11. Toda action que grava na
 * planilha precisa chamar `requireAdmin()` antes de qualquer coisa.
 */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    return verifySessionToken(token);
  } catch {
    // Segredo ausente/curto em produção: trata como não autenticado.
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Ação restrita ao modo administrador");
  }
}
