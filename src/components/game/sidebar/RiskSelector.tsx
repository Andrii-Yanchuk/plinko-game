import { riskStyles } from "../constants";
import type { Risk } from "../types";

type RiskSelectorProps = {
  availableRisks: Risk[];
  onRiskChange: (risk: Risk) => void;
  risk: Risk;
};

export function RiskSelector({
  availableRisks,
  onRiskChange,
  risk,
}: RiskSelectorProps) {
  return (
    <>
      <div className="mt-4 text-sm font-medium text-[#D1D5DC]">Risk</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {availableRisks.map((label) => (
          <button
            className={`h-9 cursor-pointer rounded-lg border-2 text-xs font-semibold transition-colors ${
              risk === label
                ? riskStyles[label]
                : "border-[#263045] bg-[#121827] text-[#D0D6E2] hover:border-[#3A465E]"
            }`}
            key={label}
            onClick={() => onRiskChange(label)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
