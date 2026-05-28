"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { memo, useEffect } from "react";
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
import { ModeToggle } from "./ModeToggle";
import { RiskSelector } from "./RiskSelector";
import { RowsSelector } from "./RowsSelector";
import { SidebarFooter } from "./SidebarFooter";

type GameSidebarProps = {
  activeManualRoundCount: number;
  animationsEnabled: boolean;
  config?: GameConfig;
  isMobileOpen?: boolean;
  manualRoundLimit: number;
  onAnimationsChange: (enabled: boolean) => void;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
  onFullscreenClick: () => void;
  onMobileClose?: () => void;
  onMobileOpen?: () => void;
  onRiskChange: (risk: Risk) => void;
  onRowsChange: (rows: number) => void;
  onSoundChange: (enabled: boolean) => void;
  isFullscreen: boolean;
  risk: Risk;
  rows: number;
  soundEnabled: boolean;
};

export const GameSidebar = memo(function GameSidebar({
  activeManualRoundCount,
  animationsEnabled,
  config,
  isFullscreen,
  isMobileOpen = false,
  manualRoundLimit,
  onAnimationsChange,
  onBetPlaced,
  onFullscreenClick,
  onMobileClose,
  onMobileOpen,
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
  } = useGameSidebarActions({
    activeManualRoundCount,
    config,
    manualRoundLimit,
    onBetPlaced,
    risk,
    rows,
  });

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  function renderSidebarContent() {
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

  return (
    <>
      <aside className="hidden w-full shrink-0 flex-col border-b border-[#252D3E] bg-[#1A1F2ECC]/80 p-4 pb-0 md:flex md:h-[calc(100vh-4rem)] md:w-69.5 md:self-start md:overflow-y-auto md:border-r md:border-b-0">
        {renderSidebarContent()}
      </aside>

      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          aria-label="Close bet controls"
          className={`absolute inset-0 bg-[#050914]/70 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onMobileClose}
          tabIndex={isMobileOpen ? 0 : -1}
          type="button"
        />
        <aside
          aria-hidden={!isMobileOpen}
          inert={!isMobileOpen}
          className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-90 flex-col overflow-y-auto border-r border-[#2A2F3E] bg-[#1A1F2E] p-4 pb-0 shadow-2xl transition-transform duration-300 ease-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            aria-label="Close bet controls"
            className="absolute top-4 right-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#2626264D] text-[#D1D5DC] transition-colors hover:bg-[#323A4C]"
            onClick={onMobileClose}
            tabIndex={isMobileOpen ? 0 : -1}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
          {renderSidebarContent()}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-3 md:hidden">
        <div className="mx-auto max-w-md rounded-[10px] border border-[#252D3E] bg-[#151A29]/95 p-3 shadow-2xl backdrop-blur">
          <div className="flex h-10 w-full items-center gap-2 text-left text-sm font-medium text-[#9AA3B6]">
            <button
              aria-label="Open bet controls"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#252C3D] text-[#A9B1C2] transition-colors hover:bg-[#323A4C] hover:text-[#F4F7FB]"
              onClick={onMobileOpen}
              type="button"
            >
              <SlidersHorizontal
                aria-hidden="true"
                className="h-5 w-5 rotate-90"
              />
            </button>
            <span className="truncate">
              {betAmount} {"\u2022"} {risk} {"\u2022"} {rows} rows
            </span>
          </div>
          <BetActionButton
            activeManualRoundCount={activeManualRoundCount}
            autoProgress={autoPlay.progress}
            className="mt-2 h-14 w-full rounded-[10px] text-base font-semibold"
            isAutoPlaying={autoPlay.isPlaying}
            isAutoStopping={autoPlay.isStopping}
            isManualBetDisabled={isManualBetDisabled}
            isManualRequestPending={isManualRequestPending}
            manualRoundLimit={manualRoundLimit}
            mode={selectedMode}
            onClick={handleMainButtonClick}
          />
          {error ? (
            <p className="mt-2 rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-3 py-2 text-xs font-medium text-[#FDA4AF]">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
})
