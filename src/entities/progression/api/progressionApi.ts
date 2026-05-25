import type {
  Progression,
  ProgressionClaimResponse,
} from "@/entities/progression/model/types";

async function readErrorMessage(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  const message = error?.message ?? error?.error ?? fallback;

  return Array.isArray(message) ? message.join(", ") : message;
}

export async function getProgression() {
  const response = await fetch("/api/progression/me", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to load progression"),
    );
  }

  return response.json() as Promise<Progression>;
}

export async function claimDailyProgressionReward() {
  const response = await fetch("/api/progression/daily/claim", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to claim daily reward"),
    );
  }

  return response.json() as Promise<ProgressionClaimResponse>;
}

export async function claimMissionProgressionReward(id: string) {
  const response = await fetch(
    `/api/progression/missions/${encodeURIComponent(id)}/claim`,
    {
      method: "POST",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to claim mission reward"),
    );
  }

  return response.json() as Promise<ProgressionClaimResponse>;
}
