import { resolveAppIcon } from "@/lib/icons";
import { AppCardClient } from "@/components/AppCardClient";
import type { App } from "@/lib/sheets";

export async function AppCard({ app }: { app: App }) {
  const Icon = await resolveAppIcon(app.icon);

  // O ícone vai como elemento já renderizado, não como componente: funções não
  // atravessam a fronteira servidor → cliente. Assim o SVG continua saindo
  // pronto do servidor (decisão da Etapa 4) e o cartão segue sendo cliente,
  // que é o que permite reagir a idioma e modo admin.
  return (
    <AppCardClient
      app={app}
      icon={<Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />}
    />
  );
}
