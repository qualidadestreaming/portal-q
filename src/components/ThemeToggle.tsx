"use client";

import { Moon, Sun } from "lucide-react";
import { applyTheme, getEffectiveTheme } from "@/lib/theme";
import { useLocale } from "@/components/LocaleContext";

export function ThemeToggle() {
  const { t } = useLocale();

  function handleClick() {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("themeToggle")}
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
