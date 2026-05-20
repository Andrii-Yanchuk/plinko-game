import type { Risk } from "@/components/game/types";

export type GameConfig = {
  rows: number[];
  risks: Risk[];
  minBet: string;
  maxBet: string;
  payoutTables: Record<Risk, Record<number, number[]>>;
};

export async function getGameConfig() {
  const response = await fetch("/api/game/config", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.message ?? error?.error ?? "Unable to load game config";

    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return response.json() as Promise<GameConfig>;
}
