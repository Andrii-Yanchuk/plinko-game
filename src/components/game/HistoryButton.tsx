"use client";

import Image from "next/image";
import { useState } from "react";
import { getBetHistory } from "@/lib/bets-api";

export function HistoryButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    try {
      const history = await getBetHistory({ limit: 20 });

      console.log("Bet history", history);
    } catch (error) {
      console.error(
        "Unable to load bet history",
        error instanceof Error ? error.message : error,
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-4 text-[16px] font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={handleClick}
      type="button"
    >
      <Image src="./history-icon.svg" alt="" width={16} height={16} />
      {isLoading ? "Loading..." : "History"}
    </button>
  );
}
