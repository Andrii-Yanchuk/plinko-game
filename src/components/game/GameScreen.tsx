"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import type { CurrentUser } from "@/entities/user/model/types";
import { getGameConfig } from "@/entities/game/api/gameApi";
import { queryKeys } from "@/lib/query-keys";
import { GameSidebar } from "./GameSidebar";
import { PlinkoBoard } from "./PlinkoBoard";
import type { Risk } from "./types";
import { delay } from "./utils/delay";
import { useFullscreen } from "./useFullscreen";

const roundResultPauseMs = 1000;

export function GameScreen() {
  const queryClient = useQueryClient();
  const roundCompletionRef = useRef<{
    betId: string;
    resolve: () => void;
  } | null>(null);
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

    const pendingRound = roundCompletionRef.current;

    if (pendingRound?.betId !== bet.betId) {
      return;
    }

    void delay(roundResultPauseMs).then(() => {
      roundCompletionRef.current = null;
      setIsRoundPlaying(false);
      pendingRound.resolve();
    });
  }, [queryClient]);

  const handleBetPlaced = useCallback((bet: Bet) => {
    setIsRoundPlaying(true);
    setLastBet(bet);

    return new Promise<void>((resolve) => {
      roundCompletionRef.current = {
        betId: bet.betId,
        resolve,
      };
    });
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
