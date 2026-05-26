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

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-bold">{title}</h2>
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
