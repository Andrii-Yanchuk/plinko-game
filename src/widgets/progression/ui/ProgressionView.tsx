"use client";

import Image from "next/image";
import Link from "next/link";
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
  ProgressionMission,
} from "@/entities/progression/model/types";
import { formatCredits } from "@/entities/bet/lib/formatters";
import { queryKeys } from "@/shared/lib/queryKeys";

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function getLevelPercent(progression: Progression) {
  const levelXpRange =
    progression.xpForNextLevel - progression.xpForCurrentLevel;

  if (levelXpRange <= 0) {
    return progression.xpIntoCurrentLevel > 0 ? 100 : 0;
  }

  return clampPercent((progression.xpIntoCurrentLevel / levelXpRange) * 100);
}

function getMissionPercent(mission: ProgressionMission) {
  if (mission.target <= 0) {
    return mission.progress > 0 ? 100 : 0;
  }

  return clampPercent((mission.progress / mission.target) * 100);
}

function getTimeLabel(mission: ProgressionMission) {
  if (mission.claimedAt) {
    return "Claimed";
  }

  if (mission.completedAt) {
    return "Completed";
  }

  return mission.periodKey;
}

function createClaimSuccessHandler(queryClient: QueryClient) {
  return (response: ProgressionClaimResponse) => {
    queryClient.setQueryData(queryKeys.progression, response.progression);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };
}

export function ProgressionView() {
  const queryClient = useQueryClient();
  const {
    data: progression,
    error,
    isError,
    isLoading,
  } = useQuery<Progression, Error>({
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
  const mutationError = dailyClaim.error ?? missionClaim.error;

  return (
    <main className="min-h-screen bg-[#101725] pb-16 text-[#F4F7FB]">
      <header className="flex h-16 items-center gap-4 border-b border-[#222A3B]/80 px-4">
        <Link
          className="flex items-center gap-1 rounded-[8px] border border-[#2A2F3E] bg-[#1A1F2E] px-4 py-2 text-[16px] text-[#D1D5DC] transition-colors hover:bg-[#222A3D]"
          href="/game"
        >
          <Image src="/back-icon.svg" alt="Back icon" width={16} height={16} />
          Back to Game
        </Link>
        <h1 className="text-[24px] font-bold">Progression</h1>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        {isError ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {error.message}
          </p>
        ) : null}

        {mutationError ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {mutationError.message}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            Loading progression...
          </div>
        ) : progression ? (
          <>
            <LevelCard progression={progression} />
            <DailyRewardCard
              daily={progression.daily}
              isPending={dailyClaim.isPending}
              onClaim={() => dailyClaim.mutate()}
            />
            <MissionSection
              missions={progression.missions.daily}
              missionClaim={missionClaim}
              title="Daily Missions"
            />
            <MissionSection
              missions={progression.missions.starter}
              missionClaim={missionClaim}
              title="Starter Missions"
            />
          </>
        ) : null}
      </section>
    </main>
  );
}

function LevelCard({ progression }: { progression: Progression }) {
  const percent = getLevelPercent(progression);
  const levelXpRange =
    progression.xpForNextLevel - progression.xpForCurrentLevel;
  const xpTarget = Math.max(0, levelXpRange);

  return (
    <article className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2E7BFF]/15 text-[#7FB2FF]">
            <LevelIcon />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#8D96A8]">
              Current Level
            </p>
            <h2 className="text-2xl font-bold">Level {progression.level}</h2>
          </div>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#8D96A8]">
          {progression.xp.toLocaleString("en-US")} XP
        </p>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-[#8D96A8]">
          <span>Progress</span>
          <span>
            {progression.xpIntoCurrentLevel.toLocaleString("en-US")} /{" "}
            {xpTarget.toLocaleString("en-US")} XP
          </span>
        </div>
        <ProgressBar
          percent={percent}
          trackClassName="bg-[#101725]"
          valueClassName="bg-[#2E7BFF]"
        />
      </div>
    </article>
  );
}

function DailyRewardCard({
  daily,
  isPending,
  onClaim,
}: {
  daily: Progression["daily"];
  isPending: boolean;
  onClaim: () => void;
}) {
  const label = isPending
    ? "Claiming..."
    : daily.canClaim
      ? "Claim Now"
      : "Claimed";

  return (
    <article className="rounded-lg border border-[#F59E0B]/40 bg-[#2A1B10] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B]/20 text-[#FDBA74]">
            <GiftIcon />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#FDBA74]">
              Daily Reward
            </p>
            <h2 className="text-xl font-bold">Streak {daily.streak}</h2>
          </div>
        </div>
        <button
          className="rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#101725] transition-colors hover:bg-[#FBBF24] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!daily.canClaim || isPending}
          onClick={onClaim}
          type="button"
        >
          {label}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <RewardPill icon={<CoinIcon />} label="Credits">
          {formatCredits(daily.reward.credits)}
        </RewardPill>
        <RewardPill icon={<BoltIcon />} label="XP">
          {daily.reward.xp.toLocaleString("en-US")}
        </RewardPill>
      </div>
    </article>
  );
}

function MissionSection({
  missionClaim,
  missions,
  title,
}: {
  missionClaim: ReturnType<
    typeof useMutation<ProgressionClaimResponse, Error, string>
  >;
  missions: ProgressionMission[];
  title: string;
}) {
  if (missions.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <TargetIcon />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            missionClaim={missionClaim}
          />
        ))}
      </div>
    </section>
  );
}

