import type { Bet } from "@/lib/bets-api";
import type { GameConfig } from "@/lib/game-api";
import type { Risk } from "../types";

export function getBoardRows(config: GameConfig | undefined, rows: number) {
  const availableRows = config?.rows.length ? config.rows : [rows];

  return Math.max(...availableRows);
}

export function getBetAnimationKey(
  bet: Bet | null,
  rows: number,
  risk: Risk,
  activeBucketIndex: number | null,
) {
  if (!bet || activeBucketIndex === null) {
    return "";
  }

  return `${bet.betId}:${JSON.stringify(bet.path)}:${rows}:${risk}`;
}
