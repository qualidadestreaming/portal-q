import { AppCard } from "@/components/AppCard";
import { EmptyState } from "@/components/EmptyState";
import { NoResultsState } from "@/components/NoResultsState";
import { SearchableGrid } from "@/components/SearchableGrid";
import { ReorderProvider } from "@/components/ReorderProvider";
import { ReorderErrorBanner } from "@/components/ReorderErrorBanner";
import type { App } from "@/lib/sheets";

export function AppGrid({ apps }: { apps: App[] }) {
  if (apps.length === 0) {
    return <EmptyState />;
  }

  return (
    // Envolve visitante e admin igual: o Provider é só contexto, sem custo de
    // dado ou efeito visível — as setas de mover são as únicas que o usam.
    <ReorderProvider ids={apps.map((app) => app.id)}>
      <ReorderErrorBanner />
      <SearchableGrid
        items={apps.map((app) => ({ id: app.id, name: app.name }))}
        empty={<NoResultsState />}
      >
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </SearchableGrid>
    </ReorderProvider>
  );
}
