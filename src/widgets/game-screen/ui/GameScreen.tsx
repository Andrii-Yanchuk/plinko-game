"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import { getGameConfig } from "@/entities/game/api/gameApi";
import type { RoundContext } from "@/entities/game/model/types";
import type { CurrentUser } from "@/entities/user/model/types";
import { useGameSound } from "@/features/game-sound/model/useGameSound";
import { getRoundResultPauseMs } from "@/widgets/game-screen/lib/roundTiming";
import { GameSidebar } from "@/widgets/game-sidebar/ui/GameSidebar";
import { PlinkoBoard } from "@/widgets/plinko-board/ui/PlinkoBoard";
import { delay } from "@/shared/lib/delay";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useFullscreen } from "@/shared/lib/useFullscreen";
import { useGameScreenStore } from "@/widgets/game-screen/model/useGameScreenStore";

export function GameScreen() {
  const queryClient = useQueryClient();
  const roundCompletionRef = useRef<{
    betId: string;
    resultPauseMs: number;
    resolve: () => void;
  } | null>(null);
  const {
    elementRef: gameScreenRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLElement>();
  const [lastBet, setLastBet] = useState<Bet | null>(null);
  const [isRoundPlaying, setIsRoundPlaying] = useState(false);
  const animationsEnabled = useGameScreenStore(
    (state) => state.animationsEnabled,
  );
  const rows = useGameScreenStore((state) => state.rows);
  const risk = useGameScreenStore((state) => state.risk);
  const soundEnabled = useGameScreenStore((state) => state.soundEnabled);
  const setAnimationsEnabled = useGameScreenStore(
    (state) => state.setAnimationsEnabled,
  );
  const setRows = useGameScreenStore((state) => state.setRows);
  const setRisk = useGameScreenStore((state) => state.setRisk);
  const setSoundEnabled = useGameScreenStore((state) => state.setSoundEnabled);
  const gameSound = useGameSound(soundEnabled);
  const { data: gameConfig } = useQuery({
    queryFn: getGameConfig,
    queryKey: queryKeys.gameConfig,
  });

  const handleBetPresentationComplete = useCallback((bet: Bet) => {
    gameSound.playBucketHit();
    gameSound.playResult(bet);

    queryClient.setQueryData<CurrentUser>(
      queryKeys.currentUser,
      (currentUser) =>
        currentUser ? { ...currentUser, balance: bet.balanceAfter } : currentUser,
    );

    const pendingRound = roundCompletionRef.current;

    if (pendingRound?.betId !== bet.betId) {
      return;
    }

    void delay(pendingRound.resultPauseMs).then(() => {
      roundCompletionRef.current = null;
      setIsRoundPlaying(false);
      pendingRound.resolve();
    });
  }, [gameSound, queryClient]);

  const handleBetPlaced = useCallback((bet: Bet, context: RoundContext) => {
    gameSound.playBetStart();
    setIsRoundPlaying(true);
    setLastBet(bet);

    return new Promise<void>((resolve) => {
      roundCompletionRef.current = {
        betId: bet.betId,
        resultPauseMs: getRoundResultPauseMs({
          animationsEnabled,
          mode: context.mode,
        }),
        resolve,
      };
    });
  }, [animationsEnabled, gameSound]);

  return (
    <section
      ref={gameScreenRef}
      className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col"
    >
      <GameSidebar
        animationsEnabled={animationsEnabled}
        config={gameConfig}
        isFullscreen={isFullscreen}
        isRoundPlaying={isRoundPlaying}
        lastBet={lastBet}
        onAnimationsChange={setAnimationsEnabled}
        onBetPlaced={handleBetPlaced}
        onFullscreenClick={toggleFullscreen}
        onRiskChange={setRisk}
        onRowsChange={setRows}
        onSoundChange={setSoundEnabled}
        risk={risk}
        rows={rows}
        soundEnabled={soundEnabled}
      />
      <PlinkoBoard
        isAnimationEnabled={animationsEnabled}
        config={gameConfig}
        lastBet={lastBet}
        onBetAnimationComplete={handleBetPresentationComplete}
        onPegImpact={gameSound.playPegHit}
        risk={risk}
        rows={rows}
      />
    </section>
  );
}
