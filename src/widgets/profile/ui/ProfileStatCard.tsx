import { memo } from "react";

type ProfileStatCardProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

export const ProfileStatCard = memo(function ProfileStatCard({
  label,
  value,
  valueClassName = "text-3xl font-bold",
}: ProfileStatCardProps) {
  return (
    <article className="rounded-xl border border-[#2A2F3E] bg-[#1A1F2E] p-5">
      <p className="text-sm text-[#8D96A8]">{label}</p>
      <p className={`mt-2 text-[#F4F7FB] ${valueClassName}`}>{value}</p>
    </article>
  );
});
