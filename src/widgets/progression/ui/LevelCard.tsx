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

  return (
    <article className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-[#8D96A8]">
            <TrendingUp aria-hidden="true" className="h-4 w-4 text-[#60A5FA]" />
            Current Level
          </p>
          <h2 className="text-2xl font-bold">Level {progression.level}</h2>
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
