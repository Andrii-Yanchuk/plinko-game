# Manual Concurrent Rounds Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans if executing this plan task-by-task.

**Goal:** In manual mode, allow a new bet after the previous server response returns while up to 10 returned rounds continue animating on the board. Auto mode stays sequential.

**Approach:** Replace the single active round with an active-round list owned by `GameScreen`. Render all active manual balls in one canvas animation loop. Keep the sidebar clickable during manual animations unless a request is pending or the 10-round display cap is full.

---

## Files

- Create `src/widgets/game-screen/model/activeRound.ts`
  - `manualRoundLimit = 10`
  - `ActiveRound` type
  - `createActiveRound()` helper

- Modify `src/widgets/game-screen/ui/GameScreen.tsx`
  - Own `activeRounds`
  - Add manual rounds and return immediately
  - Keep auto rounds awaitable
  - Remove completed rounds after result pause
  - Pass active count and limit into sidebar

- Modify `src/widgets/plinko-board/ui/PlinkoBoard.tsx`
  - Accept `activeRounds`
  - Highlight multiple result buckets
  - Complete no-animation rounds immediately

- Modify `src/widgets/plinko-board/ui/PlinkoCanvas.tsx`
  - Render multiple active balls in one `requestAnimationFrame` loop
  - Track per-round start time, peg sound index, and completion

- Modify `src/widgets/plinko-board/lib/canvas/drawing.ts`
  - Change scene drawing from one ball/impact to `ballFrames[]`

- Modify `src/widgets/game-sidebar/model/useGameSidebarActions.ts`
  - Disable Bet only when manual request is pending or `activeManualRoundCount >= 10`
  - Lock mode/rows/risk/settings while a manual request is pending or manual rounds are active
  - Keep bet amount editable while active rounds exist and no request is pending

- Modify `src/widgets/game-sidebar/ui/GameSidebar.tsx`
  - Thread manual active count and limit to actions/button

- Modify `src/widgets/game-sidebar/ui/BetActionButton.tsx`
  - Show `Playing... (N/10)` while manual rounds are active
  - Keep button enabled while `N < 10` and no request is pending

---

## Task 1: Active Round Lifecycle

Create `activeRound.ts` with the active round type and helper.

Recommended shape:

```ts
export const manualRoundLimit = 10;

export type ActiveRound = {
  id: string;
  bet: Bet;
  mode: GameMode;
  rows: number;
  risk: Risk;
  resultPauseMs: number;
  isResultVisible: boolean;
};
```

In `GameScreen.tsx`:

- Replace `isRoundPlaying` and `roundCompletionRef` with `activeRounds`.
- Keep one `autoRoundCompletionRef` for the currently awaited auto round.
- On bet placed:
  - play bet-start sound
  - set `lastBet`
  - append an `ActiveRound`
  - return immediately for manual mode
  - return a promise for auto mode
- On animation complete:
  - mark that round result-visible
  - play bucket/result sounds
  - update balance from `bet.balanceAfter`
  - after `resultPauseMs`, remove the round
  - resolve auto promise only if the completed round is the active auto round

Acceptance:

- Manual `placeBet()` resolves after the server response and append, not after animation.
- Auto `placeBet()` still resolves after full presentation.
- Balance updates once per completed round.

Commit:

```bash
git add src/widgets/game-screen/model/activeRound.ts src/widgets/game-screen/ui/GameScreen.tsx
git commit -m "feat: track active plinko rounds"
```

---

## Task 2: Multi-Ball Board Rendering

Update canvas drawing to accept multiple frames:

```ts
export type BallFrame = {
  ballPosition?: BallPosition;
  impactPosition?: BallPosition;
  impactProgress?: number;
};
```

`drawPlinkoScene()` should:

- clear the canvas
- draw pegs once
- draw all impact rings
- draw all balls

Update `PlinkoCanvas.tsx`:

- Accept `activeRounds: ActiveRound[]`.
- Keep maps/sets in refs for:
  - round start time
  - last peg sound index per round
  - completed round ids
