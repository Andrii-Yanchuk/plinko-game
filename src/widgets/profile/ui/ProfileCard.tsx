import { Camera, Flame, Pencil, TrendingUp, Trophy } from "lucide-react";
import type { FormEvent } from "react";
import {
  formatProfileBalance,
  getProfileInitial,
  getProfileLevelPercent,
  getProfileXpTarget,
} from "@/entities/profile/lib/profile";
import type { PlayerProfile } from "@/entities/profile/model/types";

type ProfileCardProps = {
  isEditingNickname: boolean;
  isNicknameUpdatePending: boolean;
  nickname: string;
  nicknameErrorMessage?: string;
  onAvatarClick: () => void;
  onCancelNickname: () => void;
  onEditNickname: () => void;
  onNicknameChange: (value: string) => void;
  onNicknameSubmit: (event: FormEvent<HTMLFormElement>) => void;
  profile: PlayerProfile;
};

export function ProfileCard({
  isEditingNickname,
  isNicknameUpdatePending,
  nickname,
  nicknameErrorMessage,
  onAvatarClick,
  onCancelNickname,
  onEditNickname,
  onNicknameChange,
  onNicknameSubmit,
  profile,
}: ProfileCardProps) {
  const percent = getProfileLevelPercent(profile.progression);
  const xpTarget = getProfileXpTarget(profile.progression);

  return (
    <article className="rounded-xl border border-[#2A2F3E] bg-[#1A1F2E] px-4 py-6 shadow-[0_16px_34px_rgba(0,0,0,0.18)] sm:px-7">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <div className="relative h-[88px] w-[88px] shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#00C950] text-3xl font-bold text-white">
              {profile.avatarUrl ? (
                <span
                  aria-hidden="true"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${profile.avatarUrl}")` }}
                />
              ) : (
                getProfileInitial(profile.nickname, profile.email)
              )}
            </div>
            <button
              aria-label="Upload avatar"
              className="absolute right-[-4px] bottom-[-4px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#1A1F2E] bg-[#00C950] text-white transition-colors hover:bg-[#12E064]"
              onClick={onAvatarClick}
              type="button"
            >
              <Camera aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0 pt-1">
            {isEditingNickname ? (
              <form className="flex flex-wrap gap-2" onSubmit={onNicknameSubmit}>
                <input
                  className="h-9 min-w-0 rounded-md border border-[#33405A] bg-[#101725] px-3 text-lg font-bold text-white outline-none focus:border-[#3F89FF]"
                  disabled={isNicknameUpdatePending}
                  maxLength={32}
                  onChange={(event) => onNicknameChange(event.target.value)}
                  value={nickname}
                />
                <button
                  className="h-9 rounded-md bg-[#0F7D42] px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isNicknameUpdatePending}
                  type="submit"
                >
                  Save
                </button>
                <button
                  className="h-9 rounded-md bg-[#2B3142] px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isNicknameUpdatePending}
                  onClick={onCancelNickname}
                  type="button"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 truncate text-2xl font-bold">
                  {profile.nickname}
                </h2>
                <button
                  aria-label="Edit nickname"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#A7B0C2] transition-colors hover:bg-[#252B3A] hover:text-white"
                  onClick={onEditNickname}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            )}
            <p className="mt-1 truncate text-sm text-[#9AA3B5]">
              {profile.email}
            </p>
            {nicknameErrorMessage ? (
              <p className="mt-2 text-sm text-[#FDA4AF]">
                {nicknameErrorMessage}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
              <span className="inline-flex items-center gap-2">
                <Trophy aria-hidden="true" className="h-4 w-4 text-[#FFD230]" />
                Level {profile.progression.level}
              </span>
              <span className="inline-flex items-center gap-2">
                <Flame aria-hidden="true" className="h-4 w-4 text-[#FF6900]" />
                {profile.progression.dailyStreak} day streak
              </span>
            </div>
          </div>
        </div>

        <div className="md:text-right">
          <p className="text-sm text-[#9AA3B5]">Balance</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-[#00E783]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C950] text-sm text-white">
              +
            </span>
            {formatProfileBalance(profile.balance)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium">
            <TrendingUp
              aria-hidden="true"
              className="h-4 w-4 text-[#3F89FF]"
            />
            Level {profile.progression.level} Progress
          </span>
          <span className="shrink-0 text-[#9AA3B5]">
            {profile.progression.xpIntoCurrentLevel.toLocaleString("en-US")} /{" "}
            {xpTarget.toLocaleString("en-US")} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#101725]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2E7BFF] to-[#B445FF]"
            style={{ width: `${Math.round(percent)}%` }}
          />
        </div>
      </div>
    </article>
  );
}
