"use client";

import { useGameScreenStore } from "@/widgets/game-screen/model/useGameScreenStore";

export function useGameSettings() {
  const animationsEnabled = useGameScreenStore(
    (state) => state.animationsEnabled,
  );
  const rows = useGameScreenStore((state) => state.rows);
  const risk = useGameScreenStore((state) => state.risk);
  const soundEnabled = useGameScreenStore((state) => state.soundEnabled);
  const setAnimationsEnabled = useGameScreenStore(
    (state) => state.setAnimationsEnabled,
  );
  const setRows = useGameScreenStore((state) => state.setRows);
  const setRisk = useGameScreenStore((state) => state.setRisk);
  const setSoundEnabled = useGameScreenStore((state) => state.setSoundEnabled);

  return {
    animationsEnabled,
    rows,
    risk,
    soundEnabled,
    setAnimationsEnabled,
    setRows,
    setRisk,
    setSoundEnabled,
  };
}
