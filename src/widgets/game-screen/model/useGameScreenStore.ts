import { create } from "zustand";
import type { Risk } from "@/entities/game/model/types";

type GameScreenState = {
  rows: number;
  risk: Risk;
  setRows: (rows: number) => void;
  setRisk: (risk: Risk) => void;
};

export const useGameScreenStore = create<GameScreenState>((set) => ({
  rows: 8,
  risk: "LOW",
  setRows: (rows) => set({ rows }),
  setRisk: (risk) => set({ risk }),
}));