- In one animation loop:
  - compute each round path with `getBallPath(round.bet, rows, round.risk, boardRows)`
  - compute frame with `getBallFrame()`
  - emit peg sounds per round
  - call `onAnimationComplete(round.id)` once when complete
  - render all current frames together

Update `PlinkoBoard.tsx`:

- Pass `activeRounds` to `PlinkoCanvas`.
- Use `round.isResultVisible` to highlight all visible result buckets.
- When animations are disabled, complete each new active round with `setTimeout(..., 0)`.

Acceptance:

- Two or more active rounds can animate simultaneously.
- Result buckets can remain highlighted independently during their pauses.
- No-animation mode still shows the bucket immediately.

Commit:

```bash
git add src/widgets/plinko-board/lib/canvas/drawing.ts src/widgets/plinko-board/ui/PlinkoCanvas.tsx src/widgets/plinko-board/ui/PlinkoBoard.tsx
git commit -m "feat: render multiple plinko balls"
```

---

## Task 3: Sidebar Cap and Button State

Thread these props from `GameScreen` to `GameSidebar`:

- `activeManualRoundCount`
- `manualRoundLimit`

In `useGameSidebarActions.ts`:

- Compute:
  - `isManualRequestPending`
  - `isManualRoundLimitReached`
  - `isManualBetDisabled`
  - `isSidebarDisabled`
- Manual Bet should be blocked only when:
  - request is pending, or
  - active manual round count is at limit
- Rows/risk/mode/settings should lock while:
  - request is pending, or
  - active manual rounds exist, or
  - auto-play is running
- Bet amount should lock only while request is pending.

In `BetActionButton.tsx`:

- If manual request pending: show loading `Playing...`
- Else if manual active count > 0: show `Playing... (N/10)`
- Else show `Bet`
- Disable manual button only from `isManualBetDisabled`.

Acceptance:

- After a manual response returns, the button shows `Playing... (N/10)` and remains clickable if `N < 10`.
- At `10/10`, the button disables and sends no more requests.
- Auto button behavior remains `Start Auto` / `STOP (current/total)`.

Commit:

```bash
git add src/widgets/game-sidebar/model/useGameSidebarActions.ts src/widgets/game-sidebar/ui/GameSidebar.tsx src/widgets/game-sidebar/ui/BetActionButton.tsx
git commit -m "feat: allow capped manual round overlap"
```

---

## Task 4: Verify and Polish

Run:

```bash
npm run lint
npm run build
```

Manual browser checks:

- Manual mode, animations on: click Bet, then click again after response but before first ball lands. Multiple balls should be visible.
- Manual counter: button shows `Playing... (N/10)` and stays enabled below 10.
- Manual cap: at `10/10`, button disables and no request is sent until a slot frees.
- Locked controls: rows/risk/mode/animation toggle are locked while a manual request or active round exists.
- Bet amount remains editable while active rounds exist and no request is pending.
- Animations off: result bucket appears immediately and the slot frees after result pause.
- Auto mode: still sequential.

Commit polish only if code changed:

```bash
git add src/widgets/game-screen/model/activeRound.ts src/widgets/game-screen/ui/GameScreen.tsx src/widgets/game-sidebar/model/useGameSidebarActions.ts src/widgets/game-sidebar/ui/GameSidebar.tsx src/widgets/game-sidebar/ui/BetActionButton.tsx src/widgets/plinko-board/lib/canvas/drawing.ts src/widgets/plinko-board/ui/PlinkoBoard.tsx src/widgets/plinko-board/ui/PlinkoCanvas.tsx
git commit -m "fix: polish manual concurrent rounds"
```

---

## Why This Is Smaller

- Removed full-file replacement snippets.
- Removed intentional intermediate broken-build steps.
- Merged canvas, board, and sidebar work into cohesive implementation tasks.
- Kept only contracts, responsibilities, acceptance checks, and commit points.
