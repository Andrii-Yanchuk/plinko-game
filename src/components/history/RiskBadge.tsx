import type { Risk } from "@/entities/game/model/types";

type RiskBadgeProps = {
  risk: Risk;
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  const className =
    risk === "LOW"
      ? "bg-[#00C950]/15 text-[#00E783]"
      : risk === "MEDIUM"
        ? "bg-[#FACC15]/15 text-[#FACC15]"
        : "bg-[#FB2C36]/15 text-[#FDA4AF]";

  return (
    <span className={`rounded px-2 py-0.5 text-[10px] ${className}`}>
      {risk}
    </span>
  );
}
