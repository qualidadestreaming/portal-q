"use client";

import Link from "next/link";
import { LayoutGrid, ShieldUser } from "lucide-react";
import { SearchInput } from "@/components/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSelector } from "@/components/LocaleSelector";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:gap-6 md:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md py-1 text-text"
        >
          <LayoutGrid className="h-5 w-5 text-text-muted" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-base font-semibold tracking-tight">Portal Q</span>
        </Link>

        <SearchInput />

        <nav className="ml-auto flex shrink-0 items-center gap-1.5">
          <ThemeToggle />

          <LocaleSelector />

          <button
            type="button"
            title="Entrar como administrador — disponível na Etapa 8"
            className="ml-1 flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <ShieldUser className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Administrador</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
