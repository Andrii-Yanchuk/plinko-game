"use client";

import { SlidersHorizontal } from "lucide-react";
import type { Risk } from "@/entities/game/model/types";
import type { GameSidebarActions } from "@/widgets/game-sidebar/model/useGameSidebarActions";
import { BetActionButton } from "./BetActionButton";

type SidebarMobileBarProps = {
  actions: GameSidebarActions;
  activeManualRoundCount: number;
  manualRoundLimit: number;
  onMobileOpen?: () => void;
  risk: Risk;
  rows: number;
};

export function SidebarMobileBar({
  actions,
  activeManualRoundCount,
  manualRoundLimit,
  onMobileOpen,
  risk,
  rows,
}: SidebarMobileBarProps) {
  const {
    autoPlay,
    betAmount,
    error,
    handleMainButtonClick,
    isManualBetDisabled,
    isManualRequestPending,
    selectedMode,
  } = actions;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-3 md:hidden">
      <div className="mx-auto max-w-md rounded-[10px] border border-[#252D3E] bg-[#151A29]/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex h-10 w-full items-center gap-2 text-left text-sm font-medium text-[#9AA3B6]">
          <button
            aria-label="Open bet controls"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#252C3D] text-[#A9B1C2] transition-colors hover:bg-[#323A4C] hover:text-[#F4F7FB]"
            onClick={onMobileOpen}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5 rotate-90" />
          </button>
          <span className="truncate">
            {betAmount} {"•"} {risk} {"•"} {rows} rows
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
  );
}
