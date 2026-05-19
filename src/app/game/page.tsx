import { GameSidebar } from "@/components/game/GameSidebar";
import { PlinkoBoard } from "@/components/game/PlinkoBoard";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#101725] text-[#F4F7FB]">
      <section className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col">
        <GameSidebar />
        <PlinkoBoard />
      </section>
    </main>
  );
}
