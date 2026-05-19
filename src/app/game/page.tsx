import { GameSidebar } from "@/components/game/GameSidebar";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#101725] text-[#F4F7FB]">
      <section className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col">
        <GameSidebar />
        <div className="relative flex min-h-140 flex-1 flex-col overflow-hidden bg-[#101725]">
          Plinko board
        </div>
      </section>
    </main>
  );
}
