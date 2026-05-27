import { Camera, Flame, Pencil, TrendingUp, Trophy } from "lucide-react";
import { memo, useState, type FormEvent } from "react";
import {
  formatProfileBalance,
  getProfileInitial,
  getProfileLevelPercent,
  getProfileXpTarget,
} from "@/entities/profile/lib/profile";
import type { PlayerProfile } from "@/entities/profile/model/types";

type ProfileCardProps = {
  isNicknameUpdatePending: boolean;
  nicknameErrorMessage?: string;
  onAvatarClick: () => void;
  profile: PlayerProfile;
  updateNickname: (nickname: string) => Promise<PlayerProfile>;
};

type ProfileAvatarProps = {
  avatarUrl: string | null;
  email: string;
  nickname: string;
  onAvatarClick: () => void;
};

type ProfileNicknameEditorProps = {
  email: string;
  isPending: boolean;
  nickname: string;
  nicknameErrorMessage?: string;
  updateNickname: (nickname: string) => Promise<PlayerProfile>;
};

type ProfileBadgesProps = {
  dailyStreak: number;
  level: number;
};

type ProfileBalanceProps = {
  balance: string;
};

type ProfileProgressProps = {
  level: number;
  percent: number;
  xpIntoCurrentLevel: number;
  xpTarget: number;
};

const ProfileAvatar = memo(function ProfileAvatar({
  avatarUrl,
  email,
  nickname,
  onAvatarClick,
}: ProfileAvatarProps) {
  return (
    <div className="relative h-22 w-22 shrink-0">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-r from-[#00C950] to-[#009966] text-3xl font-bold text-white">
        {avatarUrl ? (
          <span
            aria-hidden="true"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${avatarUrl}")` }}
          />
        ) : (
          getProfileInitial(nickname, email)
        )}
      </div>
      <button
        aria-label="Upload avatar"
        className="absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full  bg-[#00C950] text-white transition-colors hover:bg-[#12E064]"
        onClick={onAvatarClick}
        type="button"
      >
        <Camera aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
});

const ProfileNicknameEditor = memo(function ProfileNicknameEditor({
  email,
  isPending,
  nickname: currentNickname,
  nicknameErrorMessage,
  updateNickname,
}: ProfileNicknameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(currentNickname);

  const handleNicknameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextNickname = nickname.trim();

    if (!nextNickname || nextNickname === currentNickname) {
      setNickname(currentNickname);
      setIsEditing(false);
      return;
    }

    await updateNickname(nextNickname);
    setIsEditing(false);
  };

  return (
    <div className="min-w-0 pt-1">
      {isEditing ? (
        <form className="flex flex-wrap gap-2" onSubmit={handleNicknameSubmit}>
          <input
            className="h-9 min-w-0 rounded-md border border-[#33405A] bg-[#101725] px-3 text-lg font-bold text-white outline-none focus:border-[#3F89FF]"
            disabled={isPending}
            maxLength={32}
            onChange={(event) => setNickname(event.target.value)}
            value={nickname}
          />
          <button
            className="h-9 cursor-pointer rounded-md bg-[#0F7D42] px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            Save
          </button>
          <button
            className="h-9 cursor-pointer rounded-md bg-[#2B3142] px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={() => {
              setNickname(currentNickname);
              setIsEditing(false);
            }}
            type="button"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="min-w-0 truncate text-2xl font-bold">
            {currentNickname}
          </h2>
          <button
            aria-label="Edit nickname"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#A7B0C2] transition-colors hover:bg-[#252B3A] hover:text-white"
            onClick={() => {
              setNickname(currentNickname);
              setIsEditing(true);
            }}
            type="button"
          >
            <Pencil aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      )}
      <p className="mt-1 truncate text-sm text-[#9AA3B5]">{email}</p>
      {nicknameErrorMessage ? (
        <p className="mt-2 text-sm text-[#FDA4AF]">{nicknameErrorMessage}</p>
      ) : null}
    </div>
  );
});

const ProfileBadges = memo(function ProfileBadges({
  dailyStreak,
  level,
}: ProfileBadgesProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <Trophy aria-hidden="true" className="h-4 w-4 text-[#FFD230]" />
        Level {level}
      </span>
      <span className="inline-flex items-center gap-2">
        <Flame aria-hidden="true" className="h-4 w-4 text-[#FF6900]" />
        {dailyStreak} day streak
      </span>
    </div>
  );
});

const ProfileBalance = memo(function ProfileBalance({
  balance,
}: ProfileBalanceProps) {
  return (
    <div className="md:text-right">
      <p className="text-sm text-[#9AA3B5]">Balance</p>
      <p className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-[#00E783]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C950] text-sm text-white">
          +
        </span>
        {formatProfileBalance(balance)}
      </p>
    </div>
  );
});

const ProfileProgress = memo(function ProfileProgress({
  level,
  percent,
  xpIntoCurrentLevel,
  xpTarget,
}: ProfileProgressProps) {
  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium">
          <TrendingUp aria-hidden="true" className="h-4 w-4 text-[#3F89FF]" />
          Level {level} Progress
        </span>
        <span className="shrink-0 text-[#9AA3B5]">
          {xpIntoCurrentLevel.toLocaleString("en-US")} /{" "}
          {xpTarget.toLocaleString("en-US")} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#101725]">
        <div
          className="h-full rounded-full bg-linear-to-r from-[#2E7BFF] to-[#B445FF]"
          style={{ width: `${Math.round(percent)}%` }}
        />
      </div>
    </div>
  );
});

export const ProfileCard = memo(function ProfileCard({
  isNicknameUpdatePending,
  nicknameErrorMessage,
  onAvatarClick,
  profile,
  updateNickname,
}: ProfileCardProps) {
  const percent = getProfileLevelPercent(profile.progression);
  const xpTarget = getProfileXpTarget(profile.progression);

  return (
    <article className="rounded-xl border border-[#2A2F3E] bg-[#1A1F2E] px-4 py-6 shadow-[0_16px_34px_rgba(0,0,0,0.18)] sm:px-7">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <ProfileAvatar
            avatarUrl={profile.avatarUrl}
            email={profile.email}
            nickname={profile.nickname}
            onAvatarClick={onAvatarClick}
          />

          <div className="min-w-0">
            <ProfileNicknameEditor
              email={profile.email}
              isPending={isNicknameUpdatePending}
              nickname={profile.nickname}
              nicknameErrorMessage={nicknameErrorMessage}
              updateNickname={updateNickname}
            />

            <ProfileBadges
              dailyStreak={profile.progression.dailyStreak}
              level={profile.progression.level}
            />
          </div>
        </div>

        <ProfileBalance balance={profile.balance} />
      </div>

      <ProfileProgress
        level={profile.progression.level}
        percent={percent}
        xpIntoCurrentLevel={profile.progression.xpIntoCurrentLevel}
        xpTarget={xpTarget}
      />
    </article>
  );
});
