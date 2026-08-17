"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { normalizeSearchTerm, useSearch } from "@/components/SearchProvider";

type Item = { id: string; name: string };

/**
 * Recebe os cartões já renderizados no servidor (padrão de "interleaving" do
 * Next.js: Server Components passados como children para um Client
 * Component) e só alterna visibilidade conforme a busca — nenhum cartão é
 * re-renderizado ao digitar.
 */
export function SearchableGrid({
  items,
  children,
  empty,
}: {
  items: Item[];
  children: ReactNode;
  empty: ReactNode;
}) {
  const { query } = useSearch();
  const normalizedQuery = normalizeSearchTerm(query);
  const childArray = Children.toArray(children);
  const matches = items.map((item) => normalizeSearchTerm(item.name).includes(normalizedQuery));
  const hasVisible = matches.some(Boolean);

  if (normalizedQuery && !hasVisible) {
    return <>{empty}</>;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 md:p-6 lg:grid-cols-5">
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;
        const visible = matches[index];
        return (
          <div key={child.key ?? index} className={visible ? "contents" : "hidden"}>
            {child}
          </div>
        );
      })}
    </div>
  );
}
