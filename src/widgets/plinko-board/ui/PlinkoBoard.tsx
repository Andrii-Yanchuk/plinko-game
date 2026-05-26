import { useCallback, useEffect, useMemo, useRef } from "react";
import { Menu } from "lucide-react";
import { LogoutButton } from "@/features/auth/logout/ui/LogoutButton";
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
import { UserBalance } from "@/entities/user/ui/UserBalance";

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

export function PlinkoBoard({
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
  const isMobileBoard = useMediaQuery("(max-width: 767px)");
  const boardLayout: BoardLayout = isMobileBoard ? "compact" : "regular";
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
      <header className="flex h-12 items-center justify-between border-b border-[#222A3B]/80 px-3 md:h-14 md:px-5">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <button
            aria-label="Open bet controls"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#D1D5DC] transition-colors hover:bg-[#222A3D] md:hidden"
            onClick={onMobileMenuClick}
            type="button"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-white md:text-2xl">Plinko</h1>
          <UserBalance />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <LogoutButton />
        </div>
      </header>

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
}
