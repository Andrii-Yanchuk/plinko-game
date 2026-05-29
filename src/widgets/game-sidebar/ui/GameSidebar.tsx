"use client";

import { X } from "lucide-react";
import { memo, useEffect } from "react";
import type { Bet } from "@/entities/bet/model/types";
import type {
  GameConfig,
  Risk,
  RoundContext,
} from "@/entities/game/model/types";
import { useGameSidebarActions } from "@/widgets/game-sidebar/model/useGameSidebarActions";
import { SidebarContent } from "./SidebarContent";
import { SidebarMobileBar } from "./SidebarMobileBar";

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
  const actions = useGameSidebarActions({
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

  const sidebarContent = (
    <SidebarContent
      actions={actions}
      activeManualRoundCount={activeManualRoundCount}
      animationsEnabled={animationsEnabled}
      isFullscreen={isFullscreen}
      manualRoundLimit={manualRoundLimit}
      onAnimationsChange={onAnimationsChange}
      onFullscreenClick={onFullscreenClick}
      onRiskChange={onRiskChange}
      onRowsChange={onRowsChange}
      onSoundChange={onSoundChange}
      risk={risk}
      rows={rows}
      soundEnabled={soundEnabled}
    />
  );

  return (
    <>
      <aside className="hidden w-full shrink-0 flex-col border-b border-[#252D3E] bg-[#1A1F2ECC]/80 p-4 pb-0 md:flex md:h-[calc(100vh-4rem)] md:w-69.5 md:self-start md:overflow-y-auto md:border-r md:border-b-0">
        {sidebarContent}
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
          {sidebarContent}
        </aside>
      </div>

      <SidebarMobileBar
        actions={actions}
        activeManualRoundCount={activeManualRoundCount}
        manualRoundLimit={manualRoundLimit}
        onMobileOpen={onMobileOpen}
        risk={risk}
        rows={rows}
      />
    </>
  );
})
