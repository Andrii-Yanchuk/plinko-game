export const queryKeys = {
  betHistory: (params: { risk?: string; rows?: number }) =>
    ["betHistory", params] as const,
  currentUser: ["currentUser"] as const,
  gameConfig: ["gameConfig"] as const,
  profile: ["profile"] as const,
  progression: ["progression"] as const,
  progressionDailyClaim: ["progression", "dailyClaim"] as const,
  progressionMissionClaim: ["progression", "missionClaim"] as const,
};