function MissionCard({
  mission,
  missionClaim,
}: {
  mission: ProgressionMission;
  missionClaim: ReturnType<
    typeof useMutation<ProgressionClaimResponse, Error, string>
  >;
}) {
  const percent = getMissionPercent(mission);
  const isClaiming =
    missionClaim.isPending && missionClaim.variables === mission.id;
  const shouldShowClaimButton = mission.claimable || mission.claimedAt;
  const isButtonDisabled = !mission.claimable || isClaiming;
  const claimLabel = isClaiming
    ? "Claiming..."
    : mission.claimedAt
      ? "Claimed"
      : "Claim";

  return (
    <article className="rounded-lg border border-[#2E7BFF]/35 bg-[#142A4A] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold">{mission.title}</h3>
          <p className="mt-1 text-sm leading-5 text-[#B8C1D1]">
            {mission.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-md bg-[#101725]/70 px-2 py-1 text-xs font-medium text-[#8D96A8]">
          <ClockIcon />
          {getTimeLabel(mission)}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-[#B8C1D1]">
          <span>
            {mission.progress.toLocaleString("en-US")} /{" "}
            {mission.target.toLocaleString("en-US")}
          </span>
          <span>{Math.round(percent)}%</span>
        </div>
        <ProgressBar
          percent={percent}
          trackClassName="bg-[#101725]/70"
          valueClassName="bg-[#60A5FA]"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <RewardPill icon={<CoinIcon />} label="Credits">
            {formatCredits(mission.creditReward)}
          </RewardPill>
          <RewardPill icon={<BoltIcon />} label="XP">
            {mission.xpReward.toLocaleString("en-US")}
          </RewardPill>
        </div>
        {shouldShowClaimButton ? (
          <button
            className="rounded-lg bg-[#2E7BFF] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#60A5FA] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isButtonDisabled}
            onClick={() => missionClaim.mutate(mission.id)}
            type="button"
          >
            {claimLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function RewardPill({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-[#101725]/70 px-3 py-2 text-sm">
      <span className="text-[#8D96A8]">{icon}</span>
      <span className="text-[#8D96A8]">{label}</span>
      <span className="font-bold text-[#F4F7FB]">{children}</span>
    </div>
  );
}

function ProgressBar({
  percent,
  trackClassName,
  valueClassName,
}: {
  percent: number;
  trackClassName: string;
  valueClassName: string;
}) {
  return (
    <div className={`h-2 overflow-hidden rounded-full ${trackClassName}`}>
      <div
        className={`h-full rounded-full ${valueClassName}`}
        style={{ width: `${clampPercent(percent)}%` }}
      />
    </div>
  );
}

function LevelIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3L14.8 8.7L21 9.6L16.5 14L17.6 20.2L12 17.3L6.4 20.2L7.5 14L3 9.6L9.2 8.7L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 11H20V20H4V11Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M3 7H21V11H3V7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V20" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7C10.5 4.5 8.2 3.8 7.2 5C6.2 6.2 7.1 7 9 7H12Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 7C13.5 4.5 15.8 3.8 16.8 5C17.8 6.2 16.9 7 15 7H12Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[#60A5FA]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M13 2L4 14H11L10 22L20 9H13L13 2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth="2" />
      <path d="M12 9V15" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
