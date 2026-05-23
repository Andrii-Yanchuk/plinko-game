export type BetControl = "1/2" | "2x" | "MAX";
export type GameMode = "Manual" | "Auto";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

export type GameConfig = {
  rows: number[];
  risks: Risk[];
  minBet: string;
  maxBet: string;
  payoutTables: Record<Risk, Record<number, number[]>>;
};
