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
