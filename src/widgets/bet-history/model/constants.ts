import type { Risk } from "@/entities/game/model/types";

export const betHistoryPageSize = 20;
export const minimalUnitsPerCredit = 1_000_000;
export const riskOptions: Array<Risk | "ALL"> = [
  "ALL",
  "LOW",
  "MEDIUM",
  "HIGH",
];
export const rowOptions = [
  "ALL",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];
