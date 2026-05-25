# Round Flow Readability Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the no-animation auto-play round flow by improving names, moving shared round context to the game model, and extracting sidebar bet/action logic out of the render component.

**Architecture:** Keep the existing gameplay behavior unchanged. Move shared domain-ish types to `entities/game`, keep `usePlaceBet` focused on bet mutation orchestration, and move sidebar command logic into a widget model hook so `GameSidebar` reads mostly as composition.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, TanStack Query.

---

## File Structure

- Modify `src/entities/game/model/types.ts`
  - Add `RoundContext`, the shared context passed from sidebar bet actions to game-screen round presentation.

- Modify `src/features/place-bet/model/usePlaceBet.ts`
  - Import `RoundContext` from the game model.
  - Remove the locally exported `PlaceBetContext`.

- Create `src/widgets/game-sidebar/model/useGameSidebarActions.ts`
  - Own manual bet submission, auto-play start/stop, main button dispatch, bet amount control, and numeric key filtering.
  - Return handlers and state needed by `GameSidebar`.

- Modify `src/widgets/game-sidebar/ui/GameSidebar.tsx`
  - Remove local command functions and hook orchestration.
  - Call `useGameSidebarActions()` and pass returned values to UI children.

- Modify `src/widgets/game-screen/ui/GameScreen.tsx`
  - Rename animation-specific handler names to visual/presentation names.
  - Import `RoundContext` from the game model.

- No regular expression changes are needed.
  - A source scan found no actual regex APIs in `src`: no `new RegExp`, `.test(`, `.match(`, `.replace(`, `.replaceAll(`, or `.split(/`.

---

### Task 1: Move Round Context Type To Game Model

**Files:**
- Modify: `src/entities/game/model/types.ts`
- Modify: `src/features/place-bet/model/usePlaceBet.ts`
- Modify: `src/widgets/game-sidebar/ui/GameSidebar.tsx`
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`

- [ ] **Step 1: Add `RoundContext` to the game model**

In `src/entities/game/model/types.ts`, change the file to:

```ts
export type BetControl = "1/2" | "2x" | "MAX";
export type GameMode = "Manual" | "Auto";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

export type RoundContext = {
  mode: GameMode;
};

export type GameConfig = {
  rows: number[];
  risks: Risk[];
  minBet: string;
  maxBet: string;
  payoutTables: Record<Risk, Record<number, number[]>>;
};
```

- [ ] **Step 2: Update `usePlaceBet` to use `RoundContext`**

In `src/features/place-bet/model/usePlaceBet.ts`, remove:

```ts
import type { GameMode } from "@/entities/game/model/types";

