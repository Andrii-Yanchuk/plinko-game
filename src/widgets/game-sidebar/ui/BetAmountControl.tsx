import Image from "next/image";
import { memo, type KeyboardEvent } from "react";
import type { BetControl } from "@/entities/game/model/types";
import { betControls } from "@/widgets/game-sidebar/model/constants";

type BetAmountControlProps = {
  amount: string;
  disabled?: boolean;
  onAmountChange: (amount: string) => void;
  onBetControlClick: (control: BetControl) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const BetAmountControl = memo(function BetAmountControl({
  amount,
  disabled = false,
  onAmountChange,
  onBetControlClick,
  onKeyDown,
}: BetAmountControlProps) {
  return (
    <>
      <span className="mt-5 text-sm font-medium text-[#D1D5DC]">
        Bet Amount
      </span>

      <div className="mt-2 flex h-9 items-center rounded-lg border border-[#2A2F3E] bg-[#2626264D]/30 px-3 text-sm text-[#A1A1A1] focus-within:border-[#3A465E] focus-within:text-[#E8EDF6]">
        <Image
          src="./balance-icon.svg"
          alt="bet-icon"
          width={20}
          height={20}
          className="mr-2"
        />
        <input
          className="w-full bg-transparent outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          min="0"
          onChange={(event) => onAmountChange(event.target.value)}
          onKeyDown={onKeyDown}
          step="0.01"
          type="number"
          value={amount}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {betControls.map((label) => (
          <button
            className="h-8 cursor-pointer rounded-lg border border-[#262626] bg-[#2626264D]/30 text-xs font-medium text-[#D0D6E2] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            key={label}
            onClick={() => onBetControlClick(label)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
});
