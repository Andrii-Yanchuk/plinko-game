# Manual Concurrent Rounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow manual mode to display up to 10 returned Plinko rounds at once while auto mode remains sequential.

**Architecture:** `GameScreen` will own an array of active displayed rounds and enforce the manual display cap. `PlinkoBoard` and `PlinkoCanvas` will render multiple active balls and independently report animation completion per round. `GameSidebar` will stop treating an active manual animation as a disabled state unless the cap is full.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, TanStack Query, Canvas 2D.

---

## File Structure

- Create `src/widgets/game-screen/model/activeRound.ts`
  - Owns the `ActiveRound` type, the `manualRoundLimit` constant, and a helper for creating immutable round presentation records.

- Modify `src/widgets/game-screen/ui/GameScreen.tsx`
  - Replaces the single round completion ref with `activeRounds`.
  - Keeps auto-play sequential by returning a promise only for auto rounds.
  - Enforces the manual active-round cap through props passed to `GameSidebar`.

- Modify `src/widgets/game-sidebar/ui/GameSidebar.tsx`
  - Receives manual active count and limit.
  - Passes the new control state into `useGameSidebarActions` and `BetActionButton`.

- Modify `src/widgets/game-sidebar/model/useGameSidebarActions.ts`
  - Separates request-pending state from active manual presentation state.
  - Keeps Bet enabled during manual animations while fewer than 10 active rounds exist.
  - Locks rows/risk/mode while manual rounds are active.

- Modify `src/widgets/game-sidebar/ui/BetActionButton.tsx`
  - Shows `Playing... (N/10)` in manual mode while active rounds exist.
  - Disables manual Bet only while a request is pending or the active-round cap is full.

- Modify `src/widgets/plinko-board/ui/PlinkoBoard.tsx`
  - Accepts `activeRounds`.
  - Tracks multiple visible result buckets.
  - Completes no-animation rounds immediately while keeping result pause cleanup in `GameScreen`.

- Modify `src/widgets/plinko-board/ui/PlinkoCanvas.tsx`
  - Animates multiple active rounds in one requestAnimationFrame loop.
  - Reports completion by active round id.

- Modify `src/widgets/plinko-board/lib/canvas/drawing.ts`
  - Draws multiple balls and impact rings in one scene render.

---

### Task 1: Add Active Round Model

**Files:**
- Create: `src/widgets/game-screen/model/activeRound.ts`

- [ ] **Step 1: Create the active round model**

Create `src/widgets/game-screen/model/activeRound.ts` with:

```ts
import type { Bet } from "@/entities/bet/model/types";
import type { GameMode, Risk, RoundContext } from "@/entities/game/model/types";
import { getRoundResultPauseMs } from "@/widgets/game-screen/lib/roundTiming";

export const manualRoundLimit = 10;

export type ActiveRound = {
  animationKey: string;
  bet: Bet;
  id: string;
  isResultVisible: boolean;
  mode: GameMode;
  resultPauseMs: number;
  risk: Risk;
  rows: number;
};

type CreateActiveRoundParams = {
  animationsEnabled: boolean;
  bet: Bet;
  context: RoundContext;
};

export function createActiveRound({
  animationsEnabled,
  bet,
  context,
}: CreateActiveRoundParams): ActiveRound {
  return {
    animationKey: `${bet.betId}:${JSON.stringify(bet.path)}:${bet.rows}:${bet.risk}`,
    bet,
    id: `${context.mode}:${bet.betId}`,
    isResultVisible: false,
    mode: context.mode,
    resultPauseMs: getRoundResultPauseMs({
      animationsEnabled,
      mode: context.mode,
    }),
    risk: bet.risk,
    rows: bet.rows,
  };
}
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds and the new module type-checks.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/widgets/game-screen/model/activeRound.ts
git commit -m "feat: add active round model"
```

---

### Task 2: Teach Canvas Drawing to Render Multiple Balls

**Files:**
- Modify: `src/widgets/plinko-board/lib/canvas/drawing.ts`

- [ ] **Step 1: Replace drawing scene params**

Replace `src/widgets/plinko-board/lib/canvas/drawing.ts` with:

