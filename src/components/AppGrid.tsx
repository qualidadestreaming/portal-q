import { AppCard } from "@/components/AppCard";
import { EmptyState } from "@/components/EmptyState";
import type { App } from "@/lib/sheets";

export function AppGrid({ apps }: { apps: App[] }) {
  if (apps.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 md:p-6 lg:grid-cols-5">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
