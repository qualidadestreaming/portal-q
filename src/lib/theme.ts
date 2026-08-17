/**
 * Ajuda o ThemeToggle a ler/gravar a preferência de tema. A mesma chave é
 * usada pelo script inline em layout.tsx (que roda antes da hidratação,
 * para não haver flash de tema errado) — se mudar aqui, mude lá também.
 */
export const THEME_STORAGE_KEY = "portal-q-theme";

export type Theme = "light" | "dark";

export function getEffectiveTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage indisponível (ex.: navegação privada) — tema só não persiste.
  }
}
