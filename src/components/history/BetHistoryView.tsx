"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Risk } from "@/components/game/types";
import { getBetHistory, type BetHistory } from "@/lib/bets-api";
import { queryKeys } from "@/lib/query-keys";
import { betHistoryPageSize } from "./constants";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryItem } from "./HistoryItem";

export function BetHistoryView() {
  const [risk, setRisk] = useState<Risk | "ALL">("ALL");
  const [rows, setRows] = useState("ALL");
  const selectedRows = rows === "ALL" ? undefined : Number(rows);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<BetHistory, Error>({
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getBetHistory({
        cursor: pageParam as string | undefined,
        limit: betHistoryPageSize,
        rows: selectedRows,
      }),
    queryKey: queryKeys.betHistory({ rows: selectedRows }),
  });

  const visibleItems = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];

    return items.filter((item) => risk === "ALL" || item.risk === risk);
  }, [data, risk]);

  return (
    <main className="min-h-screen bg-[#101725] text-[#F4F7FB]">
      <header className="flex h-16 items-center gap-4 border-b border-[#222A3B]/80 px-4">
        <Link
          className="flex items-center gap-1 rounded-[10px] border border-[#2A2F3E] bg-[#1A1F2E] px-4 py-2 text-[16px] text-[#D1D5DC] transition-colors hover:bg-[#222A3D]"
          href="/game"
        >
          <Image src="/back-icon.svg" alt="Back icon" width={16} height={16} />
          Back to Game
        </Link>
        <h1 className="text-[24px] font-bold">Bet History</h1>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6">
        <HistoryFilters
          onRiskChange={setRisk}
          onRowsChange={setRows}
          risk={risk}
          rows={rows}
        />

        {isError ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {error.message}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            Loading history...
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visibleItems.map((bet) => (
              <HistoryItem bet={bet} key={bet.betId} />
            ))}
          </div>
        ) : !isError ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            No bets found.
          </div>
        ) : null}

        {hasNextPage ? (
          <button
            className="self-center rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-5 py-2 text-sm font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            type="button"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        ) : null}
      </section>
    </main>
  );
}
