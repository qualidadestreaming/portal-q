"use client";

import { Moon, Sun } from "lucide-react";
import { applyTheme, getEffectiveTheme } from "@/lib/theme";

/**
 * A troca de ícone (sol/lua) é feita só por CSS (ver .theme-icon-* em
 * globals.css) — não há estado em React aqui, então não existe divergência
 * possível entre o que o servidor renderiza e o que o cliente mostra.
 */
export function ThemeToggle() {
  function handleClick() {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Alternar modo escuro"
      className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
    >
      <Moon
        className="theme-icon-moon h-[18px] w-[18px]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <Sun
        className="theme-icon-sun h-[18px] w-[18px]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </button>
  );
}
