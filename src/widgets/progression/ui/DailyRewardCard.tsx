import { Clock, Gift, Zap } from "lucide-react";
import Image from "next/image";
import { useIsMutating } from "@tanstack/react-query";
import { memo } from "react";
import type { Progression } from "@/entities/progression/model/types";
import { formatWholeCredits } from "@/entities/bet/lib/formatters";
import { queryKeys } from "@/shared/lib/queryKeys";

type DailyRewardCardProps = {
  daily: Progression["daily"];
  onClaim: () => void;
};

type DailyRewardButtonProps = {
  canClaim: boolean;
  nextClaimAt: string | null;
  onClaim: () => void;
};

const DailyRewardButton = memo(function DailyRewardButton({
  canClaim,
  nextClaimAt,
  onClaim,
}: DailyRewardButtonProps) {
  const dailyClaimCount = useIsMutating({
    mutationKey: queryKeys.progressionDailyClaim,
  });
  const isPending = dailyClaimCount > 0;
  const isClaimed = !canClaim;
  const label = isPending
    ? "Claiming..."
    : canClaim
      ? "Claim Now"
      : getNextDailyClaimLabel(nextClaimAt);

  return (
    <button
      className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors disabled:cursor-not-allowed ${
        canClaim
          ? "bg-[linear-gradient(90deg,#FF6900_0%,#FB2C36_100%)] text-white hover:opacity-90 disabled:opacity-60"
          : "bg-[#2A2F3E] text-[#A7B0C2]"
      }`}
      disabled={!canClaim || isPending}
      onClick={onClaim}
      type="button"
    >
      {isClaimed ? <Clock aria-hidden="true" className="h-4 w-4" /> : null}
      {label}
    </button>
  );
});

export const DailyRewardCard = memo(function DailyRewardCard({
  daily,
  onClaim,
}: DailyRewardCardProps) {
  const day = Math.max(1, Math.min(daily.streak, 7));

  return (
    <article className="rounded-[10px] border border-[rgba(255,105,0,0.3)] bg-[linear-gradient(135deg,rgba(255,105,0,0.1)_0%,rgba(251,44,54,0.1)_100%)] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-white">
            <Gift aria-hidden="true" className="h-4 w-4 text-[#FF8904]" />
            Daily Reward
          </h2>
          <p className="mt-2 text-sm text-[#8D96A8]">Day {day} of 7</p>
        </div>
        <div className="shrink-0 text-right text-sm font-bold leading-5">
          <p className="inline-flex items-center gap-1 text-[#FDC700]">
            <Image
              src="/balance-icon.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            {formatWholeCredits(daily.reward.credits)}
          </p>
          <p className="text-[#60A5FA]">
            +{daily.reward.xp.toLocaleString("en-US")} XP
          </p>
        </div>
      </div>

      <div className="mt-4">
        <DailyRewardButton
          canClaim={daily.canClaim}
          nextClaimAt={daily.nextClaimAt}
          onClaim={onClaim}
        />
      </div>

      <div className="mt-3 border-t border-[#FF6900]/15 pt-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[#8D96A8]">Current streak</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#FF8904]">
            <Zap aria-hidden="true" className="h-4 w-4" />
            {daily.streak} days
          </span>
        </div>
      </div>
    </article>
  );
}, areDailyRewardCardPropsEqual);

function areDailyRewardCardPropsEqual(
  previous: DailyRewardCardProps,
  next: DailyRewardCardProps,
) {
  return (
    previous.onClaim === next.onClaim &&
    previous.daily.canClaim === next.daily.canClaim &&
    previous.daily.streak === next.daily.streak &&
    previous.daily.nextClaimAt === next.daily.nextClaimAt &&
    previous.daily.reward.credits === next.daily.reward.credits &&
    previous.daily.reward.xp === next.daily.reward.xp
  );
}

function getNextDailyClaimLabel(nextClaimAt: string | null) {
  if (!nextClaimAt) {
    return "Claimed";
  }

  const nextClaimTime = new Date(nextClaimAt).getTime();

  if (!Number.isFinite(nextClaimTime)) {
    return "Claimed";
  }

  const hoursRemaining = Math.ceil(
    Math.max(0, nextClaimTime - Date.now()) / (60 * 60 * 1000),
  );

  return hoursRemaining > 0
    ? `Available in ${hoursRemaining}h`
    : "Available soon";
}
