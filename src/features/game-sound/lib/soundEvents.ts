import type { Bet } from "@/entities/bet/model/types";

export type ResultSound = "win" | "loss";

export function getResultSound(bet: Bet): ResultSound | null {
  const amount = Number(bet.amount);
  const payout = Number(bet.payout);

  if (!Number.isFinite(amount) || !Number.isFinite(payout)) {
    return null;
  }

  if (payout > amount) {
    return "win";
  }

  if (payout < amount) {
    return "loss";
  }

  return null;
}

export function getCompletedImpactIndex(
  pathLength: number,
  elapsedMs: number,
  stepDurationMs: number,
) {
  if (pathLength < 2 || elapsedMs < stepDurationMs) {
    return null;
  }

  return Math.min(Math.floor(elapsedMs / stepDurationMs), pathLength - 1);
}
