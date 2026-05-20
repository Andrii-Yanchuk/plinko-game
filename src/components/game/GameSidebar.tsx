"use client";

import { type KeyboardEvent, useState } from "react";
import type { Bet } from "@/lib/bets-api";
import type { GameConfig } from "@/lib/game-api";
import type { BetControl, GameMode, Risk } from "./types";
import { getNextBetAmount } from "./utils/amount";
import { isBlockedNumberInputKey } from "./utils/input";
import { AutoPlayControls } from "./sidebar/AutoPlayControls";
import { BetActionButton } from "./sidebar/BetActionButton";
import { BetAmountControl } from "./sidebar/BetAmountControl";
import { LastBetSummary } from "./sidebar/LastBetSummary";
import { ModeToggle } from "./sidebar/ModeToggle";
import { RiskSelector } from "./sidebar/RiskSelector";
import { RowsSelector } from "./sidebar/RowsSelector";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { useAutoPlay } from "./useAutoPlay";
import { useGameSidebarConfig } from "./useGameSidebarConfig";
import { usePlaceBet } from "./usePlaceBet";

type GameSidebarProps = {
  config?: GameConfig;
  lastBet: Bet | null;
  onBetPlaced: (bet: Bet) => void;
  onRiskChange: (risk: Risk) => void;
  onRowsChange: (rows: number) => void;
  risk: Risk;
  rows: number;
};

export function GameSidebar({
  config,
  lastBet,
  onBetPlaced,
  onRiskChange,
  onRowsChange,
  risk,
  rows,
}: GameSidebarProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("Manual");
  const [betAmount, setBetAmount] = useState("1.00");
  const [autoBetCount, setAutoBetCount] = useState("10");
  const [stopOnProfit, setStopOnProfit] = useState("0.00");
  const [stopOnLoss, setStopOnLoss] = useState("0.00");
  const [error, setError] = useState("");
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

    setError("");

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

    setError("");

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
      autoPlay.stop();
      return;
    }

    if (selectedMode === "Auto") {
      void handleStartAutoPlay();
      return;
    }

    void handleBetClick();
  }

  const isManualPlaying =
    selectedMode === "Manual" && placeBetMutation.isPending;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#252D3E] bg-[#1A1F2ECC]/80 p-4 md:w-69.5 md:border-r md:border-b-0">
      <ModeToggle mode={selectedMode} onModeChange={setSelectedMode} />

      <BetAmountControl
        amount={betAmount}
        onAmountChange={setBetAmount}
        onBetControlClick={handleBetControlClick}
        onKeyDown={handleBetAmountKeyDown}
      />

      <RiskSelector
        availableRisks={availableRisks}
        onRiskChange={onRiskChange}
        risk={risk}
      />

      <RowsSelector
        maxRows={maxRows}
        minRows={minRows}
        onRowsChange={onRowsChange}
        rows={rows}
        rowsProgress={rowsProgress}
      />

      {selectedMode === "Auto" ? (
        <AutoPlayControls
          autoBetCount={autoBetCount}
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
      <SidebarFooter />
    </aside>
  );
}
