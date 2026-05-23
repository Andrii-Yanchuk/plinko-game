import { useMutation } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import { placeBet } from "@/entities/bet/api/betsApi";

type UsePlaceBetParams = {
  onBetAmountSettled: (amount: string) => void;
  onBetPlaced: (bet: Bet) => Promise<void> | void;
};

export function usePlaceBet({
  onBetAmountSettled,
  onBetPlaced,
}: UsePlaceBetParams) {
  const mutation = useMutation({
    mutationFn: placeBet,
    onSuccess: async (bet) => {
      onBetAmountSettled((Number(bet.amount) / 1_000_000).toFixed(2));
      await onBetPlaced(bet);
    },
  });

  return {
    isPending: mutation.isPending,
    placeBet: mutation.mutateAsync,
  };
}
