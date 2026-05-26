import { TrendingUp } from "lucide-react";
import type { Progression } from "@/entities/progression/model/types";
import { getLevelPercent } from "@/widgets/progression/lib/progression";
import { ProgressBar } from "./ProgressBar";

type LevelCardProps = {
  progression: Progression;
};

export function LevelCard({ progression }: LevelCardProps) {
  const percent = getLevelPercent(progression);
  const levelXpRange =
    progression.xpForNextLevel - progression.xpForCurrentLevel;
  const xpTarget = Math.max(0, levelXpRange);
  const xpToNextLevel = Math.max(
    0,
    xpTarget - progression.xpIntoCurrentLevel,
  );

  return (
    <article className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-4 py-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="inline-flex min-w-0 items-center gap-2 text-sm font-bold">
          <TrendingUp aria-hidden="true" className="h-4 w-4 text-[#60A5FA]" />
          <span className="truncate">Level {progression.level}</span>
        </h2>
        <p className="shrink-0 text-xs font-medium text-[#8D96A8]">
          {progression.xpIntoCurrentLevel.toLocaleString("en-US")} /{" "}
          {xpTarget.toLocaleString("en-US")} XP
        </p>
      </div>
      <ProgressBar
        percent={percent}
        trackClassName="mt-3 bg-[#050A12]"
        valueClassName="bg-linear-to-r from-[#2B7FFF] to-[#AD46FF]"
      />
      <p className="mt-2 text-xs text-[#8D96A8]">
        {xpToNextLevel.toLocaleString("en-US")} XP to level {progression.level + 1}
      </p>
    </article>
  );
}
