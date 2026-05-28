import { memo } from "react";
import type { Bet } from "@/entities/bet/model/types";
import { HistoryItem } from "./HistoryItem";

type HistoryListProps = {
  items: Bet[];
};

export const HistoryList = memo(function HistoryList({
  items,
}: HistoryListProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((bet) => (
        <HistoryItem bet={bet} key={bet.betId} />
      ))}
    </div>
  );
});
