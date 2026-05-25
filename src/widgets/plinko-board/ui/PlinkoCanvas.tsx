import { useEffect, useRef } from "react";
import { getCompletedImpactIndex } from "@/features/game-sound/lib/soundEvents";
import type { ActiveRound } from "@/widgets/game-screen/model/activeRound";
import {
  getBallPath,
  getBoardHeight,
  getBoardWidth,
} from "@/widgets/plinko-board/lib/animation";
import {
  configureCanvas,
  type BallFrame,
  drawPlinkoScene,
} from "@/widgets/plinko-board/lib/canvas/drawing";
import {
  getBallFrame,
  stepDurationMs,
} from "@/widgets/plinko-board/lib/canvas/physics";

type PlinkoCanvasProps = {
  activeRounds: ActiveRound[];
  boardRows: number;
  isAnimationEnabled: boolean;
  onAnimationComplete: (roundId: string) => void;
  onPegImpact: () => void;
  rows: number;
};

export function PlinkoCanvas({
  activeRounds,
  boardRows,
  isAnimationEnabled,
  onAnimationComplete,
  onPegImpact,
  rows,
}: PlinkoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedAtByRoundRef = useRef(new Map<string, number>());
  const lastImpactSoundIndexByRoundRef = useRef(new Map<string, number>());
  const completedRoundIdsRef = useRef(new Set<string>());
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const onPegImpactRef = useRef(onPegImpact);
  const boardHeight = getBoardHeight(boardRows);
  const boardWidth = getBoardWidth();

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    onPegImpactRef.current = onPegImpact;
  }, [onPegImpact]);

  useEffect(() => {
    const activeRoundIds = new Set(activeRounds.map((round) => round.id));

    startedAtByRoundRef.current.forEach((_, roundId) => {
      if (!activeRoundIds.has(roundId)) {
        startedAtByRoundRef.current.delete(roundId);
      }
    });

    lastImpactSoundIndexByRoundRef.current.forEach((_, roundId) => {
      if (!activeRoundIds.has(roundId)) {
        lastImpactSoundIndexByRoundRef.current.delete(roundId);
      }
    });

    completedRoundIdsRef.current.forEach((roundId) => {
      if (!activeRoundIds.has(roundId)) {
        completedRoundIdsRef.current.delete(roundId);
      }
    });
  }, [activeRounds]);

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

    if (!isAnimationEnabled) {
      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        boardRows,
        rows,
      });
      return;
    }

    function animate(timestamp: number) {
      const ballFrames: BallFrame[] = [];

      activeRounds.forEach((round) => {
        if (completedRoundIdsRef.current.has(round.id)) {
          return;
        }

        const ballPath = getBallPath(round.bet, rows, round.risk, boardRows);

        if (ballPath.length === 0) {
          completedRoundIdsRef.current.add(round.id);
          onAnimationCompleteRef.current(round.id);
          return;
        }

        if (!startedAtByRoundRef.current.has(round.id)) {
          startedAtByRoundRef.current.set(round.id, timestamp);
        }

        const startedAt = startedAtByRoundRef.current.get(round.id) ?? timestamp;
        const elapsedMs = timestamp - startedAt;
        const frame = getBallFrame(ballPath, elapsedMs);
        const impactSoundIndex = getCompletedImpactIndex(
          ballPath.length,
          elapsedMs,
          stepDurationMs,
        );

        if (
          impactSoundIndex !== null &&
          impactSoundIndex !==
            lastImpactSoundIndexByRoundRef.current.get(round.id) &&
          impactSoundIndex < ballPath.length - 1
        ) {
          lastImpactSoundIndexByRoundRef.current.set(round.id, impactSoundIndex);
          onPegImpactRef.current();
        }

        ballFrames.push(frame);

        if (frame.isComplete) {
          completedRoundIdsRef.current.add(round.id);
          onAnimationCompleteRef.current(round.id);
        }
      });

      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        boardRows,
        ballFrames,
        rows,
      });

      if (ballFrames.length === 0) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(animate);
    }

    drawPlinkoScene(renderingContext, {
      ...sceneSize,
      boardRows,
      ballFrames: activeRounds
        .map((round) => {
          const ballPath = getBallPath(round.bet, rows, round.risk, boardRows);

          return { ballPosition: ballPath[0] };
        })
        .filter(({ ballPosition }) => Boolean(ballPosition)),
      rows,
    });
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    activeRounds,
    boardHeight,
    boardWidth,
    boardRows,
    isAnimationEnabled,
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
