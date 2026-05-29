"use client";

import type { Risk } from "@/entities/game/model/types";
import type { GameSidebarActions } from "@/widgets/game-sidebar/model/useGameSidebarActions";
import { AutoPlayControls } from "./AutoPlayControls";
import { BetActionButton } from "./BetActionButton";
import { BetAmountControl } from "./BetAmountControl";
import { ModeToggle } from "./ModeToggle";
import { RiskSelector } from "./RiskSelector";
import { RowsSelector } from "./RowsSelector";
import { SidebarFooter } from "./SidebarFooter";

type SidebarContentProps = {
  actions: GameSidebarActions;
  activeManualRoundCount: number;
  animationsEnabled: boolean;
  isFullscreen: boolean;
  manualRoundLimit: number;
  onAnimationsChange: (enabled: boolean) => void;
  onFullscreenClick: () => void;
  onRiskChange: (risk: Risk) => void;
  onRowsChange: (rows: number) => void;
  onSoundChange: (enabled: boolean) => void;
  risk: Risk;
  rows: number;
  soundEnabled: boolean;
};

export function SidebarContent({
  actions,
  activeManualRoundCount,
  animationsEnabled,
  isFullscreen,
  manualRoundLimit,
  onAnimationsChange,
  onFullscreenClick,
  onRiskChange,
  onRowsChange,
  onSoundChange,
  risk,
  rows,
  soundEnabled,
}: SidebarContentProps) {
  const {
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
  } = actions;

  return (
    <>
      <ModeToggle
        disabled={isSidebarDisabled}
        mode={selectedMode}
        onModeChange={setSelectedMode}
      />

      <BetAmountControl
        amount={betAmount}
        disabled={isBetAmountDisabled}
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
        activeManualRoundCount={activeManualRoundCount}
        autoProgress={autoPlay.progress}
        isAutoPlaying={autoPlay.isPlaying}
        isAutoStopping={autoPlay.isStopping}
        isManualBetDisabled={isManualBetDisabled}
        isManualRequestPending={isManualRequestPending}
        manualRoundLimit={manualRoundLimit}
        mode={selectedMode}
        onClick={handleMainButtonClick}
      />

      {error ? (
        <p className="mt-3 rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-3 py-2 text-xs font-medium text-[#FDA4AF]">
          {error}
        </p>
      ) : null}

      <SidebarFooter
        animationsEnabled={animationsEnabled}
        isFullscreen={isFullscreen}
        onAnimationsChange={onAnimationsChange}
        onFullscreenClick={onFullscreenClick}
        onSoundChange={onSoundChange}
        isAnimationToggleDisabled={false}
        soundEnabled={soundEnabled}
      />
    </>
  );
}
