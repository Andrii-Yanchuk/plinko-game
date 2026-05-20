import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CurrentUser } from "@/lib/auth-api";
import { placeBet, type Bet } from "@/lib/bets-api";
import { queryKeys } from "@/lib/query-keys";

type UsePlaceBetParams = {
  onBetAmountSettled: (amount: string) => void;
  onBetPlaced: (bet: Bet) => void;
};

export function usePlaceBet({
  onBetAmountSettled,
  onBetPlaced,
}: UsePlaceBetParams) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: placeBet,
    onSuccess: (bet) => {
      queryClient.setQueryData<CurrentUser>(
        queryKeys.currentUser,
        (currentUser) =>
          currentUser
            ? { ...currentUser, balance: bet.balanceAfter }
            : currentUser,
      );
      onBetAmountSettled((Number(bet.amount) / 1_000_000).toFixed(2));
      onBetPlaced(bet);
    },
  });

  return {
    isPending: mutation.isPending,
    placeBet: mutation.mutateAsync,
  };
}