```ts
import {
  getPegPosition,
  getPegRadius,
  type BallPosition,
} from "@/widgets/plinko-board/lib/animation";

type CanvasSize = {
  height: number;
  width: number;
};

export type BallFrame = {
  ballPosition?: BallPosition;
  impactPosition?: BallPosition;
  impactProgress?: number;
};

type DrawSceneParams = CanvasSize & {
  ballFrames?: BallFrame[];
  boardRows: number;
  rows: number;
};

export function configureCanvas(canvas: HTMLCanvasElement, size: CanvasSize) {
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = size.width * pixelRatio;
  canvas.height = size.height * pixelRatio;
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  return context;
}

function drawPeg(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  radius: number,
) {
  context.save();
  context.shadowBlur = 10;
  context.shadowColor = "rgba(150, 163, 181, 0.35)";
  context.fillStyle = "#96A3B5";
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawBall(context: CanvasRenderingContext2D, position: BallPosition) {
  const gradient = context.createRadialGradient(
    position.x - 3,
    position.y - 4,
    1,
    position.x,
    position.y,
    9,
  );

  gradient.addColorStop(0, "#B9FFE1");
  gradient.addColorStop(0.45, "#00E783");
  gradient.addColorStop(1, "#009B58");

  context.save();
  context.shadowBlur = 18;
  context.shadowColor = "rgba(0, 231, 131, 0.75)";
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(position.x, position.y, 8, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawImpact(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  progress: number,
) {
  const radius = 6 + progress * 10;

  context.save();
  context.globalAlpha = 1 - progress;
  context.strokeStyle = "#00E783";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

export function drawPlinkoScene(
  context: CanvasRenderingContext2D,
  {
    ballFrames = [],
    boardRows,
    height,
    rows,
    width,
  }: DrawSceneParams,
) {
  context.clearRect(0, 0, width, height);

  const pegRadius = getPegRadius(rows, boardRows);

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let pegIndex = 0; pegIndex < rowIndex + 2; pegIndex += 1) {
      drawPeg(
        context,
        getPegPosition(rowIndex, pegIndex, rows, boardRows),
        pegRadius,
      );
    }
  }

  ballFrames.forEach(({ impactPosition, impactProgress = 1 }) => {
    if (impactPosition && impactProgress < 1) {
      drawImpact(context, impactPosition, impactProgress);
    }
  });

  ballFrames.forEach(({ ballPosition }) => {
    if (ballPosition) {
      drawBall(context, ballPosition);
    }
  });
}
```

- [ ] **Step 2: Run build to see current caller failures**

Run:

```bash
npm run build
```

Expected: build fails in `PlinkoCanvas.tsx` because it still passes `ballPosition`, `impactPosition`, and `impactProgress` directly. This failure is expected and confirms callers must move to `ballFrames`.

- [ ] **Step 3: Commit after Task 3 instead of now**

Do not commit this task by itself because the app will not compile until `PlinkoCanvas` is updated in Task 3.

---

### Task 3: Convert PlinkoCanvas to Multi-Round Animation

**Files:**
- Modify: `src/widgets/plinko-board/ui/PlinkoCanvas.tsx`
- Modify: `src/widgets/plinko-board/lib/canvas/drawing.ts`

- [ ] **Step 1: Replace PlinkoCanvas**

Replace `src/widgets/plinko-board/ui/PlinkoCanvas.tsx` with:

```tsx
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
  drawPlinkoScene,
  type BallFrame,
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
  const completedRoundIdsRef = useRef(new Set<string>());
  const lastImpactSoundIndexByRoundRef = useRef(new Map<string, number>());
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const onPegImpactRef = useRef(onPegImpact);
  const startedAtByRoundRef = useRef(new Map<string, number>());
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

    Array.from(startedAtByRoundRef.current.keys()).forEach((roundId) => {
      if (!activeRoundIds.has(roundId)) {
        startedAtByRoundRef.current.delete(roundId);
      }
    });

    Array.from(lastImpactSoundIndexByRoundRef.current.keys()).forEach(
      (roundId) => {
        if (!activeRoundIds.has(roundId)) {
          lastImpactSoundIndexByRoundRef.current.delete(roundId);
        }
      },
    );

    Array.from(completedRoundIdsRef.current).forEach((roundId) => {
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

    if (!isAnimationEnabled || activeRounds.length === 0) {
      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        boardRows,
        rows,
      });
      return;
    }

    function markComplete(roundId: string) {
      if (completedRoundIdsRef.current.has(roundId)) {
        return;
      }

      completedRoundIdsRef.current.add(roundId);
      onAnimationCompleteRef.current(roundId);
    }

    function animate(timestamp: number) {
      const ballFrames: BallFrame[] = [];

      activeRounds.forEach((round) => {
        const ballPath = getBallPath(round.bet, rows, round.risk, boardRows);

        if (ballPath.length === 0) {
          markComplete(round.id);
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
        const lastImpactSoundIndex =
          lastImpactSoundIndexByRoundRef.current.get(round.id);

        if (
          impactSoundIndex !== null &&
          impactSoundIndex !== lastImpactSoundIndex &&
          impactSoundIndex < ballPath.length - 1
        ) {
          lastImpactSoundIndexByRoundRef.current.set(round.id, impactSoundIndex);
          onPegImpactRef.current();
        }

        ballFrames.push(frame);

        if (frame.isComplete) {
          markComplete(round.id);
        }
      });

      drawPlinkoScene(renderingContext, {
        ...sceneSize,
        ballFrames,
        boardRows,
        rows,
      });

      animationFrameId = window.requestAnimationFrame(animate);
    }

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    activeRounds,
    boardHeight,
    boardRows,
    boardWidth,
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
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build fails in `PlinkoBoard.tsx` because it still passes the old `lastBet` and one-argument completion props to `PlinkoCanvas`.

- [ ] **Step 3: Commit after Task 4 instead of now**

Do not commit this task by itself because the app will not compile until `PlinkoBoard` is updated.

---

### Task 4: Convert PlinkoBoard to Active Rounds

**Files:**
- Modify: `src/widgets/plinko-board/ui/PlinkoBoard.tsx`
- Modify: `src/widgets/plinko-board/ui/PlinkoCanvas.tsx`
- Modify: `src/widgets/plinko-board/lib/canvas/drawing.ts`

- [ ] **Step 1: Replace PlinkoBoard**

Replace `src/widgets/plinko-board/ui/PlinkoBoard.tsx` with:

```tsx
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
  onBetAnimationComplete: (roundId: string) => void;
  onPegImpact: () => void;
  risk: Risk;
  rows: number;
};

