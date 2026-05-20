export const queryKeys = {
  betHistory: (params: { rows?: number }) => ["betHistory", params] as const,
  currentUser: ["currentUser"] as const,
  gameConfig: ["gameConfig"] as const,
};
