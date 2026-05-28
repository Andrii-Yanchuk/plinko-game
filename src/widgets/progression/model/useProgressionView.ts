"use client";

import { useCallback } from "react";
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

export function useProgressionView() {
  const queryClient = useQueryClient();
  const progressionQuery = useQuery<Progression, Error>({
    queryFn: getProgression,
    queryKey: queryKeys.progression,
  });
  const handleClaimSuccess = useCallback((response: ProgressionClaimResponse) => {
    queryClient.setQueryData(queryKeys.progression, response.progression);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    toast.success(createRewardToastMessage(response));
  }, [queryClient]);
  const {
    error: dailyClaimError,
    mutate: claimDaily,
  } = useMutation<ProgressionClaimResponse, Error>({
    mutationKey: queryKeys.progressionDailyClaim,
    mutationFn: claimDailyProgressionReward,
    onError: (error) => toast.error(error.message),
    onSuccess: handleClaimSuccess,
  });
  const {
    error: missionClaimError,
    isPending: isMissionClaimPending,
    mutate: claimMission,
    variables: pendingMissionId,
  } = useMutation<ProgressionClaimResponse, Error, string>({
    mutationKey: queryKeys.progressionMissionClaim,
    mutationFn: claimMissionProgressionReward,
    onError: (error) => toast.error(error.message),
    onSuccess: handleClaimSuccess,
  });

  return {
    claimDaily,
    claimMission,
    errorMessage: progressionQuery.error?.message,
    isError: progressionQuery.isError,
    isLoading: progressionQuery.isLoading,
    mutationErrorMessage: dailyClaimError?.message ?? missionClaimError?.message,
    pendingMissionId: isMissionClaimPending ? pendingMissionId : null,
    progression: progressionQuery.data,
  };
}
