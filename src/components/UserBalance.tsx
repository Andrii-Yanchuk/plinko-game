"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth-api";
import { queryKeys } from "@/lib/query-keys";

type UserBalanceProps = {
  balance?: string;
};

export function UserBalance({ balance: balanceOverride }: UserBalanceProps) {
  const { data: user, isError, isLoading } = useQuery({
    queryFn: getCurrentUser,
    queryKey: queryKeys.currentUser,
  });

  const balanceValue = balanceOverride ?? user?.balance;
  const balance = balanceValue
    ? Number(balanceValue).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : isError
      ? "Unable to load balance"
      : isLoading
        ? "Loading..."
        : "-";

  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#2A2F3E] bg-[#1A1F2E] px-4 text-xs">
      <Image src="./balance-icon.svg" alt="bet-icon" width={20} height={20} />
      <span className="text-[#8D96A8]">Balance:</span>
      <span className="font-bold text-[#00E783]">{balance}</span>
    </div>
  );
}
