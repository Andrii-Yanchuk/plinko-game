"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/entities/user/api/userApi";
import { queryKeys } from "@/shared/lib/queryKeys";

type UserBalanceProps = {
  balance?: string;
};

export function UserBalance({ balance: balanceOverride }: UserBalanceProps) {
  const {
    data: user,
    isError,
    isLoading,
  } = useQuery({
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
    <div className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#2A2F3E] bg-[#1A1F2E] px-4 text-xs max-sm:h-7 max-sm:gap-1 max-sm:px-2 max-sm:text-[10px]">
      <Image
        src="./balance-icon.svg"
        alt="bet-icon"
        width={20}
        height={20}
        className="max-sm:w-3.5 max-sm:h-3.5"
      />
      <span className="text-[#8D96A8] max-sm:hidden">Balance:</span>
      <span className="font-bold text-[#00E783]">{balance}</span>
    </div>
  );
}
