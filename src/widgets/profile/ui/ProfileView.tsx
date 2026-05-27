"use client";

import { FormEvent, useState } from "react";
import { formatMemberSince } from "@/entities/profile/lib/profile";
import { useProfileView } from "@/widgets/profile/model/useProfileView";
import { AvatarUploadModal } from "./AvatarUploadModal";
import { ProfileCard } from "./ProfileCard";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStatCard } from "./ProfileStatCard";

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
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState("");

  const handleNicknameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextNickname = nickname.trim();

    if (!nextNickname || !profile || nextNickname === profile.nickname) {
      setIsEditingNickname(false);
      setNickname(profile?.nickname ?? "");
      return;
    }

    await updateNickname(nextNickname);
    setIsEditingNickname(false);
  };

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
              isEditingNickname={isEditingNickname}
              isNicknameUpdatePending={isNicknameUpdatePending}
              nickname={nickname}
              nicknameErrorMessage={nicknameErrorMessage}
              onAvatarClick={() => setIsAvatarModalOpen(true)}
              onCancelNickname={() => {
                setNickname(profile.nickname);
                setIsEditingNickname(false);
              }}
              onEditNickname={() => {
                setNickname(profile.nickname);
                setIsEditingNickname(true);
              }}
              onNicknameChange={setNickname}
              onNicknameSubmit={handleNicknameSubmit}
              profile={profile}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileStatCard
                label="Total XP"
                value={profile.progression.xp.toLocaleString("en-US")}
              />
              <ProfileStatCard
                label="Member Since"
                value={formatMemberSince(currentUser?.createdAt)}
                valueClassName="text-base font-medium"
              />
            </div>
          </>
        ) : null}
      </section>

      {isAvatarModalOpen ? (
        <AvatarUploadModal
          errorMessage={avatarErrorMessage}
          isPending={isAvatarUploadPending}
          onClose={() => setIsAvatarModalOpen(false)}
          onUpload={uploadAvatar}
        />
      ) : null}
    </main>
  );
}
