import { AppCard } from "@/components/AppCard";
import { EmptyState } from "@/components/EmptyState";
import { NoResultsState } from "@/components/NoResultsState";
import { SearchableGrid } from "@/components/SearchableGrid";
import type { App } from "@/lib/sheets";

export function AppGrid({ apps }: { apps: App[] }) {
  if (apps.length === 0) {
    return <EmptyState />;
  }

  return (
    <SearchableGrid
      items={apps.map((app) => ({ id: app.id, name: app.name }))}
      empty={<NoResultsState />}
    >
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </SearchableGrid>
  );
}
