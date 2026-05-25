import type { Bet } from "@/entities/bet/model/types";
import type { GameMode, Risk, RoundContext } from "@/entities/game/model/types";
import { getRoundResultPauseMs } from "@/widgets/game-screen/lib/roundTiming";

export const manualRoundLimit = 10;

export type ActiveRound = {
  id: string;
  bet: Bet;
  mode: GameMode;
  rows: number;
  risk: Risk;
  resultPauseMs: number;
  isResultVisible: boolean;
};

type CreateActiveRoundParams = {
  animationsEnabled: boolean;
  bet: Bet;
  context: RoundContext;
};

export function createActiveRound({
  animationsEnabled,
  bet,
  context,
}: CreateActiveRoundParams): ActiveRound {
  return {
    id: bet.betId,
    bet,
    mode: context.mode,
    rows: bet.rows,
    risk: bet.risk,
    resultPauseMs: getRoundResultPauseMs({
      animationsEnabled,
      mode: context.mode,
    }),
    isResultVisible: false,
  };
}
