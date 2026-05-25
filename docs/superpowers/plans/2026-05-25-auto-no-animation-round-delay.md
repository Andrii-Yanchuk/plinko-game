# Auto No-Animation Round Delay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 500ms result-processing delay between auto-play bets when the falling ball animation is disabled, while leaving basket/result transitions unchanged.

**Architecture:** Keep `useAutoPlay` as the sequential business loop that waits for `placeBet()`. Pass the mode that started each bet through the existing `onBetPlaced` callback, compute the per-round result pause in `GameScreen`, and store that pause on the active round ref so setting changes cannot affect an in-flight round.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, TanStack Query.

---

## File Structure

- Create `src/widgets/game-screen/lib/roundTiming.ts`
  - Owns named timing constants and the pure `getRoundResultPauseMs()` decision.
  - Keeps the 500ms auto/no-animation rule separate from React lifecycle code.

- Modify `src/features/place-bet/model/usePlaceBet.ts`
  - Adds a `PlaceBetContext` type with `mode: GameMode`.
  - Adds a `context` argument to `placeBet()` so callers can tell `onBetPlaced()` which mode started the round.

- Modify `src/widgets/game-sidebar/ui/GameSidebar.tsx`
  - Passes `{ mode: "Manual" }` for manual bets.
  - Wraps auto-play `placeBet` so every auto bet passes `{ mode: "Auto" }`.

- Modify `src/widgets/game-screen/ui/GameScreen.tsx`
  - Stores `resultPauseMs` in `roundCompletionRef`.
  - Computes `resultPauseMs` once in `handleBetPlaced()` from the round context and current `animationsEnabled`.
  - Uses stored `resultPauseMs` when resolving the round.

- No changes to `src/widgets/plinko-board/ui/PlinkoBoard.tsx`
  - The existing no-animation behavior already completes the visual round immediately.
  - Basket CSS transitions remain untouched.

---

### Task 1: Add Round Timing Helper

**Files:**
- Create: `src/widgets/game-screen/lib/roundTiming.ts`

- [ ] **Step 1: Create the helper module**

Create `src/widgets/game-screen/lib/roundTiming.ts` with this exact content:

```ts
import type { GameMode } from "@/entities/game/model/types";

export const defaultRoundResultPauseMs = 1000;
export const autoNoAnimationRoundResultPauseMs = 500;

type RoundTimingParams = {
  animationsEnabled: boolean;
  mode: GameMode;
};

export function getRoundResultPauseMs({
  animationsEnabled,
  mode,
}: RoundTimingParams) {
  if (mode === "Auto" && !animationsEnabled) {
    return autoNoAnimationRoundResultPauseMs;
  }

  return defaultRoundResultPauseMs;
}
```

- [ ] **Step 2: Run build to verify the new module compiles**

Run:

```bash
npm run build
```

Expected: `next build` completes successfully.

- [ ] **Step 3: Commit timing helper**

Run:

```bash
git add src/widgets/game-screen/lib/roundTiming.ts
git commit -m "feat: add round timing helper"
```

---

### Task 2: Thread Round Mode Through Bet Placement

**Files:**
- Modify: `src/features/place-bet/model/usePlaceBet.ts`
- Modify: `src/widgets/game-sidebar/ui/GameSidebar.tsx`

- [ ] **Step 1: Update `usePlaceBet` to accept round context**

Replace `src/features/place-bet/model/usePlaceBet.ts` with:

```ts
import { useMutation } from "@tanstack/react-query";
import { placeBet } from "@/entities/bet/api/betsApi";
import type { Bet, PlaceBetPayload } from "@/entities/bet/model/types";
import type { GameMode } from "@/entities/game/model/types";

export type PlaceBetContext = {
  mode: GameMode;
};

type UsePlaceBetParams = {
  onBetAmountSettled: (amount: string) => void;
  onBetPlaced: (bet: Bet, context: PlaceBetContext) => Promise<void> | void;
};

export function usePlaceBet({
  onBetAmountSettled,
  onBetPlaced,
}: UsePlaceBetParams) {
  const mutation = useMutation({
    mutationFn: placeBet,
  });

  async function placeBetWithContext(
    payload: PlaceBetPayload,
    context: PlaceBetContext,
  ) {
    const bet = await mutation.mutateAsync(payload);

    onBetAmountSettled((Number(bet.amount) / 1_000_000).toFixed(2));
    await onBetPlaced(bet, context);

    return bet;
  }

  return {
    isPending: mutation.isPending,
    placeBet: placeBetWithContext,
  };
}
```

- [ ] **Step 2: Update `GameSidebar` prop type and place-bet calls**

In `src/widgets/game-sidebar/ui/GameSidebar.tsx`, add this import:

```ts
import type { PlaceBetContext } from "@/features/place-bet/model/usePlaceBet";
```

Change the `onBetPlaced` prop type from:

```ts
onBetPlaced: (bet: Bet) => Promise<void> | void;
```

to:

```ts
onBetPlaced: (bet: Bet, context: PlaceBetContext) => Promise<void> | void;
```

Change the auto-play hook setup from:

```ts
const autoPlay = useAutoPlay({
  placeBet: placeBetMutation.placeBet,
});
```

to:

```ts
const autoPlay = useAutoPlay({
  placeBet: (payload) =>
    placeBetMutation.placeBet(payload, {
      mode: "Auto",
    }),
});
```

Change the manual bet call from:

```ts
await placeBetMutation.placeBet({
  amount,
  rows,
  risk,
});
```

to:

```ts
await placeBetMutation.placeBet(
  {
    amount,
    rows,
    risk,
  },
  {
    mode: "Manual",
  },
);
```

