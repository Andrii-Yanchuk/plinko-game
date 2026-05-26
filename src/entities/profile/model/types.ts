export type ProfileProgression = {
  level: number;
  xp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpIntoCurrentLevel: number;
  dailyStreak: number;
};

export type PlayerProfile = {
  balance: string;
  progression: ProfileProgression;
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
};

export type UpdateProfilePayload = {
  nickname: string;
};
