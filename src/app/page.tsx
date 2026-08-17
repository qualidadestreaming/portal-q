import { AppGrid } from "@/components/AppGrid";
import { ErrorState } from "@/components/ErrorState";
import { getApps } from "@/lib/sheets";

export default async function Home() {
  let apps: Awaited<ReturnType<typeof getApps>> | null = null;

  try {
    apps = await getApps();
  } catch (error) {
    console.error("[portal-q] Falha ao buscar aplicativos:", error);
  }

  return (
    <main className="flex flex-1 flex-col">
      {apps ? <AppGrid apps={apps} /> : <ErrorState />}
    </main>
  );
}
