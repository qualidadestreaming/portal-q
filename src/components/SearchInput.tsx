"use client";

import { Search, X } from "lucide-react";
import { useSearch } from "@/components/SearchProvider";
import { useLocale } from "@/components/LocaleContext";

export function SearchInput() {
  const { query, setQuery } = useSearch();
  const { t } = useLocale();

  return (
    <div className="relative min-w-0 flex-1 max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchLabel")}
        className="h-9 w-full rounded-md border border-border bg-bg pl-9 pr-8 text-sm text-text placeholder:text-text-muted"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label={t("searchClear")}
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-text-muted hover:text-text"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
