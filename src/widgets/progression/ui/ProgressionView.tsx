"use client";

import { useProgressionView } from "@/widgets/progression/model/useProgressionView";
import { DailyRewardCard } from "./DailyRewardCard";
import { LevelCard } from "./LevelCard";
import { MissionSection } from "./MissionSection";
import { ProgressionHeader } from "./ProgressionHeader";

export function ProgressionView() {
  const {
    claimDaily,
    claimMission,
    errorMessage,
    isError,
    isLoading,
    mutationErrorMessage,
    pendingMissionId,
    progression,
  } = useProgressionView();

  return (
    <main className="min-h-screen bg-[#101725] pb-16 text-[#F4F7FB]">
      <ProgressionHeader />

      <section className="container flex flex-col gap-4 px-4 py-6">
        {isError && errorMessage ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {errorMessage}
          </p>
        ) : null}

        {mutationErrorMessage ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {mutationErrorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            Loading progression...
          </div>
        ) : progression ? (
          <>
            <LevelCard
              level={progression.level}
              xpForCurrentLevel={progression.xpForCurrentLevel}
              xpForNextLevel={progression.xpForNextLevel}
              xpIntoCurrentLevel={progression.xpIntoCurrentLevel}
            />
            <DailyRewardCard
              daily={progression.daily}
              onClaim={claimDaily}
            />
            <MissionSection
              missions={progression.missions.daily}
              onClaimMission={claimMission}
              pendingMissionId={pendingMissionId}
              title="Daily Missions"
            />
            <MissionSection
              missions={progression.missions.starter}
              onClaimMission={claimMission}
              pendingMissionId={pendingMissionId}
              title="Starter Missions"
            />
          </>
        ) : null}
      </section>
    </main>
  );
}
