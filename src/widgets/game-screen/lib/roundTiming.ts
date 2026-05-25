import type { GameMode } from "@/entities/game/model/types";

export const defaultRoundResultPauseMs = 1000;
export const autoNoAnimationRoundResultPauseMs = 500;

type RoundTimingParams = {
  animationsEnabled: boolean;
  mode: GameMode;
};

export function getRoundResultPauseMs({
  animationsEnabled,
  mode,
}: RoundTimingParams) {
  if (mode === "Auto" && !animationsEnabled) {
    return autoNoAnimationRoundResultPauseMs;
  }

  return defaultRoundResultPauseMs;
}
