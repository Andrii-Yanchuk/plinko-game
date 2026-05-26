import { formatCredits } from "@/entities/bet/lib/formatters";
import type { ProfileProgression } from "@/entities/profile/model/types";

export function getProfileInitial(nickname: string, email: string) {
  const value = nickname.trim() || email.trim();

  return value.charAt(0).toUpperCase() || "P";
}

export function getProfileLevelPercent(progression: ProfileProgression) {
  const target =
    progression.xpForNextLevel - progression.xpForCurrentLevel;

  if (target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (progression.xpIntoCurrentLevel / target) * 100),
  );
}

export function getProfileXpTarget(progression: ProfileProgression) {
  return Math.max(
    0,
    progression.xpForNextLevel - progression.xpForCurrentLevel,
  );
}

export function formatProfileBalance(balance: string) {
  return formatCredits(balance);
}

export function formatMemberSince(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}
