import { resolveAppIcon } from "@/lib/icons";
import { AppCardClient } from "@/components/AppCardClient";
import type { App } from "@/lib/sheets";

export async function AppCard({ app }: { app: App }) {
  const Icon = await resolveAppIcon(app.icon);

  return <AppCardClient app={app} Icon={Icon} />;
}
