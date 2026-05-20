import type { GameConfig } from "@/lib/game-api";
import {
  getCreditsFromMinimalUnits,
  getMinimalUnitsFromCredits,
} from "./utils/amount";
import { getRowsProgress } from "./utils/rows";
import type { Risk } from "./types";

const fallbackRows = [8, 9, 10, 11, 12, 13, 14, 15, 16];
const fallbackRisks: Risk[] = ["LOW", "MEDIUM", "HIGH"];

export function useGameSidebarConfig(config: GameConfig | undefined, rows: number) {
  const availableRows = config?.rows ?? fallbackRows;
  const availableRisks = config?.risks ?? fallbackRisks;
  const minRows = Math.min(...availableRows);
  const maxRows = Math.max(...availableRows);
  const minBetAmount = config ? getCreditsFromMinimalUnits(config.minBet) : 1;
  const maxBetAmount = config
    ? getCreditsFromMinimalUnits(config.maxBet)
    : 1_000_000;

  function getValidatedBetAmount(value: string) {
    const amount = Number(value);

    if (
      !Number.isFinite(amount) ||
      amount < minBetAmount ||
      amount > maxBetAmount
    ) {
      return null;
    }

    return getMinimalUnitsFromCredits(value);
  }

  return {
    availableRisks,
    maxBetAmount,
    maxRows,
    minBetAmount,
    minRows,
    rowsProgress: getRowsProgress(rows, minRows, maxRows),
    validationMessage: `Enter a bet amount between ${minBetAmount.toFixed(2)} and ${maxBetAmount.toFixed(2)}`,
    getValidatedBetAmount,
  };
}
