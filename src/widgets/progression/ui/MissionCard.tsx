import type { ProgressionMission } from "@/entities/progression/model/types";
import { formatCredits } from "@/entities/bet/lib/formatters";
import {
  getMissionPercent,
  getMissionTimeLabel,
} from "@/widgets/progression/lib/progression";
import { ProgressBar } from "./ProgressBar";
import { RewardPill } from "./RewardPill";

type MissionCardProps = {
  isAnyClaimPending: boolean;
  isClaiming: boolean;
  mission: ProgressionMission;
  onClaim: (id: string) => void;
};

export function MissionCard({
  isAnyClaimPending,
  isClaiming,
  mission,
  onClaim,
}: MissionCardProps) {
  const percent = getMissionPercent(mission);
  const shouldShowClaimButton = mission.claimable || mission.claimedAt;
  const isButtonDisabled = !mission.claimable || isAnyClaimPending;
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
        <div className="shrink-0 rounded-md bg-[#101725]/70 px-2 py-1 text-xs font-medium text-[#8D96A8]">
          {getMissionTimeLabel(mission)}
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
          <RewardPill label="Credits">
            {formatCredits(mission.creditReward)}
          </RewardPill>
          <RewardPill label="XP">
            {mission.xpReward.toLocaleString("en-US")}
          </RewardPill>
        </div>
        {shouldShowClaimButton ? (
          <button
            className="rounded-lg bg-[#2E7BFF] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#60A5FA] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isButtonDisabled}
            onClick={() => onClaim(mission.id)}
            type="button"
          >
            {claimLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
