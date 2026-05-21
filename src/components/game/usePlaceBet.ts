import { useMutation } from "@tanstack/react-query";
import { placeBet, type Bet } from "@/lib/bets-api";

type UsePlaceBetParams = {
  onBetAmountSettled: (amount: string) => void;
  onBetPlaced: (bet: Bet) => void;
};

export function usePlaceBet({
  onBetAmountSettled,
  onBetPlaced,
}: UsePlaceBetParams) {
  const mutation = useMutation({
    mutationFn: placeBet,
    onSuccess: (bet) => {
      onBetAmountSettled((Number(bet.amount) / 1_000_000).toFixed(2));
      onBetPlaced(bet);
    },
  });

  return {
    isPending: mutation.isPending,
    placeBet: mutation.mutateAsync,
  };
}
