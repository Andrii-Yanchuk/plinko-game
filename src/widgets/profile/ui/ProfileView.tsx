"use client";

import { useCallback, useState } from "react";
import { useProfileView } from "@/widgets/profile/model/useProfileView";
import { AvatarUploadModal } from "./AvatarUploadModal";
import { ProfileCard } from "./ProfileCard";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";

export function ProfileView() {
  const {
    avatarErrorMessage,
    currentUser,
    isAvatarUploadPending,
    isError,
    isLoading,
    isNicknameUpdatePending,
    nicknameErrorMessage,
    profile,
    profileErrorMessage,
    updateNickname,
    uploadAvatar,
  } = useProfileView();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const handleAvatarModalOpen = useCallback(() => {
    setIsAvatarModalOpen(true);
  }, []);
  const handleAvatarModalClose = useCallback(() => {
    setIsAvatarModalOpen(false);
  }, []);

  return (
    <main className="min-h-screen bg-[#101725] pb-20 text-[#F4F7FB]">
      <ProfileHeader />

      <section className="container flex flex-col gap-4 px-4 py-7">
        {isError && profileErrorMessage ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {profileErrorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            Loading profile...
          </div>
        ) : profile ? (
          <>
            <ProfileCard
              isNicknameUpdatePending={isNicknameUpdatePending}
              nicknameErrorMessage={nicknameErrorMessage}
              onAvatarClick={handleAvatarModalOpen}
              profile={profile}
              updateNickname={updateNickname}
            />

            <ProfileStats
              createdAt={currentUser?.createdAt}
              xp={profile.progression.xp}
            />
          </>
        ) : null}
      </section>

      {isAvatarModalOpen ? (
        <AvatarUploadModal
          errorMessage={avatarErrorMessage}
          isPending={isAvatarUploadPending}
          onClose={handleAvatarModalClose}
          onUpload={uploadAvatar}
        />
      ) : null}
    </main>
  );
}
