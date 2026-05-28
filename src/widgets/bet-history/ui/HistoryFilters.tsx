import { Funnel } from "lucide-react";
import { memo } from "react";
import type { Risk } from "@/entities/game/model/types";
import { riskOptions, rowOptions } from "@/widgets/bet-history/model/constants";

type HistoryFiltersProps = {
  risk: Risk | "ALL";
  rows: string;
  onRiskChange: (risk: Risk | "ALL") => void;
  onRowsChange: (rows: string) => void;
};

export const HistoryFilters = memo(function HistoryFilters({
  risk,
  rows,
  onRiskChange,
  onRowsChange,
}: HistoryFiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-3 text-xs text-[#8D96A8] sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
      <span className="col-span-2 flex items-center gap-2 text-sm font-medium text-[#D1D5DC] sm:col-span-1">
        <Funnel aria-hidden="true" className="h-4 w-4 text-[#99A1AF]" />
        Filters:
      </span>

      <label className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <span className="text-xs text-[#99A1AF]">Risk:</span>
        <select
          className="h-8 w-full rounded border border-[#2A2F3E] bg-[#0F1419] px-2 text-[#D1D5DC] outline-none sm:w-auto"
          onChange={(event) => onRiskChange(event.target.value as Risk | "ALL")}
          value={risk}
        >
          {riskOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <span className="text-xs text-[#99A1AF]">Rows:</span>
        <select
          className="h-8 w-full rounded border border-[#2A2F3E] bg-[#0F1419] px-2 text-[#D1D5DC] outline-none sm:w-auto"
          onChange={(event) => onRowsChange(event.target.value)}
          value={rows}
        >
          {rowOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
});
