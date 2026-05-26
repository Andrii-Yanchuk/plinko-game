import { Clock, Target } from "lucide-react";
import Image from "next/image";
import type { ProgressionMission } from "@/entities/progression/model/types";
import { formatWholeCredits } from "@/entities/bet/lib/formatters";
import {
  getDailyMissionTimeLeftLabel,
  getMissionPercent,
  getMissionTimeLabel,
} from "@/widgets/progression/lib/progression";
import { ProgressBar } from "./ProgressBar";

type MissionCardProps = {
  isAnyClaimPending: boolean;
  isClaiming: boolean;
  isDaily: boolean;
  mission: ProgressionMission;
  onClaim: (id: string) => void;
};

export function MissionCard({
  isAnyClaimPending,
  isClaiming,
  isDaily,
  mission,
  onClaim,
}: MissionCardProps) {
  const percent = getMissionPercent(mission);
  const shouldShowClaimButton = mission.claimable || mission.claimedAt;
  const shouldShowTimeLabel = isDaily;
  const isButtonDisabled = !mission.claimable || isAnyClaimPending;
  const claimLabel = isClaiming
    ? "Claiming..."
    : mission.claimedAt
      ? "Claimed"
      : "Claim";
  const timeLabel = isDaily
    ? getDailyMissionTimeLeftLabel(mission)
    : getMissionTimeLabel(mission);

  return (
    <article className="rounded-lg border border-[#2B7FFF]/35 bg-[#2B7FFF]/10 p-3 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#2B7FFF]/45 bg-[#173B72] text-[#60A5FA]">
            <Target aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold">{mission.title}</h3>
            <p className="mt-0.5 truncate text-xs leading-4 text-[#8D96A8]">
              {mission.description}
            </p>
          </div>
        </div>
        {shouldShowClaimButton ? (
          <button
            className="shrink-0 cursor-pointer rounded-md bg-[#2B7FFF] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#60A5FA] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isButtonDisabled}
            onClick={() => onClaim(mission.id)}
            type="button"
          >
            {claimLabel}
          </button>
        ) : null}
      </div>

      <div className="mt-2 pl-11">
        <div className="mb-1 flex items-center justify-between text-xs text-[#A7B0C2]">
          <span>
            {mission.progress.toLocaleString("en-US")} /{" "}
            {mission.target.toLocaleString("en-US")}
          </span>
          <span className="text-white">{Math.round(percent)}%</span>
        </div>
        <ProgressBar
          percent={percent}
          trackClassName="bg-[#050A12]"
          valueClassName="bg-[#2B7FFF]"
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 pl-11 text-xs">
        <div className="flex min-w-0 items-center gap-3 font-bold">
          <span className="inline-flex items-center gap-1 text-[#FDC700]">
            <Image
              src="/balance-icon.svg"
              alt=""
              width={14}
              height={14}
              aria-hidden="true"
            />
            {formatWholeCredits(mission.creditReward)}
          </span>
          <span className="text-[#60A5FA]">
            +{mission.xpReward.toLocaleString("en-US")} XP
          </span>
        </div>
        {shouldShowTimeLabel ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[#8D96A8]">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            {timeLabel}
          </span>
        ) : null}
      </div>
    </article>
  );
}
