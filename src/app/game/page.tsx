import { LogoutButton } from "@/components/LogoutButton";
import { UserBalance } from "@/components/UserBalance";

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background p-6 text-[#F4F7FB]">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col rounded-2xl border border-[#2A2F3E] bg-[#1A1F2E]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Plinko Game</h1>
          <div className="flex items-center gap-3">
            <UserBalance />
            <LogoutButton />
          </div>
        </div>
        <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#2A2F3E] bg-[#141922]/70 text-[#6A7282]">
          Game canvas will be here
        </div>
      </section>
    </main>
  );
}
