import type {
  Progression,
  ProgressionMission,
} from "@/entities/progression/model/types";

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function getLevelPercent(progression: Progression) {
  const levelXpRange =
    progression.xpForNextLevel - progression.xpForCurrentLevel;

  if (levelXpRange <= 0) {
    return progression.xpIntoCurrentLevel > 0 ? 100 : 0;
  }

  return clampPercent((progression.xpIntoCurrentLevel / levelXpRange) * 100);
}

export function getMissionPercent(mission: ProgressionMission) {
  if (mission.target <= 0) {
    return mission.progress > 0 ? 100 : 0;
  }

  return clampPercent((mission.progress / mission.target) * 100);
}

export function getMissionTimeLabel(mission: ProgressionMission) {
  if (mission.claimedAt) {
    return "Claimed";
  }

  if (mission.completedAt) {
    return "Completed";
  }

  return mission.periodKey;
}

export function getDailyMissionTimeLeftLabel(
  mission: ProgressionMission,
  now = Date.now(),
) {
  if (mission.claimedAt) {
    return "Claimed";
  }

  if (mission.completedAt) {
    return "Completed";
  }

  const endTime = getDailyPeriodEndTime(mission.periodKey, now);
  const remainingMs = Math.max(0, endTime - now);

  if (remainingMs <= 0) {
    return "Expired";
  }

  const totalMinutes = Math.ceil(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m left`;
  }

  if (minutes === 0) {
    return `${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

function getDailyPeriodEndTime(periodKey: string, now: number) {
  const periodMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(periodKey);

  if (periodMatch) {
    const [, year, month, day] = periodMatch;

    return new Date(Number(year), Number(month) - 1, Number(day) + 1).getTime();
  }

  const today = new Date(now);

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  ).getTime();
}
