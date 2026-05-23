import { create } from "zustand";
import type { Risk } from "@/entities/game/model/types";

type GameScreenState = {
  animationsEnabled: boolean;
  rows: number;
  risk: Risk;
  setAnimationsEnabled: (enabled: boolean) => void;
  setRows: (rows: number) => void;
  setRisk: (risk: Risk) => void;
  setSoundEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
};

export const useGameScreenStore = create<GameScreenState>((set) => ({
  animationsEnabled: true,
  rows: 8,
  risk: "LOW",
  setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
  setRows: (rows) => set({ rows }),
  setRisk: (risk) => set({ risk }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  soundEnabled: true,
}));
