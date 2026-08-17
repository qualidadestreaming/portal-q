const PLACEHOLDER_COUNT = 10;

/**
 * Aparece só em cache-miss (a leitura da planilha é cacheada por 5 min em
 * src/lib/sheets.ts) — a maioria das visitas nem chega a ver isto.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 md:p-6 lg:grid-cols-5">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse flex-col gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div className="h-10 w-10 rounded-md bg-surface-hover" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-3/4 rounded bg-surface-hover" />
              <div className="h-3 w-full rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
