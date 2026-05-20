import type { Bet } from "@/lib/bets-api";
import { minimalUnitsPerCredit } from "./constants";

export function formatCredits(value: string) {
  return (Number(value) / minimalUnitsPerCredit).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function getProfit(bet: Bet) {
  return (Number(bet.payout) - Number(bet.amount)) / minimalUnitsPerCredit;
}

export function formatProfit(bet: Bet) {
  const profit = getProfit(bet);
  const sign = profit > 0 ? "+" : "";

  return `${sign}${profit.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
