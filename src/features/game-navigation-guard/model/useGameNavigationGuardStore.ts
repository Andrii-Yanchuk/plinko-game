import { create } from "zustand";

type GameNavigationGuardState = {
  activeRoundCount: number;
  setActiveRoundCount: (count: number) => void;
};

export const useGameNavigationGuardStore =
  create<GameNavigationGuardState>((set) => ({
    activeRoundCount: 0,
    setActiveRoundCount: (count) => set({ activeRoundCount: count }),
  }));
