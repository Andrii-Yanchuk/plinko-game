import type { KeyboardEvent } from "react";

type AutoPlayControlsProps = {
  autoBetCount: string;
  isAutoPlaying: boolean;
  onAutoBetCountChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onStopOnLossChange: (value: string) => void;
  onStopOnProfitChange: (value: string) => void;
  stopOnLoss: string;
  stopOnProfit: string;
};

export function AutoPlayControls({
  autoBetCount,
  isAutoPlaying,
  onAutoBetCountChange,
  onKeyDown,
  onStopOnLossChange,
  onStopOnProfitChange,
  stopOnLoss,
  stopOnProfit,
}: AutoPlayControlsProps) {
  return (
    <div className="mt-4 border-t border-[#2A2F3E] pt-4">
      <label className="block text-sm font-medium text-[#D1D5DC]">
        Number of Bets
        <input
          className="mt-2 h-9 w-full rounded-lg border border-[#2A2F3E] bg-[#2626264D]/30 px-3 text-sm text-[#E8EDF6] outline-none focus:border-[#3A465E]"
          disabled={isAutoPlaying}
          min="1"
          onChange={(event) => onAutoBetCountChange(event.target.value)}
          onKeyDown={onKeyDown}
          step="1"
          type="number"
          value={autoBetCount}
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-[#D1D5DC]">
          Stop on Profit
          <input
            className="mt-2 h-9 w-full rounded-lg border border-[#2A2F3E] bg-[#2626264D]/30 px-3 text-sm text-[#E8EDF6] outline-none focus:border-[#3A465E]"
            disabled={isAutoPlaying}
            min="0"
            onChange={(event) => onStopOnProfitChange(event.target.value)}
            onKeyDown={onKeyDown}
            step="0.01"
            type="number"
            value={stopOnProfit}
          />
        </label>

        <label className="block text-sm font-medium text-[#D1D5DC]">
          Stop on Loss
          <input
            className="mt-2 h-9 w-full rounded-lg border border-[#2A2F3E] bg-[#2626264D]/30 px-3 text-sm text-[#E8EDF6] outline-none focus:border-[#3A465E]"
            disabled={isAutoPlaying}
            min="0"
            onChange={(event) => onStopOnLossChange(event.target.value)}
            onKeyDown={onKeyDown}
            step="0.01"
            type="number"
            value={stopOnLoss}
          />
        </label>
      </div>
    </div>
  );
}
