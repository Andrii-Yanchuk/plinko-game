"use client";

import Image from "next/image";
import { type KeyboardEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { placeBet, type Bet } from "@/lib/bets-api";
import type { GameConfig } from "@/lib/game-api";
import type { CurrentUser } from "@/lib/auth-api";
import { queryKeys } from "@/lib/query-keys";
import { betControls, modes, riskStyles } from "./constants";
import {
  getCreditsFromMinimalUnits,
  getMinimalUnitsFromCredits,
  getNextBetAmount,
  getRowsProgress,
  isBlockedBetAmountKey,
} from "./helpers";
import type { BetControl, GameMode, Risk } from "./types";

type GameSidebarProps = {
  config?: GameConfig;
  lastBet: Bet | null;
  onBetPlaced: (bet: Bet) => void;
  onRiskChange: (risk: Risk) => void;
  onRowsChange: (rows: number) => void;
  risk: Risk;
  rows: number;
};

function formatAmount(value: string, minBetAmount: number, maxBetAmount: number) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < minBetAmount ||
    amount > maxBetAmount
  ) {
    return null;
  }

  return getMinimalUnitsFromCredits(value);
}

export function GameSidebar({
  config,
  lastBet,
  onBetPlaced,
  onRiskChange,
  onRowsChange,
  risk,
  rows,
}: GameSidebarProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("Manual");
  const [betAmount, setBetAmount] = useState("1.00");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const availableRows = config?.rows ?? [8, 9, 10, 11, 12, 13, 14, 15, 16];
  const availableRisks = config?.risks ?? (["LOW", "MEDIUM", "HIGH"] as Risk[]);
  const minRows = Math.min(...availableRows);
  const maxRows = Math.max(...availableRows);
  const minBetAmount = config ? getCreditsFromMinimalUnits(config.minBet) : 1;
  const maxBetAmount = config
    ? getCreditsFromMinimalUnits(config.maxBet)
    : 1_000_000;
  const rowsProgress = getRowsProgress(rows, minRows, maxRows);
  const placeBetMutation = useMutation({
    mutationFn: placeBet,
    onSuccess: (bet) => {
      queryClient.setQueryData<CurrentUser>(
        queryKeys.currentUser,
        (currentUser) =>
          currentUser
            ? { ...currentUser, balance: bet.balanceAfter }
            : currentUser,
      );
      setBetAmount((Number(bet.amount) / 1_000_000).toFixed(2));
      onBetPlaced(bet);
    },
  });

  function handleBetAmountKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isBlockedBetAmountKey(event.key)) {
      event.preventDefault();
    }
  }

  function handleBetControlClick(control: BetControl) {
    const nextBetAmount = getNextBetAmount(
      betAmount,
      control,
      minBetAmount,
      maxBetAmount,
    );

    if (nextBetAmount === null) {
      return;
    }

    setBetAmount(nextBetAmount);
  }

  async function handleBetClick() {
    const amount = formatAmount(betAmount, minBetAmount, maxBetAmount);

    if (!amount) {
      setError(
        `Enter a bet amount between ${minBetAmount.toFixed(2)} and ${maxBetAmount.toFixed(2)}`,
      );
      return;
    }

    setError("");

    try {
      await placeBetMutation.mutateAsync({
        amount,
        rows,
        risk,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to place bet",
      );
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#252D3E] bg-[#1A1F2ECC]/80 p-4 md:w-69.5 md:border-r md:border-b-0">
      <div className="relative grid h-9 grid-cols-2 rounded-[14px] bg-[#0F1419] p-1 text-xs">
        <span
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[14px] border border-[#262626] bg-[#2626264D]/30 transition-transform duration-200 ease-out ${
            selectedMode === "Auto" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        {modes.map((mode) => {
          const isSelected = selectedMode === mode;

          return (
            <button
              className={`relative z-10 rounded-[14px] font-medium transition-colors duration-200 cursor-pointer ${
                isSelected
                  ? "text-[#FAFAFA]"
                  : "text-[#A1A1A1] hover:text-[#D4D4D4]"
              }`}
              key={mode}
              onClick={() => setSelectedMode(mode)}
              type="button"
            >
              {mode}
            </button>
          );
        })}
      </div>

      <span className="mt-5 text-[#D1D5DC] text-sm font-medium">
        Bet Amount
      </span>

      <div className="mt-2 flex h-9 items-center rounded-lg border border-[#2A2F3E] bg-[#2626264D]/30 px-3 text-sm text-[#A1A1A1] focus-within:text-[#E8EDF6]  focus-within:border-[#3A465E]">
        <Image
          src="./balance-icon.svg"
          alt="bet-icon"
          width={20}
          height={20}
          className="mr-2"
        />
        <input
          className="w-full bg-transparent outline-none"
          min="0"
          onChange={(event) => setBetAmount(event.target.value)}
          onKeyDown={handleBetAmountKeyDown}
          step="0.01"
          type="number"
          value={betAmount}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {betControls.map((label) => (
          <button
            className="h-8 rounded-lg border border-[#262626] bg-[#2626264D]/30 text-xs font-medium text-[#D0D6E2] transition-colors hover:bg-[#222A3D] cursor-pointer"
            key={label}
            onClick={() => handleBetControlClick(label)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-[#D1D5DC] text-sm font-medium">Risk</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {availableRisks.map((label) => (
          <button
            className={`h-9 rounded-lg border-2 text-xs font-semibold transition-colors cursor-pointer ${
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

      <div className="mt-5 flex items-center justify-between text-xs">
        <span className=" text-[#D1D5DC] text-sm font-medium">Rows</span>
        <span className="rounded-[10px] bg-[#0B1220] border border-[#2A2F3E] px-3 py-0.5 text-sm font-bold text-[#00E783]">
          {rows}
        </span>
      </div>
      <input
        type="range"
        min={minRows}
        max={maxRows}
        onChange={(event) => onRowsChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, #FAFAFA ${rowsProgress}%, #262626 ${rowsProgress}%)`,
        }}
        value={rows}
        className="mt-2 h-4 w-full cursor-pointer appearance-none rounded-full bg-[#262626] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FAFAFA] [&::-moz-range-thumb]:bg-[#0A0A0A] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FAFAFA] [&::-webkit-slider-thumb]:bg-[#0A0A0A]"
      />

      <div className="mt-2 flex justify-between text-xs text-[#6F788B]">
        <span>8</span>
        <span>16</span>
      </div>

      <button
        className="mt-4 h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[18px] text-[#F4F7FB] font-bold transition-[box-shadow,opacity] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={placeBetMutation.isPending}
        onClick={handleBetClick}
        type="button"
      >
        {placeBetMutation.isPending ? "Placing..." : "Bet"}
      </button>

      {error ? (
        <p className="mt-3 rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-3 py-2 text-xs font-medium text-[#FDA4AF]">
          {error}
        </p>
      ) : null}

      {lastBet ? (
        <div className="mt-3 grid gap-2 rounded-lg border border-[#2A2F3E] bg-[#111827] p-3 text-xs text-[#D0D6E2]">
          <div className="flex items-center justify-between">
            <span className="text-[#8D96A8]">Multiplier</span>
            <span className="font-bold text-[#FACC15]">
              {lastBet.multiplier}x
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8D96A8]">Payout</span>
            <span className="font-bold text-[#00E783]">
              {Number(lastBet.payout).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8D96A8]">Balance</span>
            <span className="font-bold text-[#E8EDF6]">
              {Number(lastBet.balanceAfter).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-auto -mx-4 -mb-4 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4">
        <button
          aria-label="Fullscreen"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
          type="button"
        >
          <Image src="./all-display-icon.svg" alt="" width={20} height={20} />
        </button>
        <button
          aria-label="Settings"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
          type="button"
        >
          <Image src="./setings-icon.svg" alt="" width={20} height={20} />
        </button>
      </div>
    </aside>
  );
}
