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

export type BetHistory = {
  items: Bet[];
  nextCursor: string | null;
};

export type GetBetHistoryParams = {
  cursor?: string;
  limit?: number;
  rows?: number;
};

async function readErrorMessage(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  const message = error?.message ?? error?.error ?? fallback;

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
    throw new Error(await readErrorMessage(response, "Unable to place bet"));
  }

  return response.json() as Promise<Bet>;
}

export async function getBetHistory(params: GetBetHistoryParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  if (params.rows !== undefined) {
    searchParams.set("rows", String(params.rows));
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/bets${query ? `?${query}` : ""}`, {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to load bet history"),
    );
  }

  return response.json() as Promise<BetHistory>;
}
