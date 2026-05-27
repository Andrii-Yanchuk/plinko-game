import { memo } from "react";
import { formatMemberSince } from "@/entities/profile/lib/profile";
import { ProfileStatCard } from "./ProfileStatCard";

type ProfileStatsProps = {
  createdAt?: string | null;
  xp: number;
};

export const ProfileStats = memo(function ProfileStats({
  createdAt,
  xp,
}: ProfileStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ProfileStatCard
        label="Total XP"
        value={xp.toLocaleString("en-US")}
      />
      <ProfileStatCard
        label="Member Since"
        value={formatMemberSince(createdAt)}
        valueClassName="text-base font-medium"
      />
    </div>
  );
});