export function PlinkoBoard({
  activeRounds,
  config,
  isAnimationEnabled,
  onBetAnimationComplete,
  onPegImpact,
  risk,
  rows,
}: PlinkoBoardProps) {
  const completedNoAnimationRoundIdsRef = useRef(new Set<string>());
  const multiplierSlots = config?.payoutTables[risk]?.[rows] ?? [];
  const boardRows = getBoardRows(config, rows);
  const visibleBucketIndexes = useMemo(
    () =>
      new Set(
        activeRounds
          .filter((round) => round.isResultVisible)
          .map((round) => round.bet.bucketIndex),
      ),
    [activeRounds],
  );
  const { bucketGap, bucketWidth } = getBucketLayout(rows);
  const boardHeight = getBoardHeight(boardRows);

  const handleAnimationComplete = useCallback(
    (roundId: string) => {
      onBetAnimationComplete(roundId);
    },
    [onBetAnimationComplete],
  );

  useEffect(() => {
    const activeRoundIds = new Set(activeRounds.map((round) => round.id));

    Array.from(completedNoAnimationRoundIdsRef.current).forEach((roundId) => {
      if (!activeRoundIds.has(roundId)) {
        completedNoAnimationRoundIdsRef.current.delete(roundId);
      }
    });
  }, [activeRounds]);

  useEffect(() => {
    if (isAnimationEnabled) {
      return;
    }

    const timeoutIds = activeRounds
      .filter((round) => !completedNoAnimationRoundIdsRef.current.has(round.id))
      .map((round) =>
        window.setTimeout(() => {
          completedNoAnimationRoundIdsRef.current.add(round.id);
          handleAnimationComplete(round.id);
        }, 0),
      );

    return () => {
      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, [activeRounds, handleAnimationComplete, isAnimationEnabled]);

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
            activeRounds={activeRounds}
            boardRows={boardRows}
            isAnimationEnabled={isAnimationEnabled}
            onAnimationComplete={handleAnimationComplete}
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
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build fails in `GameScreen.tsx` because it still passes `lastBet` to `PlinkoBoard` and expects `onBetAnimationComplete` to receive a `Bet`.

- [ ] **Step 3: Commit canvas and board changes after Task 5**

Do not commit yet because the app still does not compile.

---

### Task 5: Move Round Lifecycle Into GameScreen

**Files:**
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`
- Modify: `src/widgets/plinko-board/ui/PlinkoBoard.tsx`
- Modify: `src/widgets/plinko-board/ui/PlinkoCanvas.tsx`
- Modify: `src/widgets/plinko-board/lib/canvas/drawing.ts`

- [ ] **Step 1: Replace GameScreen**

Replace `src/widgets/game-screen/ui/GameScreen.tsx` with:

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "@/entities/bet/model/types";
import { getGameConfig } from "@/entities/game/api/gameApi";
import type { RoundContext } from "@/entities/game/model/types";
import type { CurrentUser } from "@/entities/user/model/types";
import { useGameSound } from "@/features/game-sound/model/useGameSound";
import {
  createActiveRound,
  manualRoundLimit,
  type ActiveRound,
} from "@/widgets/game-screen/model/activeRound";
import { GameSidebar } from "@/widgets/game-sidebar/ui/GameSidebar";
import { PlinkoBoard } from "@/widgets/plinko-board/ui/PlinkoBoard";
import { delay } from "@/shared/lib/delay";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useFullscreen } from "@/shared/lib/useFullscreen";
import { useGameScreenStore } from "@/widgets/game-screen/model/useGameScreenStore";

export function GameScreen() {
  const queryClient = useQueryClient();
  const autoRoundCompletionRef = useRef<{
    roundId: string;
    resolve: () => void;
  } | null>(null);
  const {
    elementRef: gameScreenRef,
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLElement>();
  const [activeRounds, setActiveRounds] = useState<ActiveRound[]>([]);
  const [lastBet, setLastBet] = useState<Bet | null>(null);
  const animationsEnabled = useGameScreenStore(
    (state) => state.animationsEnabled,
  );
  const rows = useGameScreenStore((state) => state.rows);
  const risk = useGameScreenStore((state) => state.risk);
  const soundEnabled = useGameScreenStore((state) => state.soundEnabled);
  const setAnimationsEnabled = useGameScreenStore(
    (state) => state.setAnimationsEnabled,
  );
  const setRows = useGameScreenStore((state) => state.setRows);
  const setRisk = useGameScreenStore((state) => state.setRisk);
  const setSoundEnabled = useGameScreenStore((state) => state.setSoundEnabled);
  const gameSound = useGameSound(soundEnabled);
  const { data: gameConfig } = useQuery({
    queryFn: getGameConfig,
    queryKey: queryKeys.gameConfig,
  });
  const activeManualRoundCount = activeRounds.filter(
    (round) => round.mode === "Manual",
  ).length;

  const handleBetPresentationComplete = useCallback(
    (roundId: string) => {
      const completedRound = activeRounds.find((round) => round.id === roundId);

      if (!completedRound || completedRound.isResultVisible) {
        return;
      }

      gameSound.playBucketHit();
      gameSound.playResult(completedRound.bet);

      queryClient.setQueryData<CurrentUser>(
        queryKeys.currentUser,
        (currentUser) =>
          currentUser
            ? { ...currentUser, balance: completedRound.bet.balanceAfter }
            : currentUser,
      );

      setActiveRounds((currentRounds) =>
        currentRounds.map((round) =>
          round.id === roundId ? { ...round, isResultVisible: true } : round,
        ),
      );

      void delay(completedRound.resultPauseMs).then(() => {
        setActiveRounds((currentRounds) =>
          currentRounds.filter((round) => round.id !== roundId),
        );

        if (autoRoundCompletionRef.current?.roundId === roundId) {
          autoRoundCompletionRef.current.resolve();
          autoRoundCompletionRef.current = null;
        }
      });
    },
    [activeRounds, gameSound, queryClient],
  );

  const handleBetPlaced = useCallback(
    (bet: Bet, context: RoundContext) => {
      gameSound.playBetStart();
      setLastBet(bet);

      const activeRound = createActiveRound({
        animationsEnabled,
        bet,
        context,
      });

      setActiveRounds((currentRounds) => [...currentRounds, activeRound]);

      if (context.mode === "Manual") {
        return;
      }

      return new Promise<void>((resolve) => {
        autoRoundCompletionRef.current = {
          resolve,
          roundId: activeRound.id,
        };
      });
    },
    [animationsEnabled, gameSound],
  );

  return (
    <section
      ref={gameScreenRef}
      className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col"
    >
      <GameSidebar
        activeManualRoundCount={activeManualRoundCount}
        animationsEnabled={animationsEnabled}
        config={gameConfig}
        isFullscreen={isFullscreen}
        lastBet={lastBet}
        manualRoundLimit={manualRoundLimit}
        onAnimationsChange={setAnimationsEnabled}
        onBetPlaced={handleBetPlaced}
        onFullscreenClick={toggleFullscreen}
        onRiskChange={setRisk}
        onRowsChange={setRows}
        onSoundChange={setSoundEnabled}
        risk={risk}
        rows={rows}
        soundEnabled={soundEnabled}
      />
      <PlinkoBoard
        activeRounds={activeRounds}
        config={gameConfig}
        isAnimationEnabled={animationsEnabled}
        onBetAnimationComplete={handleBetPresentationComplete}
        onPegImpact={gameSound.playPegHit}
        risk={risk}
        rows={rows}
      />
    </section>
  );
}
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build fails in `GameSidebar.tsx` because new props are not declared or forwarded yet.

- [ ] **Step 3: Commit after Task 6**

Do not commit yet because the app still does not compile.

---

### Task 6: Update Sidebar State and Button Behavior

**Files:**
- Modify: `src/widgets/game-sidebar/ui/GameSidebar.tsx`
- Modify: `src/widgets/game-sidebar/model/useGameSidebarActions.ts`
- Modify: `src/widgets/game-sidebar/ui/BetActionButton.tsx`
- Modify: all files changed in Tasks 2-5

- [ ] **Step 1: Replace BetActionButton**

Replace `src/widgets/game-sidebar/ui/BetActionButton.tsx` with:

```tsx
import type { GameMode } from "@/entities/game/model/types";

type BetActionButtonProps = {
  activeManualRoundCount: number;
  autoProgress: {
    current: number;
    total: number;
  };
  isAutoPlaying: boolean;
  isAutoStopping: boolean;
  isManualBetDisabled: boolean;
  isManualRequestPending: boolean;
  manualRoundLimit: number;
  mode: GameMode;
  onClick: () => void;
};

function LoadingButtonContent({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      {children}
    </span>
  );
}

export function BetActionButton({
  activeManualRoundCount,
  autoProgress,
  isAutoPlaying,
  isAutoStopping,
  isManualBetDisabled,
  isManualRequestPending,
  manualRoundLimit,
  mode,
  onClick,
}: BetActionButtonProps) {
  const className = isAutoPlaying
    ? "mt-4 h-11 cursor-pointer rounded-lg bg-[#E7000B] text-[18px] font-bold text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90"
    : "mt-4 h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[18px] font-bold text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";
  const isManualPlaying = activeManualRoundCount > 0;

  return (
    <button
      className={className}
      disabled={
        mode === "Auto" ? isAutoStopping : isManualBetDisabled
      }
      onClick={onClick}
      type="button"
    >
      {isAutoPlaying ? (
        isAutoStopping ? (
          <LoadingButtonContent>Stopping...</LoadingButtonContent>
        ) : (
          `STOP (${autoProgress.current}/${autoProgress.total})`
        )
      ) : mode === "Auto" ? (
        "Start Auto"
      ) : isManualRequestPending ? (
        <LoadingButtonContent>Playing...</LoadingButtonContent>
      ) : isManualPlaying ? (
        `Playing... (${activeManualRoundCount}/${manualRoundLimit})`
      ) : (
        "Bet"
      )}
    </button>
  );
}
```

- [ ] **Step 2: Replace useGameSidebarActions**

Replace `src/widgets/game-sidebar/model/useGameSidebarActions.ts` with:

```ts
import type { KeyboardEvent } from "react";
import type { Bet } from "@/entities/bet/model/types";
import type {
  BetControl,
  GameConfig,
  Risk,
  RoundContext,
} from "@/entities/game/model/types";
import { getNextBetAmount } from "@/entities/game/lib/amount";
import { isBlockedNumberInputKey } from "@/entities/game/lib/input";
import { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
import { useGameSidebarConfig } from "@/widgets/game-sidebar/model/useGameSidebarConfig";
import { useGameSidebarStore } from "@/widgets/game-sidebar/model/useGameSidebarStore";

type UseGameSidebarActionsParams = {
  activeManualRoundCount: number;
  config?: GameConfig;
  manualRoundLimit: number;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
  risk: Risk;
  rows: number;
};

export function useGameSidebarActions({
  activeManualRoundCount,
  config,
  manualRoundLimit,
  onBetPlaced,
  risk,
  rows,
}: UseGameSidebarActionsParams) {
  const selectedMode = useGameSidebarStore((state) => state.selectedMode);
  const betAmount = useGameSidebarStore((state) => state.betAmount);
  const autoBetCount = useGameSidebarStore((state) => state.autoBetCount);
  const stopOnProfit = useGameSidebarStore((state) => state.stopOnProfit);
  const stopOnLoss = useGameSidebarStore((state) => state.stopOnLoss);
  const error = useGameSidebarStore((state) => state.error);
  const setSelectedMode = useGameSidebarStore(
    (state) => state.setSelectedMode,
  );
  const setBetAmount = useGameSidebarStore((state) => state.setBetAmount);
  const setAutoBetCount = useGameSidebarStore(
    (state) => state.setAutoBetCount,
  );
  const setStopOnProfit = useGameSidebarStore(
    (state) => state.setStopOnProfit,
  );
  const setStopOnLoss = useGameSidebarStore((state) => state.setStopOnLoss);
  const setError = useGameSidebarStore((state) => state.setError);
  const clearError = useGameSidebarStore((state) => state.clearError);
  const {
    availableRisks,
    getValidatedBetAmount,
    maxBetAmount,
    maxRows,
    minBetAmount,
    minRows,
    rowsProgress,
    validationMessage,
  } = useGameSidebarConfig(config, rows);
  const placeBetMutation = usePlaceBet({
    onBetAmountSettled: setBetAmount,
    onBetPlaced,
  });
  const autoPlay = useAutoPlay({
    placeBet: (payload) => placeBetMutation.placeBet(payload, { mode: "Auto" }),
  });
  const hasActiveManualRounds = activeManualRoundCount > 0;
  const isManualRoundLimitReached =
    activeManualRoundCount >= manualRoundLimit;
  const isManualRequestPending =
    selectedMode === "Manual" && placeBetMutation.isPending;

  function handleBetAmountKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isBlockedNumberInputKey(event.key)) {
      event.preventDefault();
    }
  }

  function handleBetControlClick(control: BetControl) {
    const nextBetAmount = getNextBetAmount(
      betAmount,
      control,
      minBetAmount,
      maxBetAmount,
    );

    if (nextBetAmount === null) {
      return;
    }

    setBetAmount(nextBetAmount);
  }

  async function handleBetClick() {
    if (selectedMode === "Auto" || isManualRoundLimitReached) {
      return;
    }

    const amount = getValidatedBetAmount(betAmount);

    if (!amount) {
      setError(validationMessage);
      return;
    }

    clearError();

    try {
      await placeBetMutation.placeBet(
        {
          amount,
          rows,
          risk,
        },
        { mode: "Manual" },
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to place bet");
    }
  }

  async function handleStartAutoPlay() {
    const amount = getValidatedBetAmount(betAmount);

    if (!amount) {
      setError(validationMessage);
      return;
    }

    clearError();

    try {
      await autoPlay.start({
        amount,
        numberOfBets: autoBetCount,
        risk,
        rows,
        stopOnLoss,
        stopOnProfit,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to auto play");
    }
  }

  function handleMainButtonClick() {
    if (autoPlay.isPlaying) {
      if (!autoPlay.isStopping) {
        autoPlay.stop();
      }
      return;
    }

    if (selectedMode === "Auto") {
      void handleStartAutoPlay();
      return;
    }

    void handleBetClick();
  }

  const isManualBetDisabled =
    isManualRequestPending || isManualRoundLimitReached;
  const isSidebarDisabled =
    autoPlay.isPlaying ||
    placeBetMutation.isPending ||
    hasActiveManualRounds;

  return {
    autoPlay,
    availableRisks,
    autoBetCount,
    betAmount,
    error,
    handleBetAmountKeyDown,
    handleBetControlClick,
    handleMainButtonClick,
    isManualBetDisabled,
    isManualRequestPending,
    isSidebarDisabled,
    maxRows,
    minRows,
    rowsProgress,
    selectedMode,
    setAutoBetCount,
    setBetAmount,
    setSelectedMode,
    setStopOnLoss,
    setStopOnProfit,
    stopOnLoss,
    stopOnProfit,
  };
}
```

- [ ] **Step 3: Replace GameSidebar**

Replace `src/widgets/game-sidebar/ui/GameSidebar.tsx` with:

```tsx
"use client";

import type { Bet } from "@/entities/bet/model/types";
import type {
  GameConfig,
  Risk,
  RoundContext,
} from "@/entities/game/model/types";
import { useGameSidebarActions } from "@/widgets/game-sidebar/model/useGameSidebarActions";
import { AutoPlayControls } from "./AutoPlayControls";
import { BetActionButton } from "./BetActionButton";
import { BetAmountControl } from "./BetAmountControl";
import { LastBetSummary } from "./LastBetSummary";
import { ModeToggle } from "./ModeToggle";
import { RiskSelector } from "./RiskSelector";
import { RowsSelector } from "./RowsSelector";
import { SidebarFooter } from "./SidebarFooter";

type GameSidebarProps = {
  activeManualRoundCount: number;
  animationsEnabled: boolean;
  config?: GameConfig;
  lastBet: Bet | null;
  manualRoundLimit: number;
  onAnimationsChange: (enabled: boolean) => void;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
  onFullscreenClick: () => void;
  onRiskChange: (risk: Risk) => void;
  onRowsChange: (rows: number) => void;
  onSoundChange: (enabled: boolean) => void;
  isFullscreen: boolean;
  risk: Risk;
  rows: number;
  soundEnabled: boolean;
};

export function GameSidebar({
  activeManualRoundCount,
  animationsEnabled,
  config,
  isFullscreen,
  lastBet,
  manualRoundLimit,
  onAnimationsChange,
  onBetPlaced,
  onFullscreenClick,
  onRiskChange,
  onRowsChange,
  onSoundChange,
  risk,
  rows,
  soundEnabled,
}: GameSidebarProps) {
  const {
    autoPlay,
    availableRisks,
    autoBetCount,
    betAmount,
    error,
    handleBetAmountKeyDown,
    handleBetControlClick,
    handleMainButtonClick,
    isManualBetDisabled,
    isManualRequestPending,
    isSidebarDisabled,
    maxRows,
    minRows,
    rowsProgress,
    selectedMode,
    setAutoBetCount,
    setBetAmount,
    setSelectedMode,
    setStopOnLoss,
    setStopOnProfit,
    stopOnLoss,
    stopOnProfit,
  } = useGameSidebarActions({
    activeManualRoundCount,
    config,
    manualRoundLimit,
    onBetPlaced,
    risk,
    rows,
  });

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#252D3E] bg-[#1A1F2ECC]/80 p-4 md:w-69.5 md:border-r md:border-b-0">
      <ModeToggle
        disabled={isSidebarDisabled}
        mode={selectedMode}
        onModeChange={setSelectedMode}
      />

      <BetAmountControl
        amount={betAmount}
        disabled={isManualRequestPending}
        onAmountChange={setBetAmount}
        onBetControlClick={handleBetControlClick}
        onKeyDown={handleBetAmountKeyDown}
      />

      <RiskSelector
        availableRisks={availableRisks}
        disabled={isSidebarDisabled}
        onRiskChange={onRiskChange}
        risk={risk}
      />

      <RowsSelector
        maxRows={maxRows}
        disabled={isSidebarDisabled}
        minRows={minRows}
        onRowsChange={onRowsChange}
        rows={rows}
        rowsProgress={rowsProgress}
      />

      {selectedMode === "Auto" ? (
        <AutoPlayControls
          autoBetCount={autoBetCount}
          disabled={isSidebarDisabled}
          isAutoPlaying={autoPlay.isPlaying}
          onAutoBetCountChange={setAutoBetCount}
          onKeyDown={handleBetAmountKeyDown}
          onStopOnLossChange={setStopOnLoss}
          onStopOnProfitChange={setStopOnProfit}
          stopOnLoss={stopOnLoss}
          stopOnProfit={stopOnProfit}
        />
      ) : null}

      <BetActionButton
        activeManualRoundCount={activeManualRoundCount}
        autoProgress={autoPlay.progress}
        isAutoPlaying={autoPlay.isPlaying}
        isAutoStopping={autoPlay.isStopping}
        isManualBetDisabled={isManualBetDisabled}
        isManualRequestPending={isManualRequestPending}
        manualRoundLimit={manualRoundLimit}
        mode={selectedMode}
        onClick={handleMainButtonClick}
      />

      {error ? (
        <p className="mt-3 rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 px-3 py-2 text-xs font-medium text-[#FDA4AF]">
          {error}
        </p>
      ) : null}

      <LastBetSummary lastBet={lastBet} />
      <SidebarFooter
        animationsEnabled={animationsEnabled}
        isFullscreen={isFullscreen}
        onAnimationsChange={onAnimationsChange}
        onFullscreenClick={onFullscreenClick}
        onSoundChange={onSoundChange}
        soundEnabled={soundEnabled}
      />
    </aside>
  );
}
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/widgets/game-screen/model/activeRound.ts src/widgets/game-screen/ui/GameScreen.tsx src/widgets/game-sidebar/model/useGameSidebarActions.ts src/widgets/game-sidebar/ui/BetActionButton.tsx src/widgets/game-sidebar/ui/GameSidebar.tsx src/widgets/plinko-board/lib/canvas/drawing.ts src/widgets/plinko-board/ui/PlinkoBoard.tsx src/widgets/plinko-board/ui/PlinkoCanvas.tsx
git commit -m "feat: support concurrent manual rounds"
```

---

### Task 7: Manual Browser Verification

**Files:**
- No source edits expected.

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Next starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Verify manual overlap**

In the browser:

1. Open the game screen.
2. Set mode to `Manual`.
3. Enable animations.
4. Click Bet.
5. As soon as the button stops showing request-loading state, click Bet again before the first ball reaches the bucket.

Expected: at least two balls are visible falling at the same time, the button shows `Playing... (N/10)`, and the button remains enabled while `N < 10`.

- [ ] **Step 3: Verify cap behavior**

In the browser:

1. Keep manual mode and animations enabled.
2. Repeatedly click Bet as soon as each response returns until the active counter reaches `10/10`.

Expected: button shows `Playing... (10/10)`, becomes disabled, and does not send another request until at least one active round finishes.

- [ ] **Step 4: Verify locked controls**

In the browser while at least one manual round is active:

1. Try changing mode, rows, and risk.
2. Try toggling animations in settings.
3. Try editing bet amount.

Expected: mode, rows, risk, and animations are locked; bet amount remains editable while no request is pending.

- [ ] **Step 5: Verify no-animation manual behavior**

In the browser:

1. Wait for active rounds to finish.
2. Disable animations.
3. Place a manual bet.

Expected: no ball falls, the result bucket appears immediately, the button shows `Playing... (1/10)` during the result pause, and the slot frees after the result pause.

- [ ] **Step 6: Verify auto mode remains sequential**

In the browser:

1. Wait for active manual rounds to finish.
2. Set mode to `Auto`.
3. Set number of bets to `3`.
4. Start auto-play.

Expected: auto-play still waits for each round presentation before placing the next bet and still shows `STOP (current/total)`.

- [ ] **Step 7: Run final build**

Run:

```bash
npm run build
```

Expected: production build succeeds.

- [ ] **Step 8: Commit verification fixes only if needed**

If browser verification required code changes, commit them:

```bash
git add src/widgets/game-screen/model/activeRound.ts src/widgets/game-screen/ui/GameScreen.tsx src/widgets/game-sidebar/model/useGameSidebarActions.ts src/widgets/game-sidebar/ui/BetActionButton.tsx src/widgets/game-sidebar/ui/GameSidebar.tsx src/widgets/plinko-board/lib/canvas/drawing.ts src/widgets/plinko-board/ui/PlinkoBoard.tsx src/widgets/plinko-board/ui/PlinkoCanvas.tsx
git commit -m "fix: polish concurrent manual rounds"
```

If no source changes were needed, do not create an empty commit.

---

## Self-Review

- Spec coverage: Tasks cover active manual round cap, manual button text and enabled state, multi-ball rendering, independent completion, row/risk locking, no-animation behavior, balance updates, and unchanged sequential auto-play.
- Placeholder scan: The plan has no `TBD`, `TODO`, or unspecified implementation steps. Each code-changing step includes exact replacement code.
- Type consistency: `ActiveRound.id` is used consistently as the animation completion key, `manualRoundLimit` is passed from `GameScreen` into sidebar and button props, and `RoundContext.mode` controls manual versus auto completion semantics.
