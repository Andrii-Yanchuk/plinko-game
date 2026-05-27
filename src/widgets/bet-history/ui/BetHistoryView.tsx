"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { BetHistory } from "@/entities/bet/model/types";
import { getBetHistory } from "@/entities/bet/api/betsApi";
import { queryKeys } from "@/shared/lib/queryKeys";
import { betHistoryPageSize } from "@/widgets/bet-history/model/constants";
import { useBetHistoryFiltersStore } from "@/widgets/bet-history/model/useBetHistoryFiltersStore";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryItem } from "./HistoryItem";

export function BetHistoryView() {
  const risk = useBetHistoryFiltersStore((state) => state.risk);
  const rows = useBetHistoryFiltersStore((state) => state.rows);
  const setRisk = useBetHistoryFiltersStore((state) => state.setRisk);
  const setRows = useBetHistoryFiltersStore((state) => state.setRows);
  const selectedRisk = risk === "ALL" ? undefined : risk;
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
        risk: selectedRisk,
        rows: selectedRows,
      }),
    queryKey: queryKeys.betHistory({ risk: selectedRisk, rows: selectedRows }),
  });

  const visibleItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="min-h-screen bg-[#101725] pb-20 text-[#F4F7FB]">
      <header className="border-b border-[#222A3B]/80 bg-[#1A1F2EF2]">
        <div className="container flex h-12 min-w-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4">
          <Link
            aria-label="Back to game"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[#D1D5DC] transition-colors hover:bg-[#222A3D]"
            href="/game"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <h1 className="min-w-0 truncate text-xl font-bold sm:text-[24px]">
            Bet History
          </h1>
        </div>
      </header>

      <section className="container flex flex-col gap-3 px-3 py-4 sm:gap-5 sm:px-4 sm:py-6">
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
            className="self-center cursor-pointer rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-5 py-2 text-sm font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
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
