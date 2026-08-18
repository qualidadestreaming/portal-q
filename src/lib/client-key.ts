import "server-only";
import { headers } from "next/headers";

/**
 * Identifica o chamador para o freio de tentativas (login e troca de senha).
 * Usado só como chave de agrupamento, nunca como prova de identidade.
 */
export async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  // Primeiro IP da cadeia é o cliente; o resto são proxies.
  return forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "desconhecido";
}
