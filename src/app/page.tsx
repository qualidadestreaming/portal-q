import { EmptyState } from "@/components/EmptyState";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="flex flex-1 flex-col">
        <EmptyState />
      </main>
    </>
  );
}