- [ ] **Step 3: Run build to verify all `placeBet` call sites were updated**

Run:

```bash
npm run build
```

Expected: build succeeds. If it fails with `Expected 2 arguments, but got 1`, update the remaining caller to pass a `PlaceBetContext`.

- [ ] **Step 4: Commit callback context changes**

Run:

```bash
git add src/features/place-bet/model/usePlaceBet.ts src/widgets/game-sidebar/ui/GameSidebar.tsx
git commit -m "feat: pass game mode with placed bets"
```

---

### Task 3: Store Per-Round Result Pause In GameScreen

**Files:**
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`

- [ ] **Step 1: Import timing helper and callback context type**

In `src/widgets/game-screen/ui/GameScreen.tsx`, add:

```ts
import type { PlaceBetContext } from "@/features/place-bet/model/usePlaceBet";
import { getRoundResultPauseMs } from "@/widgets/game-screen/lib/roundTiming";
```

Remove:

```ts
const roundResultPauseMs = 1000;
```

- [ ] **Step 2: Store the pause duration on the active round**

Change the `roundCompletionRef` type from:

```ts
const roundCompletionRef = useRef<{
  betId: string;
  resolve: () => void;
} | null>(null);
```

to:

```ts
const roundCompletionRef = useRef<{
  betId: string;
  resolve: () => void;
  resultPauseMs: number;
} | null>(null);
```

- [ ] **Step 3: Use the stored pause when completing the round**

Inside `handleBetAnimationComplete`, change:

```ts
void delay(roundResultPauseMs).then(() => {
  roundCompletionRef.current = null;
  setIsRoundPlaying(false);
  pendingRound.resolve();
});
```

to:

```ts
void delay(pendingRound.resultPauseMs).then(() => {
  roundCompletionRef.current = null;
  setIsRoundPlaying(false);
  pendingRound.resolve();
});
```

- [ ] **Step 4: Compute the result pause when the bet is placed**

Change `handleBetPlaced` from:

```ts
const handleBetPlaced = useCallback((bet: Bet) => {
  gameSound.playBetStart();
  setIsRoundPlaying(true);
  setLastBet(bet);

  return new Promise<void>((resolve) => {
    roundCompletionRef.current = {
      betId: bet.betId,
      resolve,
    };
  });
}, [gameSound]);
```

to:

```ts
const handleBetPlaced = useCallback((bet: Bet, context: PlaceBetContext) => {
  gameSound.playBetStart();
  setIsRoundPlaying(true);
  setLastBet(bet);

  return new Promise<void>((resolve) => {
    roundCompletionRef.current = {
      betId: bet.betId,
      resolve,
      resultPauseMs: getRoundResultPauseMs({
        animationsEnabled,
        mode: context.mode,
      }),
    };
  });
}, [animationsEnabled, gameSound]);
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit round pause lifecycle change**

Run:

```bash
git add src/widgets/game-screen/ui/GameScreen.tsx
git commit -m "feat: pace auto rounds without ball animation"
```

---

### Task 4: Verify Gameplay Behavior

**Files:**
- No source edits expected.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: `next build` completes successfully.

- [ ] **Step 3: Start the local app**

Run:

```bash
npm run dev
```

Expected: Next starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 4: Manually verify manual mode with animations enabled**

In the browser:

1. Open the game screen.
2. Set mode to `Manual`.
3. Open settings and enable `Animations`.
4. Place one bet.

Expected: the ball falls through the board, the result bucket highlights, result sounds play if sound is enabled, and the sidebar unlocks after the normal result pause.

- [ ] **Step 5: Manually verify manual mode with animations disabled**

In the browser:

1. Set mode to `Manual`.
2. Open settings and disable `Animations`.
3. Place one bet.

Expected: no falling ball animation plays, the result bucket appears immediately, basket/result transition styling remains visible, and the sidebar unlocks after about 1000ms.

- [ ] **Step 6: Manually verify auto mode with animations enabled**

In the browser:

1. Set mode to `Auto`.
2. Enable `Animations`.
3. Set `Number of Bets` to `3`.
4. Start auto play.

Expected: each bet waits for the falling ball animation and result pause before the next bet starts.

- [ ] **Step 7: Manually verify auto mode with animations disabled**

In the browser:

1. Set mode to `Auto`.
2. Disable `Animations`.
3. Set `Number of Bets` to `3`.
4. Start auto play.

Expected: each result appears immediately, basket/result transitions remain, and the next bet starts after about 500ms instead of instantly.

- [ ] **Step 8: Manually verify stop behavior**

In the browser:

1. Stay in `Auto`.
2. Keep `Animations` disabled.
3. Start at least `10` auto bets.
4. Click the stop button during playback.

Expected: the current bet finishes, the 500ms no-animation auto pause completes, and auto-play stops before placing another bet.

- [ ] **Step 9: Commit verification-only updates if any were needed**

If verification required source changes, commit them:

```bash
git add src/features/place-bet/model/usePlaceBet.ts src/widgets/game-sidebar/ui/GameSidebar.tsx src/widgets/game-screen/ui/GameScreen.tsx src/widgets/game-screen/lib/roundTiming.ts
git commit -m "fix: verify auto no-animation pacing"
```

If no source changes were needed, do not create an empty commit.

---

## Self-Review

- Spec coverage: The plan implements the 500ms auto/no-animation delay, preserves manual timing, leaves basket transitions untouched, and keeps auto-play waiting for round completion.
- Placeholder scan: The plan contains no unfinished markers or unspecified implementation steps.
- Type consistency: `PlaceBetContext` uses the existing `GameMode` type, `GameSidebar` passes context to `usePlaceBet`, and `GameScreen` consumes the same context when computing `resultPauseMs`.
