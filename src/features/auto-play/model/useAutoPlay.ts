import type { Bet, PlaceBetPayload } from "@/entities/bet/model/types";
import { getMinimalUnitsFromCredits } from "@/entities/game/lib/amount";
import type { Risk } from "@/entities/game/model/types";
import {
  parseNonNegativeNumber,
  parsePositiveInteger,
} from "@/features/auto-play/lib/validation";
import { useAutoPlayStore } from "@/features/auto-play/model/useAutoPlayStore";

type AutoPlayParams = {
  amount: string;
  numberOfBets: string;
  rows: number;
  risk: Risk;
  stopOnLoss: string;
  stopOnProfit: string;
};

type UseAutoPlayParams = {
  placeBet: (payload: PlaceBetPayload) => Promise<Bet>;
};

export function useAutoPlay({ placeBet }: UseAutoPlayParams) {
  const progress = useAutoPlayStore((state) => state.progress);
  const isPlaying = useAutoPlayStore((state) => state.isPlaying);
  const isStopping = useAutoPlayStore((state) => state.isStopping);
  const setProgress = useAutoPlayStore((state) => state.setProgress);
  const setPlaying = useAutoPlayStore((state) => state.setPlaying);
  const setStopping = useAutoPlayStore((state) => state.setStopping);
  const requestStop = useAutoPlayStore((state) => state.requestStop);
  const clearStopRequest = useAutoPlayStore((state) => state.clearStopRequest);
  const reset = useAutoPlayStore((state) => state.reset);

  async function start(params: AutoPlayParams) {
    const totalBets = parsePositiveInteger(params.numberOfBets);
    const stopOnProfitAmount = parseNonNegativeNumber(params.stopOnProfit);
    const stopOnLossAmount = parseNonNegativeNumber(params.stopOnLoss);

    if (!totalBets) {
      throw new Error("Enter a valid number of bets");
    }

    if (stopOnProfitAmount === null || stopOnLossAmount === null) {
      throw new Error("Stop on profit and stop on loss must be 0 or more");
    }

    setPlaying(true);
    setStopping(false);
    setProgress({ current: 1, total: totalBets });
    clearStopRequest();

    const stopOnProfitUnits = Number(
      getMinimalUnitsFromCredits(stopOnProfitAmount.toString()),
    );
    const stopOnLossUnits = Number(
      getMinimalUnitsFromCredits(stopOnLossAmount.toString()),
    );
    let sessionProfit = 0;

    try {
      for (let betIndex = 1; betIndex <= totalBets; betIndex += 1) {
        if (useAutoPlayStore.getState().stopRequested) {
          break;
        }

        setProgress({ current: betIndex, total: totalBets });

        const bet = await placeBet({
          amount: params.amount,
          rows: params.rows,
          risk: params.risk,
        });

        sessionProfit += Number(bet.payout) - Number(bet.amount);

        const reachedProfit =
          stopOnProfitUnits > 0 && sessionProfit >= stopOnProfitUnits;
        const reachedLoss =
          stopOnLossUnits > 0 && sessionProfit <= -stopOnLossUnits;

        if (reachedProfit || reachedLoss) {
          break;
        }
      }
    } finally {
      reset();
      clearStopRequest();
    }
  }

  function stop() {
    setStopping(true);
    requestStop();
  }

  return {
    isPlaying,
    isStopping,
    progress,
    start,
    stop,
  };
}
