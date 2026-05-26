import type { Risk } from "@/entities/game/model/types";

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
  risk?: Risk;
  rows?: number;
};
