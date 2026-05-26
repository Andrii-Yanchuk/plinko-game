import { useCallback, useEffect, useMemo, useRef } from "react";
import { LogoutButton } from "@/features/auth/logout/ui/LogoutButton";
import type { GameConfig, Risk } from "@/entities/game/model/types";
import type { ActiveRound } from "@/widgets/game-screen/model/activeRound";
import {
  getBoardHeight,
  getBucketLayout,
} from "@/widgets/plinko-board/lib/animation";
import { getBoardRows } from "@/widgets/plinko-board/lib/board";
import { getMultiplierTone } from "@/widgets/plinko-board/lib/multiplier";
import { HistoryButton } from "./HistoryButton";
import { PlinkoCanvas } from "./PlinkoCanvas";
import { UserBalance } from "@/entities/user/ui/UserBalance";

type PlinkoBoardProps = {
  activeRounds: ActiveRound[];
  config?: GameConfig;
  isAnimationEnabled: boolean;
  onRoundAnimationComplete: (roundId: string) => void;
  onPegImpact: () => void;
  risk: Risk;
  rows: number;
};

export function PlinkoBoard({
  activeRounds,
  config,
  isAnimationEnabled,
  onRoundAnimationComplete,
  onPegImpact,
  risk,
  rows,
}: PlinkoBoardProps) {
  const completedNoAnimationRoundIdsRef = useRef(new Set<string>());
  const noAnimationTimeoutIdsRef = useRef(new Map<string, number>());
  const multiplierSlots = config?.payoutTables[risk]?.[rows] ?? [];
  const boardRows = getBoardRows(config, rows);
  const visibleBucketIndexes = useMemo(
    () =>
      new Set(
        activeRounds
          .filter(
            (round) =>
              round.isResultVisible &&
              round.rows === rows &&
              round.risk === risk,
          )
          .map((round) => round.bet.bucketIndex),
      ),
    [activeRounds, risk, rows],
  );
  const { bucketGap, bucketWidth } = getBucketLayout(rows);
  const boardHeight = getBoardHeight(boardRows);

  const clearPendingNoAnimationTimeout = useCallback((roundId: string) => {
    const timeoutId = noAnimationTimeoutIdsRef.current.get(roundId);

    if (timeoutId === undefined) {
      return;
    }

    window.clearTimeout(timeoutId);
    noAnimationTimeoutIdsRef.current.delete(roundId);
    completedNoAnimationRoundIdsRef.current.delete(roundId);
  }, []);

  useEffect(() => {
    const activeRoundIds = new Set(activeRounds.map((round) => round.id));

    completedNoAnimationRoundIdsRef.current.forEach((roundId) => {
      if (!activeRoundIds.has(roundId)) {
        completedNoAnimationRoundIdsRef.current.delete(roundId);
      }
    });

    noAnimationTimeoutIdsRef.current.forEach((_, roundId) => {
      if (!activeRoundIds.has(roundId)) {
        clearPendingNoAnimationTimeout(roundId);
      }
    });

    if (isAnimationEnabled) {
      return;
    }

    activeRounds
      .filter((round) => !completedNoAnimationRoundIdsRef.current.has(round.id))
      .forEach((round) => {
        completedNoAnimationRoundIdsRef.current.add(round.id);

        const timeoutId = window.setTimeout(() => {
          noAnimationTimeoutIdsRef.current.delete(round.id);
          onRoundAnimationComplete(round.id);
        }, 0);

        noAnimationTimeoutIdsRef.current.set(round.id, timeoutId);
      });
  }, [
    activeRounds,
    clearPendingNoAnimationTimeout,
    isAnimationEnabled,
    onRoundAnimationComplete,
  ]);

  useEffect(
    () => () => {
      noAnimationTimeoutIdsRef.current.forEach((_, roundId) => {
        clearPendingNoAnimationTimeout(roundId);
      });
    },
    [clearPendingNoAnimationTimeout],
  );

  return (
    <div className="relative flex min-h-140 flex-1 flex-col overflow-hidden bg-[#101725]">
      <header className="flex h-14 items-center justify-between border-b border-[#222A3B]/80 px-5">
        <div className="flex items-center gap-5">
          <h1 className="text-2xl font-bold text-white">Plinko</h1>
          <UserBalance />
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-start px-4 pt-6">
        <div
          className="relative w-full max-w-160"
          style={{ height: boardHeight }}
        >
          <PlinkoCanvas
            activeRounds={activeRounds}
            boardRows={boardRows}
            isAnimationEnabled={isAnimationEnabled}
            onAnimationComplete={onRoundAnimationComplete}
            onPegImpact={onPegImpact}
            rows={rows}
          />

          <div
            className="absolute bottom-0 left-1/2 flex max-w-full -translate-x-1/2 justify-center"
            style={{ gap: bucketGap }}
          >
            {multiplierSlots.map((slot, index) => {
              const isActive = visibleBucketIndexes.has(index);

              return (
                <div
                  className={`flex h-8 items-center justify-center rounded-lg border px-1 text-[11px] font-bold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ${getMultiplierTone(slot, isActive)}`}
                  key={`${slot}-${index}`}
                  style={{ width: bucketWidth }}
                >
                  {slot}x
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
