"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { formatWholeCredits } from "@/entities/bet/lib/formatters";
import {
  claimDailyProgressionReward,
  claimMissionProgressionReward,
  getProgression,
} from "@/entities/progression/api/progressionApi";
import type {
  Progression,
  ProgressionClaimResponse,
} from "@/entities/progression/model/types";
import { queryKeys } from "@/shared/lib/queryKeys";

function createRewardToastMessage(response: ProgressionClaimResponse) {
  const credits = formatWholeCredits(response.reward.credits);
  const xp = response.reward.xp;
  const rewardLabel =
    response.reward.source === "daily"
      ? "Daily reward claimed"
      : "Mission reward claimed";
  const levelLabel =
    response.reward.levelAfter > response.reward.levelBefore
      ? `, Level ${response.reward.levelAfter} reached`
      : "";

  return `${rewardLabel}! +${credits} credits, +${xp} XP${levelLabel}`;
}

function createClaimSuccessHandler(queryClient: QueryClient) {
  return (response: ProgressionClaimResponse) => {
    queryClient.setQueryData(queryKeys.progression, response.progression);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    toast.success(createRewardToastMessage(response));
  };
}

export function useProgressionView() {
  const queryClient = useQueryClient();
  const progressionQuery = useQuery<Progression, Error>({
    queryFn: getProgression,
    queryKey: queryKeys.progression,
  });
  const handleClaimSuccess = createClaimSuccessHandler(queryClient);
  const dailyClaim = useMutation<ProgressionClaimResponse, Error>({
    mutationFn: claimDailyProgressionReward,
    onError: (error) => toast.error(error.message),
    onSuccess: handleClaimSuccess,
  });
  const missionClaim = useMutation<ProgressionClaimResponse, Error, string>({
    mutationFn: claimMissionProgressionReward,
    onError: (error) => toast.error(error.message),
    onSuccess: handleClaimSuccess,
  });
  const isAnyClaimPending = dailyClaim.isPending || missionClaim.isPending;

  return {
    claimDaily: () => dailyClaim.mutate(),
    claimMission: (id: string) => missionClaim.mutate(id),
    errorMessage: progressionQuery.error?.message,
    isAnyClaimPending,
    isDailyClaimPending: dailyClaim.isPending,
    isError: progressionQuery.isError,
    isLoading: progressionQuery.isLoading,
    isMissionClaimPending: (id: string) =>
      missionClaim.isPending && missionClaim.variables === id,
    mutationErrorMessage: dailyClaim.error?.message ?? missionClaim.error?.message,
    progression: progressionQuery.data,
  };
}
