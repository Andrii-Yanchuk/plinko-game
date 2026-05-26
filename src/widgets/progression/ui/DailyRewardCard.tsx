import type { Progression } from "@/entities/progression/model/types";
import { formatCredits } from "@/entities/bet/lib/formatters";
import { RewardPill } from "./RewardPill";

type DailyRewardCardProps = {
  daily: Progression["daily"];
  isAnyClaimPending: boolean;
  isPending: boolean;
  onClaim: () => void;
};

export function DailyRewardCard({
  daily,
  isAnyClaimPending,
  isPending,
  onClaim,
}: DailyRewardCardProps) {
  const label = isPending
    ? "Claiming..."
    : daily.canClaim
      ? "Claim Now"
      : "Claimed";

  return (
    <article className="rounded-lg border border-[#F59E0B]/40 bg-[#2A1B10] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#FDBA74]">
            Daily Reward
          </p>
          <h2 className="text-xl font-bold">Streak {daily.streak}</h2>
        </div>
        <button
          className="rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#101725] transition-colors hover:bg-[#FBBF24] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!daily.canClaim || isAnyClaimPending}
          onClick={onClaim}
          type="button"
        >
          {label}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RewardPill label="Credits">{formatCredits(daily.reward.credits)}</RewardPill>
        <RewardPill label="XP">{daily.reward.xp.toLocaleString("en-US")}</RewardPill>
      </div>
    </article>
  );
}
