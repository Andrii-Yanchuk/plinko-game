"use client";

import { useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import { getGameConfig } from "@/entities/game/api/gameApi";
import type { CurrentUser } from "@/entities/user/model/types";
import { GameSidebar } from "@/widgets/game-sidebar/ui/GameSidebar";
import { PlinkoBoard } from "@/widgets/plinko-board/ui/PlinkoBoard";
import { useFullscreen } from "@/components/game/useFullscreen";
import { delay } from "@/shared/lib/delay";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useGameScreenStore } from "@/widgets/game-screen/model/useGameScreenStore";

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
  const lastBet = useGameScreenStore((state) => state.lastBet);
  const isRoundPlaying = useGameScreenStore((state) => state.isRoundPlaying);
  const rows = useGameScreenStore((state) => state.rows);
  const risk = useGameScreenStore((state) => state.risk);
  const setLastBet = useGameScreenStore((state) => state.setLastBet);
  const setRoundPlaying = useGameScreenStore(
    (state) => state.setRoundPlaying,
  );
  const setRows = useGameScreenStore((state) => state.setRows);
  const setRisk = useGameScreenStore((state) => state.setRisk);
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
      setRoundPlaying(false);
      pendingRound.resolve();
    });
  }, [queryClient, setRoundPlaying]);

  const handleBetPlaced = useCallback((bet: Bet) => {
    setRoundPlaying(true);
    setLastBet(bet);

    return new Promise<void>((resolve) => {
      roundCompletionRef.current = {
        betId: bet.betId,
        resolve,
      };
    });
  }, [setLastBet, setRoundPlaying]);

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
