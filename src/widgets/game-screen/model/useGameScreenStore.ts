import { create } from "zustand";
import type { Bet } from "@/entities/bet/model/types";
import type { Risk } from "@/entities/game/model/types";

type GameScreenState = {
  lastBet: Bet | null;
  isRoundPlaying: boolean;
  rows: number;
  risk: Risk;
  setLastBet: (bet: Bet | null) => void;
  setRoundPlaying: (isRoundPlaying: boolean) => void;
  setRows: (rows: number) => void;
  setRisk: (risk: Risk) => void;
};

export const useGameScreenStore = create<GameScreenState>((set) => ({
  lastBet: null,
  isRoundPlaying: false,
  rows: 8,
  risk: "LOW",
  setLastBet: (lastBet) => set({ lastBet }),
  setRoundPlaying: (isRoundPlaying) => set({ isRoundPlaying }),
  setRows: (rows) => set({ rows }),
  setRisk: (risk) => set({ risk }),
}));
