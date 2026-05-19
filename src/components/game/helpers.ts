import { maxBetAmount, maxRows, minRows } from "./constants";
import type { BetControl } from "./types";

export function isBlockedBetAmountKey(key: string) {
  return ["e", "E", "+", "-"].includes(key);
}

export function getRowsProgress(rows: number) {
  return ((rows - minRows) / (maxRows - minRows)) * 100;
}

export function getNextBetAmount(
  betAmount: string,
  control: BetControl,
): string | null {
  if (control === "MAX") {
    return maxBetAmount.toFixed(2);
  }

  const multiplier = control === "1/2" ? 0.5 : 2;
  const nextAmount = Number(betAmount) * multiplier;

  if (Number.isNaN(nextAmount)) {
    return null;
  }

  return nextAmount.toFixed(2);
}
