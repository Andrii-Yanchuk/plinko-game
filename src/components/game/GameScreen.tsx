"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Bet } from "@/lib/bets-api";
import { getGameConfig } from "@/lib/game-api";
import { queryKeys } from "@/lib/query-keys";
import { GameSidebar } from "./GameSidebar";
import { PlinkoBoard } from "./PlinkoBoard";
import type { Risk } from "./types";

export function GameScreen() {
  const [lastBet, setLastBet] = useState<Bet | null>(null);
  const [rows, setRows] = useState(16);
  const [risk, setRisk] = useState<Risk>("LOW");
  const { data: gameConfig } = useQuery({
    queryFn: getGameConfig,
    queryKey: queryKeys.gameConfig,
  });

  useEffect(() => {
    if (gameConfig) {
      console.log("Game config", gameConfig);
    }
  }, [gameConfig]);

  return (
    <section className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col">
      <GameSidebar
        config={gameConfig}
        lastBet={lastBet}
        onBetPlaced={setLastBet}
        onRiskChange={setRisk}
        onRowsChange={setRows}
        risk={risk}
        rows={rows}
      />
      <PlinkoBoard
        config={gameConfig}
        lastBet={lastBet}
        risk={risk}
        rows={rows}
      />
    </section>
  );
}
