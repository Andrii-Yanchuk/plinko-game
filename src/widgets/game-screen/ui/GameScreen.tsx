"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import { getGameConfig } from "@/entities/game/api/gameApi";
import type { RoundContext } from "@/entities/game/model/types";
import type { CurrentUser } from "@/entities/user/model/types";
import { useGameSound } from "@/features/game-sound/model/useGameSound";
import {
  createActiveRound,
  manualRoundLimit,
  type ActiveRound,
} from "@/widgets/game-screen/model/activeRound";
import { GameSidebar } from "@/widgets/game-sidebar/ui/GameSidebar";
import { PlinkoBoard } from "@/widgets/plinko-board/ui/PlinkoBoard";
import { delay } from "@/shared/lib/delay";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useFullscreen } from "@/shared/lib/useFullscreen";
import { useGameScreenStore } from "@/widgets/game-screen/model/useGameScreenStore";

export function GameScreen() {
  const queryClient = useQueryClient();
  const autoRoundCompletionRef = useRef<{
    roundId: string;
    resolve: () => void;
  } | null>(null);
  const completedPresentationRoundIdsRef = useRef(new Set<string>());
  const {
    elementRef: gameScreenRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLElement>();
  const [lastBet, setLastBet] = useState<Bet | null>(null);
  const [activeRounds, setActiveRounds] = useState<ActiveRound[]>([]);
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

  useEffect(() => {
    const activeRoundIds = new Set(activeRounds.map((round) => round.id));

    completedPresentationRoundIdsRef.current.forEach((roundId) => {
      if (!activeRoundIds.has(roundId)) {
        completedPresentationRoundIdsRef.current.delete(roundId);
      }
    });
  }, [activeRounds]);

  const handleBetPresentationComplete = useCallback((roundId: string) => {
    if (completedPresentationRoundIdsRef.current.has(roundId)) {
      return;
    }

    const completedRound = activeRounds.find((round) => round.id === roundId);

    if (!completedRound) {
      return;
    }

    completedPresentationRoundIdsRef.current.add(roundId);

    const { bet } = completedRound;

    setActiveRounds((currentRounds) =>
      currentRounds.map((round) =>
        round.id === completedRound.id
          ? { ...round, isResultVisible: true }
          : round,
      ),
    );

    gameSound.playBucketHit();
    gameSound.playResult(bet);

    queryClient.setQueryData<CurrentUser>(
      queryKeys.currentUser,
      (currentUser) =>
        currentUser ? { ...currentUser, balance: bet.balanceAfter } : currentUser,
    );

    void delay(completedRound.resultPauseMs).then(() => {
      setActiveRounds((currentRounds) =>
        currentRounds.filter((round) => round.id !== completedRound.id),
      );

      const pendingAutoRound = autoRoundCompletionRef.current;

      if (pendingAutoRound?.roundId === completedRound.id) {
        autoRoundCompletionRef.current = null;
        pendingAutoRound.resolve();
      }
    });
  }, [activeRounds, gameSound, queryClient]);

  const handleBetPlaced = useCallback((bet: Bet, context: RoundContext) => {
    const activeRound = createActiveRound({
      animationsEnabled,
      bet,
      context,
    });

    gameSound.playBetStart();
    setLastBet(bet);
    setActiveRounds((currentRounds) => [...currentRounds, activeRound]);

    if (context.mode === "Manual") {
      return;
    }

    return new Promise<void>((resolve) => {
      autoRoundCompletionRef.current = {
        roundId: activeRound.id,
        resolve,
      };
    });
  }, [animationsEnabled, gameSound]);

  const activeManualRoundCount = activeRounds.filter(
    (round) => round.mode === "Manual",
  ).length;

  return (
    <section
      ref={gameScreenRef}
      className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col"
    >
      <GameSidebar
        animationsEnabled={animationsEnabled}
        activeManualRoundCount={activeManualRoundCount}
        config={gameConfig}
        isFullscreen={isFullscreen}
        lastBet={lastBet}
        manualRoundLimit={manualRoundLimit}
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
        activeRounds={activeRounds}
        isAnimationEnabled={animationsEnabled}
        config={gameConfig}
        onRoundAnimationComplete={handleBetPresentationComplete}
        onPegImpact={gameSound.playPegHit}
        risk={risk}
        rows={rows}
      />
    </section>
  );
}
