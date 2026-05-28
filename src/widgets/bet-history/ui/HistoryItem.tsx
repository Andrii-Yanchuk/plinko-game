import type { Bet } from "@/entities/bet/model/types";
import { memo, type ReactNode } from "react";
import { formatDate, formatProfit, getProfit } from "@/entities/bet/lib/formatters";
import { getMultiplierTextTone } from "@/widgets/plinko-board/lib/multiplier";
import { CreditAmount } from "./CreditAmount";
import { RiskBadge } from "./RiskBadge";

type HistoryItemProps = {
  bet: Bet;
};

type HistoryFieldProps = {
  label: string;
  children: ReactNode;
  alignEnd?: boolean;
  alignCenter?: boolean;
};

const HistoryField = memo(function HistoryField({
  label,
  children,
  alignCenter,
  alignEnd,
}: HistoryFieldProps) {
  const className = alignEnd
    ? "flex flex-col items-end"
    : alignCenter
      ? "flex flex-col items-center"
      : undefined;

  return (
    <div className={className}>
      <div className="text-[11px] leading-4 text-[#6F788B] md:text-[12px]">
        {label}
      </div>
      {children}
    </div>
  );
});

export const HistoryItem = memo(function HistoryItem({ bet }: HistoryItemProps) {
  const profit = getProfit(bet);
  const profitClassName = profit >= 0 ? "text-[#00E783]" : "text-[#FB2C36]";
  const multiplierClassName = `text-[18px] font-bold leading-5 ${getMultiplierTextTone(bet.multiplier)}`;

  return (
    <article className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-3 text-xs text-[#D1D5DC] sm:p-4">
      <div className="grid gap-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <HistoryField label="Time">
            <div className="text-sm leading-5">{formatDate(bet.createdAt)}</div>
          </HistoryField>

          <HistoryField alignEnd label="Multiplier">
            <div className={multiplierClassName}>{bet.multiplier}x</div>
          </HistoryField>
        </div>

        <div className="flex items-start justify-between gap-3 border-t border-[#2A2F3E]/70 pt-3">
          <HistoryField label="Settings">
            <div className="flex items-center gap-2">
              <span className="text-sm leading-5">{bet.rows} rows</span>
              <RiskBadge risk={bet.risk} />
            </div>
          </HistoryField>

          <HistoryField alignEnd label="Profit">
            <div className={profitClassName}>{formatProfit(bet)}</div>
          </HistoryField>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-[#2A2F3E]/70 pt-3">
          <HistoryField label="Bet">
            <CreditAmount value={bet.amount} />
          </HistoryField>

          <HistoryField alignCenter label="Payout">
            <CreditAmount value={bet.payout} />
          </HistoryField>

          <HistoryField alignEnd label="Balance">
            <CreditAmount value={bet.balanceAfter} />
          </HistoryField>
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-[max-content_max-content_max-content_max-content_max-content_max-content_1fr] md:items-center md:gap-8">
        <HistoryField label="Time">
          <div className="text-sm">{formatDate(bet.createdAt)}</div>
        </HistoryField>

        <HistoryField label="Settings">
          <div className="flex items-center gap-2">
            <span className="text-sm">{bet.rows} rows</span>
            <RiskBadge risk={bet.risk} />
          </div>
        </HistoryField>

        <HistoryField label="Multiplier">
          <div className={multiplierClassName}>{bet.multiplier}x</div>
        </HistoryField>

        <HistoryField label="Bet Amount">
          <CreditAmount value={bet.amount} />
        </HistoryField>

        <HistoryField label="Payout">
          <CreditAmount value={bet.payout} />
        </HistoryField>

        <HistoryField label="Profit">
          <div className={profitClassName}>{formatProfit(bet)}</div>
        </HistoryField>

        <HistoryField alignEnd label="Balance After">
          <CreditAmount value={bet.balanceAfter} />
        </HistoryField>
      </div>
    </article>
  );
});
