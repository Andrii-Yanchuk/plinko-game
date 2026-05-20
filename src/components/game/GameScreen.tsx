"use client";

import { useState } from "react";
import type { Bet } from "@/lib/bets-api";
import { GameSidebar } from "./GameSidebar";
import { PlinkoBoard } from "./PlinkoBoard";

export function GameScreen() {
  const [lastBet, setLastBet] = useState<Bet | null>(null);

  return (
    <section className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col">
      <GameSidebar lastBet={lastBet} onBetPlaced={setLastBet} />
      <PlinkoBoard />
    </section>
  );
}
