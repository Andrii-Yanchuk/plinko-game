"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Risk } from "@/components/game/types";
import { getBetHistory, type Bet } from "@/lib/bets-api";
import { betHistoryPageSize } from "./constants";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryItem } from "./HistoryItem";

export function BetHistoryView() {
  const [items, setItems] = useState<Bet[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [risk, setRisk] = useState<Risk | "ALL">("ALL");
  const [rows, setRows] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const selectedRows = rows === "ALL" ? undefined : Number(rows);

  console.log(items);

  const loadHistory = useCallback(
    async (cursor?: string) => {
      const history = await getBetHistory({
        cursor,
        limit: betHistoryPageSize,
        rows: selectedRows,
      });

      setItems((currentItems) =>
        cursor ? [...currentItems, ...history.items] : history.items,
      );
      setNextCursor(history.nextCursor);
    },
    [selectedRows],
  );

  const visibleItems = useMemo(
    () => items.filter((item) => risk === "ALL" || item.risk === risk),
    [items, risk],
  );

  useEffect(() => {
    let isMounted = true;

    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError("");
      })
      .then(() => loadHistory())
      .catch((error) => {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Unable to load history",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadHistory]);

  async function handleLoadMore() {
    if (!nextCursor) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      await loadHistory(nextCursor);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load more history",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

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

        {error ? (
          <p className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-4 py-3 text-sm text-[#FDA4AF]">
            {error}
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
        ) : !error ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            No bets found.
          </div>
        ) : null}

        {nextCursor ? (
          <button
            className="self-center rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-5 py-2 text-sm font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoadingMore}
            onClick={handleLoadMore}
            type="button"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        ) : null}
      </section>
    </main>
  );
}
