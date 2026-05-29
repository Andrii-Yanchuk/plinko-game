import { useCallback, useEffect, useRef } from "react";
import { getCompletedImpactIndex } from "@/features/game-sound/lib/soundEvents";
import type { ActiveRound } from "@/widgets/game-screen/model/activeRound";
import {
  type BoardLayout,
  getBallPath,
  getBoardHeight,
  getBoardWidth,
} from "@/widgets/plinko-board/lib/animation";
import {
  configureCanvas,
  type BallFrame,
  drawBallLayer,
  drawPegLayer,
} from "@/widgets/plinko-board/lib/canvas/drawing";
import {
  getBallFrame,
  stepDurationMs,
} from "@/widgets/plinko-board/lib/canvas/physics";

type PlinkoCanvasProps = {
  activeRounds: ActiveRound[];
  isAnimationEnabled: boolean;
  layout?: BoardLayout;
  onAnimationComplete: (roundId: string) => void;
  onPegImpact: () => void;
  rows: number;
};

export function PlinkoCanvas({
  activeRounds,
  isAnimationEnabled,
  layout = "regular",
  onAnimationComplete,
  onPegImpact,
  rows,
}: PlinkoCanvasProps) {
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const ballCanvasRef = useRef<HTMLCanvasElement>(null);
  const ballContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const activeRoundsRef = useRef(activeRounds);
  const startedAtByRoundRef = useRef(new Map<string, number>());
  const lastImpactSoundIndexByRoundRef = useRef(new Map<string, number>());
  const completedRoundIdsRef = useRef(new Set<string>());
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const onPegImpactRef = useRef(onPegImpact);
  const animationFrameRef = useRef(0);
  const isLoopRunningRef = useRef(false);
  const runFrameRef = useRef<(timestamp: number) => void>(() => {});
  const boardHeight = getBoardHeight(rows, layout);
  const boardWidth = getBoardWidth(layout);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    onPegImpactRef.current = onPegImpact;
  }, [onPegImpact]);

  // Keep the loop's view of rounds current without restarting it. Declared
  // before the loop-kick effect so the ref is fresh when that effect runs.
  useEffect(() => {
    activeRoundsRef.current = activeRounds;
  }, [activeRounds]);

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

  const runFrame = useCallback(
    (timestamp: number) => {
      const ballContext = ballContextRef.current;

      if (!ballContext) {
        isLoopRunningRef.current = false;
        return;
      }

      const ballFrames: BallFrame[] = [];

      activeRoundsRef.current.forEach((round) => {
        if (completedRoundIdsRef.current.has(round.id)) {
          return;
        }

        const ballPath = getBallPath(round.bet, rows, round.risk, layout);

        if (ballPath.length === 0) {
          completedRoundIdsRef.current.add(round.id);
          onAnimationCompleteRef.current(round.id);
          return;
        }

        if (!startedAtByRoundRef.current.has(round.id)) {
          startedAtByRoundRef.current.set(round.id, timestamp);
        }

        const startedAt =
          startedAtByRoundRef.current.get(round.id) ?? timestamp;
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

      drawBallLayer(ballContext, {
        ballFrames,
        height: boardHeight,
        layout,
        rows,
        width: boardWidth,
      });

      if (ballFrames.length === 0) {
        isLoopRunningRef.current = false;
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(
        runFrameRef.current,
      );
    },
    [boardHeight, boardWidth, layout, rows],
  );

  // Indirect through a ref so the loop can reschedule itself without the
  // callback referencing its own binding.
  useEffect(() => {
    runFrameRef.current = runFrame;
  }, [runFrame]);

  const startLoopIfNeeded = useCallback(() => {
    if (isLoopRunningRef.current) {
      return;
    }

    const hasPendingRound = activeRoundsRef.current.some(
      (round) => !completedRoundIdsRef.current.has(round.id),
    );

    if (!hasPendingRound) {
      return;
    }

    isLoopRunningRef.current = true;
    animationFrameRef.current = window.requestAnimationFrame(
      runFrameRef.current,
    );
  }, []);

  // Static peg layer: redrawn only when the board geometry changes.
  useEffect(() => {
    const canvas = staticCanvasRef.current;

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

    drawPegLayer(context, {
      height: boardHeight,
      layout,
      rows,
      width: boardWidth,
    });
  }, [boardHeight, boardWidth, layout, rows]);

  // Ball layer: configured on geometry change only, then driven by the
  // ref-based loop so round updates never reconfigure the canvas.
  useEffect(() => {
    const canvas = ballCanvasRef.current;

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

    ballContextRef.current = context;

    if (!isAnimationEnabled) {
      context.clearRect(0, 0, boardWidth, boardHeight);
      return;
    }

    startLoopIfNeeded();

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      isLoopRunningRef.current = false;
    };
  }, [boardHeight, boardWidth, isAnimationEnabled, layout, rows, startLoopIfNeeded]);

  // Kick the loop when new rounds arrive after it has gone idle.
  useEffect(() => {
    if (!isAnimationEnabled) {
      return;
    }

    startLoopIfNeeded();
  }, [activeRounds, isAnimationEnabled, startLoopIfNeeded]);

  return (
    <>
      <canvas
        aria-label="Plinko board"
        className="absolute left-1/2 top-0 -translate-x-1/2"
        height={boardHeight}
        ref={staticCanvasRef}
        width={boardWidth}
      />
      <canvas
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        height={boardHeight}
        ref={ballCanvasRef}
        width={boardWidth}
      />
    </>
  );
}
