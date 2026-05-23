import { create } from "zustand";
import type { GameMode } from "@/entities/game/model/types";

type GameSidebarState = {
  selectedMode: GameMode;
  betAmount: string;
  autoBetCount: string;
  stopOnProfit: string;
  stopOnLoss: string;
  error: string;
  setSelectedMode: (selectedMode: GameMode) => void;
  setBetAmount: (betAmount: string) => void;
  setAutoBetCount: (autoBetCount: string) => void;
  setStopOnProfit: (stopOnProfit: string) => void;
  setStopOnLoss: (stopOnLoss: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
};

export const useGameSidebarStore = create<GameSidebarState>((set) => ({
  selectedMode: "Manual",
  betAmount: "1.00",
  autoBetCount: "10",
  stopOnProfit: "0.00",
  stopOnLoss: "0.00",
  error: "",
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setBetAmount: (betAmount) => set({ betAmount }),
  setAutoBetCount: (autoBetCount) => set({ autoBetCount }),
  setStopOnProfit: (stopOnProfit) => set({ stopOnProfit }),
  setStopOnLoss: (stopOnLoss) => set({ stopOnLoss }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: "" }),
}));
