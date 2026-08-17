import "server-only";

/**
 * Freio simples para tentativas de senha, por IP.
 *
 * Limitação conhecida e aceita: o estado vive na memória do processo. Na
 * Vercel isso significa "por instância", e ele se perde quando a função
 * hiberna — não é uma barreira absoluta contra força bruta distribuída.
 *
 * Ele não está sozinho, porém. Quem tenta adivinhar a senha enfrenta também:
 *   - scrypt com N=16384, que custa ~100ms de CPU por tentativa;
 *   - o hash cacheado por 60s (ver getAdminPasswordHash), então a rajada não
 *     derruba a cota do Apps Script.
 *
 * Para um portal interno com uma senha só, esse conjunto é proporcional. Se um
 * dia o portal virar alvo real, o caminho é um limitador com estado
 * compartilhado — não apertar os números daqui.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

/** Teto de chaves guardadas, para uma rajada de IPs falsos não crescer sem fim. */
const MAX_TRACKED_KEYS = 1000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function isLoginLocked(key: string, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket) return false;
  if (bucket.resetAt <= now) {
    buckets.delete(key);
    return false;
  }
  return bucket.count >= MAX_ATTEMPTS;
}

export function registerFailedLogin(key: string, now = Date.now()): void {
  prune(now);
  if (buckets.size >= MAX_TRACKED_KEYS && !buckets.has(key)) return;

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearLoginAttempts(key: string): void {
  buckets.delete(key);
}
