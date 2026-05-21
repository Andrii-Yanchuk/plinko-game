import { useRef, useState } from "react";
import type { Bet, PlaceBetPayload } from "@/lib/bets-api";
import { getMinimalUnitsFromCredits } from "./utils/amount";
import type { Risk } from "./types";

type AutoProgress = {
  current: number;
  total: number;
};

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

function parsePositiveNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : null;
}

function parseNonNegativeNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function useAutoPlay({ placeBet }: UseAutoPlayParams) {
  const [progress, setProgress] = useState<AutoProgress>({
    current: 0,
    total: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const stopRequestedRef = useRef(false);

  async function start(params: AutoPlayParams) {
    const totalBets = parsePositiveNumber(params.numberOfBets);
    const stopOnProfitAmount = parseNonNegativeNumber(params.stopOnProfit);
    const stopOnLossAmount = parseNonNegativeNumber(params.stopOnLoss);

    if (!totalBets || !Number.isInteger(totalBets)) {
      throw new Error("Enter a valid number of bets");
    }

    if (stopOnProfitAmount === null || stopOnLossAmount === null) {
      throw new Error("Stop on profit and stop on loss must be 0 or more");
    }

    setIsPlaying(true);
    setIsStopping(false);
    setProgress({ current: 1, total: totalBets });
    stopRequestedRef.current = false;

    const stopOnProfitUnits = Number(
      getMinimalUnitsFromCredits(stopOnProfitAmount.toString()),
    );
    const stopOnLossUnits = Number(
      getMinimalUnitsFromCredits(stopOnLossAmount.toString()),
    );
    let sessionProfit = 0;

    try {
      for (let betIndex = 1; betIndex <= totalBets; betIndex += 1) {
        if (stopRequestedRef.current) {
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
      setIsPlaying(false);
      setIsStopping(false);
      setProgress({ current: 0, total: 0 });
      stopRequestedRef.current = false;
    }
  }

  function stop() {
    setIsStopping(true);
    stopRequestedRef.current = true;
  }

  return {
    isPlaying,
    isStopping,
    progress,
    start,
    stop,
  };
}
