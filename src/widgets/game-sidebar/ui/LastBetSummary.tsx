import type { Bet } from "@/entities/bet/model/types";
import {
  getMultiplierTextTone,
  multiplierColor,
} from "@/widgets/plinko-board/lib/multiplier";

type LastBetSummaryProps = {
  lastBet: Bet | null;
};

function formatAmount(value: string) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function LastBetSummary({ lastBet }: LastBetSummaryProps) {
  if (!lastBet) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 rounded-lg border border-[#2A2F3E] bg-[#111827] p-3 text-xs text-[#D0D6E2]">
      <div className="flex items-center justify-between">
        <span className="text-[#8D96A8]">Multiplier</span>
        <span
          className={`rounded border bg-transparent px-2 py-0.5 font-bold ${multiplierColor(Number(lastBet.multiplier))} ${getMultiplierTextTone(lastBet.multiplier)}`}
        >
          {lastBet.multiplier}x
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#8D96A8]">Payout</span>
        <span className="font-bold text-[#00E783]">
          {formatAmount(lastBet.payout)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#8D96A8]">Balance</span>
        <span className="font-bold text-[#E8EDF6]">
          {formatAmount(lastBet.balanceAfter)}
        </span>
      </div>
    </div>
  );
}
