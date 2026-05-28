import { useCallback, type KeyboardEvent } from "react";
import type { Bet } from "@/entities/bet/model/types";
import type {
  BetControl,
  GameConfig,
  Risk,
  RoundContext,
} from "@/entities/game/model/types";
import { getNextBetAmount } from "@/entities/game/lib/amount";
import { isBlockedNumberInputKey } from "@/entities/game/lib/input";
import { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
import { useGameSidebarConfig } from "@/widgets/game-sidebar/model/useGameSidebarConfig";
import { useGameSidebarStore } from "@/widgets/game-sidebar/model/useGameSidebarStore";

type UseGameSidebarActionsParams = {
  activeManualRoundCount: number;
  config?: GameConfig;
  manualRoundLimit: number;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
  risk: Risk;
  rows: number;
};

export function useGameSidebarActions({
  activeManualRoundCount,
  config,
  manualRoundLimit,
  onBetPlaced,
  risk,
  rows,
}: UseGameSidebarActionsParams) {
  const selectedMode = useGameSidebarStore((state) => state.selectedMode);
  const betAmount = useGameSidebarStore((state) => state.betAmount);
  const autoBetCount = useGameSidebarStore((state) => state.autoBetCount);
  const stopOnProfit = useGameSidebarStore((state) => state.stopOnProfit);
  const stopOnLoss = useGameSidebarStore((state) => state.stopOnLoss);
  const error = useGameSidebarStore((state) => state.error);
  const setSelectedMode = useGameSidebarStore(
    (state) => state.setSelectedMode,
  );
  const setBetAmount = useGameSidebarStore((state) => state.setBetAmount);
  const setAutoBetCount = useGameSidebarStore(
    (state) => state.setAutoBetCount,
  );
  const setStopOnProfit = useGameSidebarStore(
    (state) => state.setStopOnProfit,
  );
  const setStopOnLoss = useGameSidebarStore((state) => state.setStopOnLoss);
  const setError = useGameSidebarStore((state) => state.setError);
  const clearError = useGameSidebarStore((state) => state.clearError);
  const {
    availableRisks,
    getValidatedBetAmount,
    maxBetAmount,
    maxRows,
    minBetAmount,
    minRows,
    rowsProgress,
    validationMessage,
  } = useGameSidebarConfig(config, rows);
  const placeBetMutation = usePlaceBet({
    onBetAmountSettled: setBetAmount,
    onBetPlaced,
  });
  const autoPlay = useAutoPlay({
    placeBet: (payload) => placeBetMutation.placeBet(payload, { mode: "Auto" }),
  });
  const hasActiveManualRounds = activeManualRoundCount > 0;
  const isManualRoundLimitReached = activeManualRoundCount >= manualRoundLimit;
  const isManualRequestPending =
    selectedMode === "Manual" && placeBetMutation.isPending;
  const isBetAmountDisabled = placeBetMutation.isPending;

  const handleBetAmountKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (isBlockedNumberInputKey(event.key)) {
        event.preventDefault();
      }
    },
    [],
  );

  const handleBetControlClick = useCallback(
    (control: BetControl) => {
      const nextBetAmount = getNextBetAmount(
        betAmount,
        control,
        minBetAmount,
        maxBetAmount,
      );

      if (nextBetAmount === null) {
        return;
      }

      setBetAmount(nextBetAmount);
    },
    [betAmount, minBetAmount, maxBetAmount, setBetAmount],
  );

  const handleBetClick = useCallback(async () => {
    if (
      selectedMode === "Auto" ||
      placeBetMutation.isPending ||
      isManualRoundLimitReached
    ) {
      return;
    }

    const amount = getValidatedBetAmount(betAmount);

    if (!amount) {
      setError(validationMessage);
      return;
    }

    clearError();

    try {
      await placeBetMutation.placeBet(
        {
          amount,
          rows,
          risk,
        },
        { mode: "Manual" },
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to place bet");
    }
  }, [
    selectedMode,
    placeBetMutation.isPending,
    placeBetMutation.placeBet,
    isManualRoundLimitReached,
    getValidatedBetAmount,
    betAmount,
    setError,
    validationMessage,
    clearError,
    rows,
    risk,
  ]);

  const handleStartAutoPlay = useCallback(async () => {
    const amount = getValidatedBetAmount(betAmount);

    if (!amount) {
      setError(validationMessage);
      return;
    }

    clearError();

    try {
      await autoPlay.start({
        amount,
        numberOfBets: autoBetCount,
        risk,
        rows,
        stopOnLoss,
        stopOnProfit,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to auto play");
    }
  }, [
    getValidatedBetAmount,
    betAmount,
    setError,
    validationMessage,
    clearError,
    autoPlay.start,
    autoBetCount,
    risk,
    rows,
    stopOnLoss,
    stopOnProfit,
  ]);

  const handleMainButtonClick = useCallback(() => {
    if (autoPlay.isPlaying) {
      if (!autoPlay.isStopping) {
        autoPlay.stop();
      }
      return;
    }

    if (selectedMode === "Auto") {
      void handleStartAutoPlay();
      return;
    }

    void handleBetClick();
  }, [
    autoPlay.isPlaying,
    autoPlay.isStopping,
    autoPlay.stop,
    selectedMode,
    handleStartAutoPlay,
    handleBetClick,
  ]);

  const isManualBetDisabled =
    isManualRequestPending || isManualRoundLimitReached;
  const isSidebarDisabled = autoPlay.isPlaying || hasActiveManualRounds;

  return {
    autoPlay,
    availableRisks,
    autoBetCount,
    betAmount,
    error,
    handleBetAmountKeyDown,
    handleBetControlClick,
    handleMainButtonClick,
    isBetAmountDisabled,
    isManualBetDisabled,
    isManualRequestPending,
    isSidebarDisabled,
    maxRows,
    minRows,
    rowsProgress,
    selectedMode,
    setAutoBetCount,
    setBetAmount,
    setSelectedMode,
    setStopOnLoss,
    setStopOnProfit,
    stopOnLoss,
    stopOnProfit,
  };
}
