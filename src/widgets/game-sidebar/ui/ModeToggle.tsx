import { memo } from "react";
import type { GameMode } from "@/entities/game/model/types";
import { modes } from "@/widgets/game-sidebar/model/constants";

type ModeToggleProps = {
  disabled?: boolean;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
};

export const ModeToggle = memo(function ModeToggle({
  disabled = false,
  mode,
  onModeChange,
}: ModeToggleProps) {
  return (
    <div className="relative grid h-9 grid-cols-2 rounded-[14px] bg-[#0F1419] p-1 text-xs">
      <span
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[14px] border border-[#262626] bg-[#2626264D]/30 transition-transform duration-200 ease-out ${
          mode === "Auto" ? "translate-x-full" : "translate-x-0"
        }`}
      />
      {modes.map((label) => {
        const isSelected = mode === label;

        return (
          <button
            className={`relative z-10 cursor-pointer rounded-[14px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? "text-[#FAFAFA]"
                : "text-[#A1A1A1] hover:text-[#D4D4D4]"
            }`}
            disabled={disabled}
            key={label}
            onClick={() => onModeChange(label)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
})
