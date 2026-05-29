"use client";

import { useEffect } from "react";
import { useGameNavigationGuardStore } from "@/features/game-navigation-guard/model/useGameNavigationGuardStore";

export function useNavigationGuardSync(activeRoundCount: number) {
  const setActiveRoundCount = useGameNavigationGuardStore(
    (state) => state.setActiveRoundCount,
  );

  useEffect(() => {
    setActiveRoundCount(activeRoundCount);
  }, [activeRoundCount, setActiveRoundCount]);

  useEffect(() => {
    return () => setActiveRoundCount(0);
  }, [setActiveRoundCount]);
}
