import { Target, Zap } from "lucide-react";
import { memo } from "react";
import type { ProgressionMission } from "@/entities/progression/model/types";
import { MissionCard } from "./MissionCard";

type MissionSectionProps = {
  missions: ProgressionMission[];
  onClaimMission: (id: string) => void;
  pendingMissionId: string | null;
  title: string;
};

export const MissionSection = memo(function MissionSection({
  missions,
  onClaimMission,
  pendingMissionId,
  title,
}: MissionSectionProps) {
  const isStarterSection = title.toLowerCase().includes("starter");
  const SectionIcon = isStarterSection ? Zap : Target;

  if (missions.length === 0) {
    return null;
  }

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
            isDaily={title.toLowerCase().includes("daily")}
            key={mission.id}
            mission={mission}
            onClaim={onClaimMission}
            pendingMissionId={pendingMissionId}
          />
        ))}
      </div>
    </section>
  );
});
