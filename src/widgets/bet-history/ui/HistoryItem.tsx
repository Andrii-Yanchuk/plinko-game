import type { Bet } from "@/entities/bet/model/types";
import type { ReactNode } from "react";
import { formatDate, formatProfit, getProfit } from "@/entities/bet/lib/formatters";
import {
  getMultiplierTextTone,
  multiplierColor,
} from "@/widgets/plinko-board/lib/multiplier";
import { CreditAmount } from "./CreditAmount";
import { RiskBadge } from "./RiskBadge";

type HistoryItemProps = {
  bet: Bet;
};

type HistoryFieldProps = {
  label: string;
  children: ReactNode;
  alignEnd?: boolean;
};

function HistoryField({ label, children, alignEnd }: HistoryFieldProps) {
  return (
    <div className={alignEnd ? "flex flex-col md:items-end" : undefined}>
      <div className="text-[11px] leading-4 text-[#6F788B] md:text-[12px]">
        {label}
      </div>
      {children}
    </div>
  );
}

export function HistoryItem({ bet }: HistoryItemProps) {
  const profit = getProfit(bet);
  const profitClassName = profit >= 0 ? "text-[#00E783]" : "text-[#FB2C36]";
  const multiplierClassName = `inline-flex rounded border bg-transparent px-2 py-0.5 text-[18px] font-bold ${multiplierColor(Number(bet.multiplier))} ${getMultiplierTextTone(bet.multiplier)}`;

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

          <HistoryField label="Payout">
            <CreditAmount value={bet.payout} />
          </HistoryField>

          <HistoryField alignEnd label="Balance">
            <CreditAmount value={bet.balanceAfter} />
          </HistoryField>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr] md:items-center">
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
}
