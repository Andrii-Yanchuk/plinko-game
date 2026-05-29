"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bet } from "@/entities/bet/model/types";
import type { RoundContext } from "@/entities/game/model/types";
import type { GameSoundApi } from "@/features/game-sound/model/useGameSound";
import { delay } from "@/shared/lib/delay";
import {
  createActiveRound,
  type ActiveRound,
} from "@/widgets/game-screen/model/activeRound";

type UseActiveRoundsParams = {
  animationsEnabled: boolean;
  gameSound: GameSoundApi;
  onRoundSettled: (bet: Bet) => void;
};

export function useActiveRounds({
  animationsEnabled,
  gameSound,
  onRoundSettled,
}: UseActiveRoundsParams) {
  const [activeRounds, setActiveRounds] = useState<ActiveRound[]>([]);
  const activeRoundsRef = useRef(activeRounds);
  const autoRoundCompletionRef = useRef<{
    roundId: string;
    resolve: () => void;
  } | null>(null);
  const completedPresentationRoundIdsRef = useRef(new Set<string>());

  useEffect(() => {
    activeRoundsRef.current = activeRounds;
  }, [activeRounds]);

  useEffect(() => {
    const activeRoundIds = new Set(activeRounds.map((round) => round.id));

    completedPresentationRoundIdsRef.current.forEach((roundId) => {
      if (!activeRoundIds.has(roundId)) {
        completedPresentationRoundIdsRef.current.delete(roundId);
      }
    });
  }, [activeRounds]);

  const handleBetPresentationComplete = useCallback(
    (roundId: string) => {
      if (completedPresentationRoundIdsRef.current.has(roundId)) {
        return;
      }

      const completedRound = activeRoundsRef.current.find(
        (round) => round.id === roundId,
      );

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

      onRoundSettled(bet);

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
    },
    [gameSound, onRoundSettled],
  );

  const handleBetPlaced = useCallback(
    (bet: Bet, context: RoundContext) => {
      const activeRound = createActiveRound({
        animationsEnabled,
        bet,
        context,
      });

      gameSound.playBetStart();
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
    },
    [animationsEnabled, gameSound],
  );

  const activeManualRoundCount = activeRounds.filter(
    (round) => round.mode === "Manual",
  ).length;

  return {
    activeRounds,
    activeManualRoundCount,
    handleBetPlaced,
    handleBetPresentationComplete,
  };
}
