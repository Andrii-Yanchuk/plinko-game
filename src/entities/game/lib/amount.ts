import type { BetControl } from "@/entities/game/model/types";

export const minimalUnitsPerCredit = 1_000_000;

export function getCreditsFromMinimalUnits(amount: string) {
  return Number(amount) / minimalUnitsPerCredit;
}

export function getMinimalUnitsFromCredits(amount: string) {
  return Math.round(Number(amount) * minimalUnitsPerCredit).toString();
}

export function getNextBetAmount(
  betAmount: string,
  control: BetControl,
  minBetAmount: number,
  maxBetAmount: number,
): string | null {
  if (control === "MAX") {
    return maxBetAmount.toFixed(2);
  }

  const multiplier = control === "1/2" ? 0.5 : 2;
  const nextAmount = Math.min(
    Math.max(Number(betAmount) * multiplier, minBetAmount),
    maxBetAmount,
  );

  if (Number.isNaN(nextAmount)) {
    return null;
  }

  return nextAmount.toFixed(2);
}
