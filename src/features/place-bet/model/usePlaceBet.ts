import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { placeBet as placeBetRequest } from "@/entities/bet/api/betsApi";
import type { Bet, PlaceBetPayload } from "@/entities/bet/model/types";
import { getCreditsFromMinimalUnits } from "@/entities/game/lib/amount";
import type { RoundContext } from "@/entities/game/model/types";

type UsePlaceBetParams = {
  onBetAmountSettled: (amount: string) => void;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
};

export function usePlaceBet({
  onBetAmountSettled,
  onBetPlaced,
}: UsePlaceBetParams) {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: placeBetRequest,
  });

  const placeBetWithContext = useCallback(
    async (payload: PlaceBetPayload, context: RoundContext) => {
      const bet = await mutateAsync(payload);

      onBetAmountSettled(getCreditsFromMinimalUnits(bet.amount).toFixed(2));
      await onBetPlaced(bet, context);

      return bet;
    },
    [mutateAsync, onBetAmountSettled, onBetPlaced],
  );

  return {
    isPending,
    placeBet: placeBetWithContext,
  };
}