export type PlaceBetContext = {
  mode: GameMode;
};
```

Add:

```ts
import type { RoundContext } from "@/entities/game/model/types";
```

Change:

```ts
onBetPlaced: (bet: Bet, context: PlaceBetContext) => Promise<void> | void;
```

to:

```ts
onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
```

Change:

```ts
context: PlaceBetContext,
```

to:

```ts
context: RoundContext,
```

- [ ] **Step 3: Update consumers to import `RoundContext`**

In `src/widgets/game-sidebar/ui/GameSidebar.tsx`, remove the grouped import:

```ts
import {
  type PlaceBetContext,
  usePlaceBet,
} from "@/features/place-bet/model/usePlaceBet";
```

Replace it with:

```ts
import type { RoundContext } from "@/entities/game/model/types";
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
```

Change:

```ts
onBetPlaced: (bet: Bet, context: PlaceBetContext) => Promise<void> | void;
```

to:

```ts
onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
```

In `src/widgets/game-screen/ui/GameScreen.tsx`, remove:

```ts
import type { PlaceBetContext } from "@/features/place-bet/model/usePlaceBet";
```

Add `RoundContext` to the game model import:

```ts
import type { RoundContext } from "@/entities/game/model/types";
```

Change:

```ts
const handleBetPlaced = useCallback((bet: Bet, context: PlaceBetContext) => {
```

to:

```ts
const handleBetPlaced = useCallback((bet: Bet, context: RoundContext) => {
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit context cleanup**

Run:

```bash
git add src/entities/game/model/types.ts src/features/place-bet/model/usePlaceBet.ts src/widgets/game-sidebar/ui/GameSidebar.tsx src/widgets/game-screen/ui/GameScreen.tsx
git commit -m "refactor: move round context to game model"
```

---

### Task 2: Rename Visual Completion Handler

**Files:**
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`

- [ ] **Step 1: Rename the handler**

In `src/widgets/game-screen/ui/GameScreen.tsx`, rename:

```ts
const handleBetAnimationComplete = useCallback((bet: Bet) => {
```

to:

```ts
const handleBetPresentationComplete = useCallback((bet: Bet) => {
```

Change the prop passed to `PlinkoBoard` from:

```tsx
onBetAnimationComplete={handleBetAnimationComplete}
```

to:

```tsx
onBetAnimationComplete={handleBetPresentationComplete}
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit naming cleanup**

Run:

```bash
git add src/widgets/game-screen/ui/GameScreen.tsx
git commit -m "refactor: clarify round presentation completion naming"
```

---

### Task 3: Extract Sidebar Bet Actions Into A Model Hook

**Files:**
- Create: `src/widgets/game-sidebar/model/useGameSidebarActions.ts`
- Modify: `src/widgets/game-sidebar/ui/GameSidebar.tsx`

- [ ] **Step 1: Create `useGameSidebarActions`**

Create `src/widgets/game-sidebar/model/useGameSidebarActions.ts` with:

```ts
import type { KeyboardEvent } from "react";
import type { Bet } from "@/entities/bet/model/types";
import type { BetControl, GameConfig, Risk, RoundContext } from "@/entities/game/model/types";
import { getNextBetAmount } from "@/entities/game/lib/amount";
import { isBlockedNumberInputKey } from "@/entities/game/lib/input";
import { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
import { useGameSidebarConfig } from "@/widgets/game-sidebar/model/useGameSidebarConfig";
import { useGameSidebarStore } from "@/widgets/game-sidebar/model/useGameSidebarStore";

type UseGameSidebarActionsParams = {
  config?: GameConfig;
  isRoundPlaying: boolean;
  onBetPlaced: (bet: Bet, context: RoundContext) => Promise<void> | void;
  risk: Risk;
  rows: number;
};

export function useGameSidebarActions({
  config,
  isRoundPlaying,
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
  const setSelectedMode = useGameSidebarStore((state) => state.setSelectedMode);
  const setBetAmount = useGameSidebarStore((state) => state.setBetAmount);
  const setAutoBetCount = useGameSidebarStore((state) => state.setAutoBetCount);
  const setStopOnProfit = useGameSidebarStore((state) => state.setStopOnProfit);
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
    if (selectedMode === "Auto") {
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

  const isManualPlaying =
    selectedMode === "Manual" && (placeBetMutation.isPending || isRoundPlaying);
  const isSidebarDisabled = placeBetMutation.isPending || isRoundPlaying;

  return {
    autoPlay,
    availableRisks,
    autoBetCount,
    betAmount,
    error,
    handleBetAmountKeyDown,
    handleBetControlClick,
    handleMainButtonClick,
    isManualPlaying,
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

- [ ] **Step 2: Simplify `GameSidebar` imports**

In `src/widgets/game-sidebar/ui/GameSidebar.tsx`, remove these imports:

```ts
import type { KeyboardEvent } from "react";
import type { BetControl, GameConfig, Risk, RoundContext } from "@/entities/game/model/types";
import { getNextBetAmount } from "@/entities/game/lib/amount";
import { isBlockedNumberInputKey } from "@/entities/game/lib/input";
import { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
import { useGameSidebarConfig } from "@/widgets/game-sidebar/model/useGameSidebarConfig";
import { useGameSidebarStore } from "@/widgets/game-sidebar/model/useGameSidebarStore";
```

Replace them with:

```ts
import type { Bet } from "@/entities/bet/model/types";
import type { GameConfig, Risk, RoundContext } from "@/entities/game/model/types";
import { useGameSidebarActions } from "@/widgets/game-sidebar/model/useGameSidebarActions";
```

- [ ] **Step 3: Replace local state/action setup in `GameSidebar`**

In `src/widgets/game-sidebar/ui/GameSidebar.tsx`, delete everything from:

```ts
const selectedMode = useGameSidebarStore((state) => state.selectedMode);
```

through:

```ts
const isSidebarDisabled = placeBetMutation.isPending || isRoundPlaying;
```

Replace it with:

```ts
const {
  autoPlay,
  availableRisks,
  autoBetCount,
  betAmount,
  error,
  handleBetAmountKeyDown,
  handleBetControlClick,
  handleMainButtonClick,
  isManualPlaying,
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
  config,
  isRoundPlaying,
  onBetPlaced,
  risk,
  rows,
});
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: no unused import or hook errors.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit sidebar extraction**

Run:

```bash
git add src/widgets/game-sidebar/model/useGameSidebarActions.ts src/widgets/game-sidebar/ui/GameSidebar.tsx
git commit -m "refactor: extract game sidebar actions"
```

---

### Task 4: Final Review And Verification

**Files:**
- No source edits expected.

- [ ] **Step 1: Confirm there are no regex APIs in `src`**

Run:

```bash
rg -n "new RegExp|\\.test\\(|\\.match\\(|\\.replace\\(|\\.replaceAll\\(|\\.split\\(/" src
```

Expected: no output and exit code `1`, meaning no matches were found.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Manual behavior check**

In the browser at `http://localhost:3000/game`:

1. Set mode to `Manual`, enable animations, place a bet.
2. Set mode to `Manual`, disable animations, place a bet.
3. Set mode to `Auto`, disable animations, run `3` bets.

Expected:
- Manual animated round still shows the falling ball.
- Manual no-animation round still shows the result bucket immediately.
- Auto no-animation rounds continue one at a time with the 500ms pacing delay.
- Basket/result transitions remain unchanged.

---

## Self-Review

- Spec coverage: The plan addresses the three review findings: large sidebar component, animation-specific naming, and context type placement. The positive note about stored `resultPauseMs` is intentionally excluded.
- Placeholder scan: The plan contains no unfinished markers or unspecified implementation steps.
- Type consistency: `RoundContext` is defined once in `entities/game/model/types.ts` and used by `usePlaceBet`, `GameSidebar`, and `GameScreen`.
