"use client";

import type { KeyboardEvent } from "react";
import type { Bet } from "@/entities/bet/model/types";
import type { BetControl, GameConfig, Risk } from "@/entities/game/model/types";
import { getNextBetAmount } from "@/entities/game/lib/amount";
import { isBlockedNumberInputKey } from "@/entities/game/lib/input";
import { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
import { useGameSidebarConfig } from "@/widgets/game-sidebar/model/useGameSidebarConfig";
import { useGameSidebarStore } from "@/widgets/game-sidebar/model/useGameSidebarStore";
import { AutoPlayControls } from "./AutoPlayControls";
import { BetActionButton } from "./BetActionButton";
import { BetAmountControl } from "./BetAmountControl";
import { LastBetSummary } from "./LastBetSummary";
import { ModeToggle } from "./ModeToggle";
import { RiskSelector } from "./RiskSelector";
import { RowsSelector } from "./RowsSelector";
import { SidebarFooter } from "./SidebarFooter";

type GameSidebarProps = {
  animationsEnabled: boolean;
  config?: GameConfig;
  isRoundPlaying: boolean;
  lastBet: Bet | null;
  onAnimationsChange: (enabled: boolean) => void;
  onBetPlaced: (bet: Bet) => Promise<void> | void;
  onFullscreenClick: () => void;
  onRiskChange: (risk: Risk) => void;
  onRowsChange: (rows: number) => void;
  onSoundChange: (enabled: boolean) => void;
  isFullscreen: boolean;
  risk: Risk;
  rows: number;
  soundEnabled: boolean;
};

export function GameSidebar({
  animationsEnabled,
  config,
  isFullscreen,
  isRoundPlaying,
  lastBet,
  onAnimationsChange,
  onBetPlaced,
  onFullscreenClick,
  onRiskChange,
  onRowsChange,
  onSoundChange,
  risk,
  rows,
  soundEnabled,
}: GameSidebarProps) {
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
    placeBet: placeBetMutation.placeBet,
  });

  function handleBetAmountKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isBlockedNumberInputKey(event.key)) {
      event.preventDefault();
    }
  }

  function handleBetControlClick(control: BetControl) {
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
  }

  async function handleBetClick() {
    if (selectedMode === "Auto") {
      return;
    }

    const amount = getValidatedBetAmount(betAmount);

    if (!amount) {
      setError(validationMessage);
      return;
    }

    clearError();

    try {
      await placeBetMutation.placeBet({
        amount,
        rows,
        risk,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to place bet");
    }
  }

  async function handleStartAutoPlay() {
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
  }

  function handleMainButtonClick() {
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
  }

  const isManualPlaying =
    selectedMode === "Manual" && (placeBetMutation.isPending || isRoundPlaying);
  const isSidebarDisabled = placeBetMutation.isPending || isRoundPlaying;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#252D3E] bg-[#1A1F2ECC]/80 p-4 md:w-69.5 md:border-r md:border-b-0">
      <ModeToggle
        disabled={isSidebarDisabled}
        mode={selectedMode}
        onModeChange={setSelectedMode}
      />

      <BetAmountControl
        amount={betAmount}
        disabled={isSidebarDisabled}
        onAmountChange={setBetAmount}
        onBetControlClick={handleBetControlClick}
        onKeyDown={handleBetAmountKeyDown}
      />

      <RiskSelector
        availableRisks={availableRisks}
        disabled={isSidebarDisabled}
        onRiskChange={onRiskChange}
        risk={risk}
      />

      <RowsSelector
        maxRows={maxRows}
        disabled={isSidebarDisabled}
        minRows={minRows}
        onRowsChange={onRowsChange}
        rows={rows}
        rowsProgress={rowsProgress}
      />

      {selectedMode === "Auto" ? (
        <AutoPlayControls
          autoBetCount={autoBetCount}
          disabled={isSidebarDisabled}
          isAutoPlaying={autoPlay.isPlaying}
          onAutoBetCountChange={setAutoBetCount}
          onKeyDown={handleBetAmountKeyDown}
          onStopOnLossChange={setStopOnLoss}
          onStopOnProfitChange={setStopOnProfit}
          stopOnLoss={stopOnLoss}
          stopOnProfit={stopOnProfit}
        />
      ) : null}

      <BetActionButton
        autoProgress={autoPlay.progress}
        isAutoPlaying={autoPlay.isPlaying}
        isAutoStopping={autoPlay.isStopping}
        isManualPlaying={isManualPlaying}
        mode={selectedMode}
        onClick={handleMainButtonClick}
      />

      {error ? (
        <p className="mt-3 rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-3 py-2 text-xs font-medium text-[#FDA4AF]">
          {error}
        </p>
      ) : null}

      <LastBetSummary lastBet={lastBet} />
      <SidebarFooter
        animationsEnabled={animationsEnabled}
        isFullscreen={isFullscreen}
        onAnimationsChange={onAnimationsChange}
        onFullscreenClick={onFullscreenClick}
        onSoundChange={onSoundChange}
        soundEnabled={soundEnabled}
      />
    </aside>
  );
}
