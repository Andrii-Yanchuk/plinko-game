import type { Bet } from "@/entities/bet/model/types";
import { formatDate, formatProfit, getProfit } from "@/entities/bet/lib/formatters";
import { CreditAmount } from "./CreditAmount";
import { RiskBadge } from "./RiskBadge";

type HistoryItemProps = {
  bet: Bet;
};

export function HistoryItem({ bet }: HistoryItemProps) {
  const profit = getProfit(bet);

  return (
    <article className="grid gap-4 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-xs text-[#D1D5DC] md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr] md:items-center">
      <div>
        <div className="text-[12px] text-[#6F788B]">Time</div>
        <div className="text-sm">{formatDate(bet.createdAt)}</div>
      </div>

      <div>
        <div className="text-[12px] text-[#6F788B]">Settings</div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{bet.rows} rows</span>
          <RiskBadge risk={bet.risk} />
        </div>
      </div>

      <div>
        <div className="text-[12px] text-[#6F788B]">Multiplier</div>
        <div className="text-[18px] font-bold text-[#00E783]">
          {bet.multiplier}x
        </div>
      </div>

      <div>
        <div className="text-[12px] text-[#6F788B]">Bet Amount</div>
        <CreditAmount value={bet.amount} />
      </div>

      <div>
        <div className="text-[12px] text-[#6F788B]">Payout</div>
        <CreditAmount value={bet.payout} />
      </div>

      <div>
        <div className="text-[12px] text-[#6F788B]">Profit</div>
        <div className={profit >= 0 ? "text-[#00E783]" : "text-[#FB2C36]"}>
          {formatProfit(bet)}
        </div>
      </div>

      <div className="flex flex-col md:items-end">
        <div className="text-[12px] text-[#6F788B]">Balance After</div>
        <CreditAmount value={bet.balanceAfter} />
      </div>
    </article>
  );
}
