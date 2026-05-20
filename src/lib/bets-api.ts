import type { Risk } from "@/components/game/types";

export type PlaceBetPayload = {
  amount: string;
  rows: number;
  risk: Risk;
};

export type BetSeed = {
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
};

export type Bet = {
  seed: BetSeed;
  id: string;
  betId: string;
  amount: string;
  rows: number;
  risk: Risk;
  path: string;
  bucketIndex: number;
  multiplier: string;
  payout: string;
  balanceAfter: string;
  createdAt: string;
};

async function readErrorMessage(response: Response) {
  const error = await response.json().catch(() => null);
  const message = error?.message ?? error?.error ?? "Unable to place bet";

  return Array.isArray(message) ? message.join(", ") : message;
}

export async function placeBet(payload: PlaceBetPayload) {
  const response = await fetch("/api/bets", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<Bet>;
}
