import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import type { GameConfig, Risk } from "@/entities/game/model/types";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import type { ActiveRound } from "@/widgets/game-screen/model/activeRound";
import {
  type BoardLayout,
  getBoardHeight,
  getBucketLayout,
} from "@/widgets/plinko-board/lib/animation";
import { getMultiplierTone } from "@/widgets/plinko-board/lib/multiplier";
import { PlinkoCanvas } from "./PlinkoCanvas";
import { PlinkoBoardHeader } from "./PlinkoBoardHeader";

type PlinkoBoardProps = {
  activeRounds: ActiveRound[];
  config?: GameConfig;
  isAnimationEnabled: boolean;
  onMobileMenuClick?: () => void;
  onRoundAnimationComplete: (roundId: string) => void;
  onPegImpact: () => void;
  risk: Risk;
  rows: number;
};

export const PlinkoBoard = memo(function PlinkoBoard({
  activeRounds,
  config,
  isAnimationEnabled,
  onMobileMenuClick,
  onRoundAnimationComplete,
  onPegImpact,
  risk,
  rows,
}: PlinkoBoardProps) {
  const completedNoAnimationRoundIdsRef = useRef(new Set<string>());
  const noAnimationTimeoutIdsRef = useRef(new Map<string, number>());
  const multiplierSlots = config?.payoutTables[risk]?.[rows] ?? [];
  const isPhoneBoard = useMediaQuery("(max-width: 767px)");
  const isTabletBoard = useMediaQuery("(max-width: 1023px)");
  const boardLayout: BoardLayout = isPhoneBoard
    ? "compact"
    : isTabletBoard
      ? "tablet"
      : "regular";
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
  const { bucketGap, bucketWidth } = getBucketLayout(rows, boardLayout);
  const boardHeight = getBoardHeight(rows, boardLayout);

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
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[#101725] md:min-h-140">
      <PlinkoBoardHeader onMobileMenuClick={onMobileMenuClick} />

      <div className="flex flex-1 flex-col items-center justify-start px-3 pt-6 pb-36 md:px-4 md:pb-0">
        <div
          className="relative w-full max-w-160 md:mt-0"
          style={{ height: boardHeight }}
        >
          <PlinkoCanvas
            activeRounds={activeRounds}
            isAnimationEnabled={isAnimationEnabled}
            layout={boardLayout}
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
                  className={`flex h-8 items-center justify-center rounded-lg border px-1 text-[11px] font-bold transition-[transform,box-shadow,background-color,border-color,color] duration-200 max-md:h-7 max-md:rounded-md max-md:px-0 max-md:text-[8px] ${getMultiplierTone(slot, isActive)}`}
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
})
