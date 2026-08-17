import { AppGrid } from "@/components/AppGrid";
import { ErrorState } from "@/components/ErrorState";
import { AddAppButton } from "@/components/AddAppButton";
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
      {/* Só aparece em modo admin; o próprio botão se esconde para visitantes.
          Fica antes da grade para existir também quando a planilha está vazia,
          que é justamente quando o admin precisa cadastrar o primeiro app. */}
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-4 empty:hidden md:px-6">
        <AddAppButton />
      </div>
      {apps ? <AppGrid apps={apps} /> : <ErrorState />}
    </main>
  );
}
