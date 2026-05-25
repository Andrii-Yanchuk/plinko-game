"use client";

import type { Bet } from "@/entities/bet/model/types";
import type {
  GameConfig,
  Risk,
  RoundContext,
} from "@/entities/game/model/types";
import { useGameSidebarActions } from "@/widgets/game-sidebar/model/useGameSidebarActions";
import { AutoPlayControls } from "./AutoPlayControls";
import { BetActionButton } from "./BetActionButton";
import { BetAmountControl } from "./BetAmountControl";
import { LastBetSummary } from "./LastBetSummary";
import { ModeToggle } from "./ModeToggle";
import { RiskSelector } from "./RiskSelector";
import { RowsSelector } from "./RowsSelector";
import { SidebarFooter } from "./SidebarFooter";

type GameSidebarProps = {
  activeManualRoundCount: number;
  animationsEnabled: boolean;
  config?: GameConfig;
  lastBet: Bet | null;
  manualRoundLimit: number;
  onAnimationsChange: (enabled: boolean) => void;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
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
  activeManualRoundCount,
  animationsEnabled,
  config,
  isFullscreen,
  lastBet,
  manualRoundLimit,
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
  const {
    autoPlay,
    availableRisks,
    autoBetCount,
    betAmount,
    error,
    handleBetAmountKeyDown,
    handleBetControlClick,
    handleMainButtonClick,
    isManualPlaying,
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
  } = useGameSidebarActions({
    activeManualRoundCount,
    config,
    manualRoundLimit,
    onBetPlaced,
    risk,
    rows,
  });

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
