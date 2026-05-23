import type {
  Bet,
  BetHistory,
  GetBetHistoryParams,
  PlaceBetPayload,
} from "@/entities/bet/model/types";

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
