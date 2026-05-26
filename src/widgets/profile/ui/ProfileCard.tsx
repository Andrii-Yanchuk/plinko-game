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
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8.5 7.5 10 5.75h4l1.5 1.75H18a2 2 0 0 1 2 2v6.75a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2h2.5Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 15.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
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
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m4.75 16.75-.75 3.25 3.25-.75 10.5-10.5-2.5-2.5-10.5 10.5ZM14.25 7.25l2.5 2.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
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
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-[#FFD230]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 4.75h8v3.5c0 2.75-1.8 5-4 5s-4-2.25-4-5v-3.5Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 7H5.25a2.25 2.25 0 0 0 2.25 3.5H8M16 7h2.75a2.25 2.25 0 0 1-2.25 3.5H16M12 13.25v3.25M8.75 20h6.5M10 16.5h4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
                Level {profile.progression.level}
              </span>
              <span className="inline-flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-[#FF6900]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21c3.25 0 6-2.35 6-5.95 0-2.35-1.15-4.25-2.65-5.65-.3 1.4-1.15 2.35-2.1 2.8.25-2.9-1.35-5.15-3.85-6.9.2 3.25-3.4 5.25-3.4 9.65C6 18.65 8.75 21 12 21Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
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
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-[#3F89FF]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m4 16 5-5 4 4 7-8M16 7h4v4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
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
