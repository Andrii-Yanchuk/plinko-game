import { create } from "zustand";
import type { Risk } from "@/entities/game/model/types";

type HistoryRisk = Risk | "ALL";

type BetHistoryFiltersState = {
  risk: HistoryRisk;
  rows: string;
  setRisk: (risk: HistoryRisk) => void;
  setRows: (rows: string) => void;
};

export const useBetHistoryFiltersStore = create<BetHistoryFiltersState>(
  (set) => ({
    risk: "ALL",
    rows: "ALL",
    setRisk: (risk) => set({ risk }),
    setRows: (rows) => set({ rows }),
  }),
);
