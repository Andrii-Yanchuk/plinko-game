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

  const isStarterSection = title.toLowerCase().includes("starter");
  const SectionIcon = isStarterSection ? Zap : Target;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="inline-flex items-center gap-1.5 px-1 text-sm font-bold">
        <SectionIcon
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            isStarterSection ? "text-[#60A5FA]" : "text-[#00C950]"
          }`}
        />
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <MissionCard
            isAnyClaimPending={isAnyClaimPending}
            isClaiming={isMissionClaimPending(mission.id)}
            isDaily={title.toLowerCase().includes("daily")}
            key={mission.id}
            mission={mission}
            onClaim={onClaimMission}
          />
        ))}
      </div>
    </section>
  );
}
