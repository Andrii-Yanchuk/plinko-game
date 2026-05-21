"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Bet } from "@/lib/bets-api";
import { getGameConfig } from "@/lib/game-api";
import { queryKeys } from "@/lib/query-keys";
import { GameSidebar } from "./GameSidebar";
import { PlinkoBoard } from "./PlinkoBoard";
import type { Risk } from "./types";
import { useFullscreen } from "./useFullscreen";

export function GameScreen() {
  const {
    elementRef: gameScreenRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLElement>();
  const [lastBet, setLastBet] = useState<Bet | null>(null);
  const [rows, setRows] = useState(8);
  const [risk, setRisk] = useState<Risk>("LOW");
  const { data: gameConfig } = useQuery({
    queryFn: getGameConfig,
    queryKey: queryKeys.gameConfig,
  });

  return (
    <section
      ref={gameScreenRef}
      className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col"
    >
      <GameSidebar
        config={gameConfig}
        isFullscreen={isFullscreen}
        lastBet={lastBet}
        onBetPlaced={setLastBet}
        onFullscreenClick={toggleFullscreen}
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
