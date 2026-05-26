"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

function createClaimSuccessHandler(queryClient: QueryClient) {
  return (response: ProgressionClaimResponse) => {
    queryClient.setQueryData(queryKeys.progression, response.progression);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
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
    onSuccess: handleClaimSuccess,
  });
  const missionClaim = useMutation<ProgressionClaimResponse, Error, string>({
    mutationFn: claimMissionProgressionReward,
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
