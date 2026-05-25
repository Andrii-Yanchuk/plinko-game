export type ProgressionReward = {
  credits: string;
  xp: number;
};

export type DailyProgression = {
  reward: ProgressionReward;
  canClaim: boolean;
  streak: number;
  nextClaimAt: string | null;
};

export type ProgressionMission = {
  creditReward: string;
  id: string;
  key: string;
  type: unknown;
  title: string;
  description: string;
  periodKey: string;
  target: number;
  progress: number;
  status: unknown;
  xpReward: number;
  claimable: boolean;
  completedAt: string | null;
  claimedAt: string | null;
};

export type ProgressionMissions = {
  daily: ProgressionMission[];
  starter: ProgressionMission[];
};

export type Progression = {
  daily: DailyProgression;
  missions: ProgressionMissions;
  level: number;
  xp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpIntoCurrentLevel: number;
};

export type ProgressionClaimReward = {
  source: string;
  missionId: string | null;
  missionKey: string | null;
  credits: string;
  balanceAfter: string;
  sourceKey: string;
  periodKey: string;
  xp: number;
  levelBefore: number;
  levelAfter: number;
};

export type ProgressionClaimResponse = {
  reward: ProgressionClaimReward;
  progression: Progression;
};
