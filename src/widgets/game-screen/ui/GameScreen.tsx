"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import { getGameConfig } from "@/entities/game/api/gameApi";
import type { CurrentUser } from "@/entities/user/model/types";
import { useGameSound } from "@/features/game-sound/model/useGameSound";
import { manualRoundLimit } from "@/widgets/game-screen/model/activeRound";
import { useActiveRounds } from "@/widgets/game-screen/model/useActiveRounds";
import { useGameSettings } from "@/widgets/game-screen/model/useGameSettings";
import { useMobileSidebar } from "@/widgets/game-screen/model/useMobileSidebar";
import { useNavigationGuardSync } from "@/widgets/game-screen/model/useNavigationGuardSync";
import { GameSidebar } from "@/widgets/game-sidebar/ui/GameSidebar";
import { PlinkoBoard } from "@/widgets/plinko-board/ui/PlinkoBoard";
import { useMainFullscreen } from "@/shared/lib/fullscreenContext";
import { queryKeys } from "@/shared/lib/queryKeys";

export function GameScreen() {
  const queryClient = useQueryClient();
  const { isFullscreen, toggleFullscreen } = useMainFullscreen();
  const {
    animationsEnabled,
    rows,
    risk,
    soundEnabled,
    setAnimationsEnabled,
    setRows,
    setRisk,
    setSoundEnabled,
  } = useGameSettings();
  const gameSound = useGameSound(soundEnabled);
  const { data: gameConfig } = useQuery({
    queryFn: getGameConfig,
    queryKey: queryKeys.gameConfig,
  });

  const handleRoundSettled = useCallback(
    (bet: Bet) => {
      queryClient.setQueryData<CurrentUser>(
        queryKeys.currentUser,
        (currentUser) =>
          currentUser
            ? { ...currentUser, balance: bet.balanceAfter }
            : currentUser,
      );
    },
    [queryClient],
  );

  const {
    activeRounds,
    activeManualRoundCount,
    handleBetPlaced,
    handleBetPresentationComplete,
  } = useActiveRounds({
    animationsEnabled,
    gameSound,
    onRoundSettled: handleRoundSettled,
  });

  useNavigationGuardSync(activeRounds.length);

  const { isMobileSidebarOpen, handleMobileClose, handleMobileOpen } =
    useMobileSidebar();

  return (
    <section className="flex min-h-screen w-full overflow-hidden bg-[#101725] pb-16 max-md:flex-col">
      <GameSidebar
        animationsEnabled={animationsEnabled}
        activeManualRoundCount={activeManualRoundCount}
        config={gameConfig}
        isFullscreen={isFullscreen}
        isMobileOpen={isMobileSidebarOpen}
        manualRoundLimit={manualRoundLimit}
        onAnimationsChange={setAnimationsEnabled}
        onBetPlaced={handleBetPlaced}
        onFullscreenClick={toggleFullscreen}
        onMobileClose={handleMobileClose}
        onMobileOpen={handleMobileOpen}
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
        onMobileMenuClick={handleMobileOpen}
        onPegImpact={gameSound.playPegHit}
        risk={risk}
        rows={rows}
      />
    </section>
  );
}
