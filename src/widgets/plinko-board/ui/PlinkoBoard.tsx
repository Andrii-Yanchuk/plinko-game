import { useCallback, useEffect, useMemo, useState } from "react";
import { LogoutButton } from "@/features/auth/logout/ui/LogoutButton";
import type { Bet } from "@/entities/bet/model/types";
import type { GameConfig, Risk } from "@/entities/game/model/types";
import { getBallPath, getBoardHeight, getBucketLayout } from "@/widgets/plinko-board/lib/animation";
import { getBetAnimationKey, getBoardRows } from "@/widgets/plinko-board/lib/board";
import { getMultiplierTone } from "@/widgets/plinko-board/lib/multiplier";
import { HistoryButton } from "./HistoryButton";
import { PlinkoCanvas } from "./PlinkoCanvas";
import { UserBalance } from "@/entities/user/ui/UserBalance";

type PlinkoBoardProps = {
  config?: GameConfig;
  isAnimationEnabled: boolean;
  lastBet: Bet | null;
  onBetAnimationComplete: (bet: Bet) => void;
  onPegImpact: () => void;
  risk: Risk;
  rows: number;
};

export function PlinkoBoard({
  config,
  isAnimationEnabled,
  lastBet,
  onBetAnimationComplete,
  onPegImpact,
  risk,
  rows,
}: PlinkoBoardProps) {
  const [completedAnimationKey, setCompletedAnimationKey] = useState("");
  const multiplierSlots = config?.payoutTables[risk]?.[rows] ?? [];
  const boardRows = getBoardRows(config, rows);
  const activeBucketIndex =
    lastBet?.rows === rows && lastBet.risk === risk ? lastBet.bucketIndex : null;
  const animationKey = getBetAnimationKey(
    lastBet,
    rows,
    risk,
    activeBucketIndex,
  );
  const ballPath = useMemo(
    () => getBallPath(lastBet, rows, risk, boardRows),
    [boardRows, lastBet, risk, rows],
  );
  const hasFinishedBallAnimation =
    ballPath.length === 0 || completedAnimationKey === animationKey;
  const shouldAnimateBall =
    isAnimationEnabled &&
    Boolean(animationKey) &&
    completedAnimationKey !== animationKey;
  const visibleBucketIndex = hasFinishedBallAnimation
    ? activeBucketIndex
    : null;
  const { bucketGap, bucketWidth } = getBucketLayout(rows);
  const boardHeight = getBoardHeight(boardRows);

  const handleAnimationComplete = useCallback(() => {
    setCompletedAnimationKey(animationKey);

    if (lastBet && animationKey) {
      onBetAnimationComplete(lastBet);
    }
  }, [animationKey, lastBet, onBetAnimationComplete]);

  useEffect(() => {
    if (isAnimationEnabled || !animationKey || completedAnimationKey === animationKey) {
      return;
    }

    const timeoutId = window.setTimeout(handleAnimationComplete, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    animationKey,
    completedAnimationKey,
    handleAnimationComplete,
    isAnimationEnabled,
  ]);

  return (
    <div className="relative flex min-h-140 flex-1 flex-col overflow-hidden bg-[#101725]">
      <header className="flex h-14 items-center justify-between border-b border-[#222A3B]/80 px-5">
        <div className="flex items-center gap-5">
          <h1 className="text-2xl font-bold text-white">Plinko</h1>
          <UserBalance />
        </div>
        <div className="flex items-center gap-3">
          <HistoryButton />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-start px-4 pt-24">
        <div
          className="relative w-full max-w-160"
          style={{ height: boardHeight }}
        >
          <PlinkoCanvas
            boardRows={boardRows}
            isAnimationEnabled={shouldAnimateBall}
            lastBet={lastBet}
            onAnimationComplete={handleAnimationComplete}
            onPegImpact={onPegImpact}
            risk={risk}
            rows={rows}
          />

          <div
            className="absolute bottom-0 left-1/2 flex max-w-full -translate-x-1/2 justify-center"
            style={{ gap: bucketGap }}
          >
            {multiplierSlots.map((slot, index) => {
              const isActive = visibleBucketIndex === index;

              return (
                <div
                  className={`flex h-8 items-center justify-center rounded-lg border px-1 text-[11px] font-bold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ${getMultiplierTone(index, multiplierSlots.length, isActive)}`}
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
