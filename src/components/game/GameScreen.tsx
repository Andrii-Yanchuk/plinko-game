"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CurrentUser } from "@/lib/auth-api";
import type { Bet } from "@/lib/bets-api";
import { getGameConfig } from "@/lib/game-api";
import { queryKeys } from "@/lib/query-keys";
import { GameSidebar } from "./GameSidebar";
import { PlinkoBoard } from "./PlinkoBoard";
import type { Risk } from "./types";
import { useFullscreen } from "./useFullscreen";

export function GameScreen() {
  const queryClient = useQueryClient();
  const {
    elementRef: gameScreenRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLElement>();
  const [lastBet, setLastBet] = useState<Bet | null>(null);
  const [isRoundPlaying, setIsRoundPlaying] = useState(false);
  const [rows, setRows] = useState(8);
  const [risk, setRisk] = useState<Risk>("LOW");
  const { data: gameConfig } = useQuery({
    queryFn: getGameConfig,
    queryKey: queryKeys.gameConfig,
  });

  const handleBetAnimationComplete = useCallback((bet: Bet) => {
    queryClient.setQueryData<CurrentUser>(
      queryKeys.currentUser,
      (currentUser) =>
        currentUser ? { ...currentUser, balance: bet.balanceAfter } : currentUser,
    );
    setIsRoundPlaying(false);
  }, [queryClient]);

  const handleBetPlaced = useCallback((bet: Bet) => {
    setIsRoundPlaying(true);
    setLastBet(bet);
  }, []);

  return (
    <section
      ref={gameScreenRef}
      className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col"
    >
      <GameSidebar
        config={gameConfig}
        isFullscreen={isFullscreen}
        isRoundPlaying={isRoundPlaying}
        lastBet={lastBet}
        onBetPlaced={handleBetPlaced}
        onFullscreenClick={toggleFullscreen}
        onRiskChange={setRisk}
        onRowsChange={setRows}
        risk={risk}
        rows={rows}
      />
      <PlinkoBoard
        config={gameConfig}
        lastBet={lastBet}
        onBetAnimationComplete={handleBetAnimationComplete}
        risk={risk}
        rows={rows}
      />
    </section>
  );
}
