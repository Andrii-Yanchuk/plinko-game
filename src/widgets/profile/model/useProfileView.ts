"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProfile,
  updateProfile,
  uploadProfileAvatar,
} from "@/entities/profile/api/profileApi";
import type { PlayerProfile } from "@/entities/profile/model/types";
import { getCurrentUser } from "@/entities/user/api/userApi";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useProfileView() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery<PlayerProfile, Error>({
    queryFn: getProfile,
    queryKey: queryKeys.profile,
  });
  const currentUserQuery = useQuery({
    queryFn: getCurrentUser,
    queryKey: queryKeys.currentUser,
  });

  const handleProfileSuccess = (profile: PlayerProfile) => {
    queryClient.setQueryData(queryKeys.profile, profile);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };

  const nicknameMutation = useMutation<PlayerProfile, Error, string>({
    mutationFn: (nickname) => updateProfile({ nickname }),
    onError: (error) => toast.error(error.message),
    onSuccess: (profile) => {
      handleProfileSuccess(profile);
      toast.success("Nickname updated");
    },
  });
  const avatarMutation = useMutation<PlayerProfile, Error, File>({
    mutationFn: uploadProfileAvatar,
    onError: (error) => toast.error(error.message),
    onSuccess: (profile) => {
      handleProfileSuccess(profile);
      toast.success("Profile photo updated");
    },
  });

  return {
    avatarErrorMessage: avatarMutation.error?.message,
    currentUser: currentUserQuery.data,
    isAvatarUploadPending: avatarMutation.isPending,
    isError: profileQuery.isError,
    isLoading: profileQuery.isLoading,
    isNicknameUpdatePending: nicknameMutation.isPending,
    nicknameErrorMessage: nicknameMutation.error?.message,
    profile: profileQuery.data,
    profileErrorMessage: profileQuery.error?.message,
    updateNickname: (nickname: string) => nicknameMutation.mutateAsync(nickname),
    uploadAvatar: (image: File) => avatarMutation.mutateAsync(image),
  };
}
