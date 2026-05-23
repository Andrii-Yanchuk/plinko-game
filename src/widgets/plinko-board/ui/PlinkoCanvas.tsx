import { useEffect, useMemo, useRef } from "react";
import type { Bet } from "@/entities/bet/model/types";
import { getCompletedImpactIndex } from "@/features/game-sound/lib/soundEvents";
import {
  getBallPath,
  getBoardHeight,
  getBoardWidth,
} from "@/widgets/plinko-board/lib/animation";
import {
  configureCanvas,
  drawPlinkoScene,
} from "@/widgets/plinko-board/lib/canvas/drawing";
import {
  getBallFrame,
  stepDurationMs,
} from "@/widgets/plinko-board/lib/canvas/physics";
import type { Risk } from "@/entities/game/model/types";

type PlinkoCanvasProps = {
  boardRows: number;
  isAnimationEnabled: boolean;
  lastBet: Bet | null;
  onAnimationComplete: () => void;
  onPegImpact: () => void;
  risk: Risk;
  rows: number;
};

export function PlinkoCanvas({
  boardRows,
  isAnimationEnabled,
  lastBet,
  onAnimationComplete,
  onPegImpact,
  risk,
  rows,
}: PlinkoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastImpactSoundIndexRef = useRef<number | null>(null);
  const onPegImpactRef = useRef(onPegImpact);
  const boardHeight = getBoardHeight(boardRows);
  const boardWidth = getBoardWidth();
  const ballPath = useMemo(
    () => getBallPath(lastBet, rows, risk, boardRows),
    [boardRows, lastBet, risk, rows],
  );

  useEffect(() => {
    onPegImpactRef.current = onPegImpact;
  }, [onPegImpact]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = configureCanvas(canvas, {
      height: boardHeight,
      width: boardWidth,
    });

    if (!context) {
      return;
    }

    const renderingContext: CanvasRenderingContext2D = context;
    const sceneSize = { height: boardHeight, width: boardWidth };
    let animationFrameId = 0;
    let startedAt: number | null = null;
    lastImpactSoundIndexRef.current = null;

    if (!isAnimationEnabled) {
      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        boardRows,
        rows,
      });
      return;
    }

    if (ballPath.length === 0) {
      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        boardRows,
        rows,
      });
      onAnimationComplete();
      return;
    }

    function animate(timestamp: number) {
      startedAt ??= timestamp;

      const elapsedMs = timestamp - startedAt;
      const frame = getBallFrame(ballPath, elapsedMs);
      const impactSoundIndex = getCompletedImpactIndex(
        ballPath.length,
        elapsedMs,
        stepDurationMs,
      );

      if (
        impactSoundIndex !== null &&
        impactSoundIndex !== lastImpactSoundIndexRef.current &&
        impactSoundIndex < ballPath.length - 1
      ) {
        lastImpactSoundIndexRef.current = impactSoundIndex;
        onPegImpactRef.current();
      }

      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        boardRows,
        rows,
        ...frame,
      });

      if (frame.isComplete) {
        onAnimationComplete();
        return;
      }

      animationFrameId = window.requestAnimationFrame(animate);
    }

    drawPlinkoScene(renderingContext, {
      ...sceneSize,
      ballPosition: ballPath[0],
      boardRows,
      rows,
    });
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    ballPath,
    boardHeight,
    boardWidth,
    boardRows,
    isAnimationEnabled,
    onAnimationComplete,
    rows,
  ]);

  return (
    <canvas
      aria-label="Plinko board"
      className="absolute left-1/2 top-0 -translate-x-1/2"
      height={boardHeight}
      ref={canvasRef}
      width={boardWidth}
    />
  );
}
