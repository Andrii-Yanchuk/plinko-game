import { Target, Zap } from "lucide-react";
import type { ProgressionMission } from "@/entities/progression/model/types";
import { MissionCard } from "./MissionCard";

type MissionSectionProps = {
  isAnyClaimPending: boolean;
  isMissionClaimPending: (id: string) => boolean;
  missions: ProgressionMission[];
  onClaimMission: (id: string) => void;
  title: string;
};

export function MissionSection({
  isAnyClaimPending,
  isMissionClaimPending,
  missions,
  onClaimMission,
  title,
}: MissionSectionProps) {
  if (missions.length === 0) {
    return null;
  }

  const SectionIcon = title.toLowerCase().includes("starter") ? Zap : Target;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="inline-flex items-center gap-2 px-1 text-lg font-bold">
        <SectionIcon aria-hidden="true" className="h-4 w-4 text-[#60A5FA]" />
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {missions.map((mission) => (
          <MissionCard
            isAnyClaimPending={isAnyClaimPending}
            isClaiming={isMissionClaimPending(mission.id)}
            key={mission.id}
            mission={mission}
            onClaim={onClaimMission}
          />
        ))}
      </div>
    </section>
  );
}
