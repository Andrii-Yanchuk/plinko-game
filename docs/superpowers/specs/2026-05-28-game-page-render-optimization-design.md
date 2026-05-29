# Game Page Render Optimization

**Date:** 2026-05-28  
**Scope:** `GameScreen`, `PlinkoBoard`, `GameSidebar` and its sub-components, `useGameSidebarActions`

## Problem

Clicking the Bet button causes every element on the game page to re-render — including the `SidebarFooter` (Fullscreen/Settings buttons), `LogoutButton`, and page header. These components have no relation to bet state but are caught in two cascading re-render chains.

## Root Causes

### Chain 1: `GameScreen` state change → children re-render
`GameScreen` holds `activeRounds` in local state. When a bet is placed, `setActiveRounds` fires, `GameScreen` re-renders, and both `GameSidebar` and `PlinkoBoard` re-render with it — neither has `React.memo`. Any other `GameScreen` state change (e.g. `isMobileSidebarOpen`) triggers the same cascade.

### Chain 2: `isPending` change inside the sidebar
`usePlaceBet` exposes `isPending` from React Query's `useMutation`. When a bet starts, `isPending` becomes `true` inside `useGameSidebarActions`. `GameSidebar` re-renders, and every child — including `SidebarFooter`, `ModeToggle`, `RiskSelector`, `RowsSelector` — re-renders even though most of them don't depend on `isPending`.

### Contributing factors
- `handleBetPresentationComplete` in `GameScreen` closes over `activeRounds` (in its dep array), so it is recreated on every round update, passing a new function reference to `PlinkoBoard` and defeating any future `memo`.
- Three inline arrow functions in `GameScreen`'s JSX (`onMobileClose`, `onMobileOpen`, `onMobileMenuClick`) create new references on every render, also defeating `memo` on children.
- Three handler functions in `useGameSidebarActions` (`handleBetControlClick`, `handleBetAmountKeyDown`, `handleMainButtonClick`) are plain function declarations, recreated on every invocation.

## Design

No store structure changes. No prop interface changes. Pure memoization + callback stabilization.

### Layer 1: `GameScreen.tsx`

**Stabilize inline handlers**

Replace the three inline arrow props with `useCallback`:

```ts
const handleMobileClose = useCallback(() => setIsMobileSidebarOpen(false), [])
const handleMobileOpen  = useCallback(() => setIsMobileSidebarOpen(true), [])
// handleMobileOpen reused for both onMobileOpen and onMobileMenuClick
```

**Fix `handleBetPresentationComplete` deps**

Add a ref that mirrors `activeRounds` so the callback can read the latest value without closing over the array:

```ts
const activeRoundsRef = useRef(activeRounds)
useEffect(() => { activeRoundsRef.current = activeRounds }, [activeRounds])

const handleBetPresentationComplete = useCallback((roundId: string) => {
  const completedRound = activeRoundsRef.current.find(r => r.id === roundId)
  // rest of logic unchanged
}, [gameSound, queryClient]) // activeRounds removed from deps
```

### Layer 2: `PlinkoBoard`

**Extract `PlinkoBoardHeader`**

Move the `<header>` element into a new memoized component at `src/widgets/plinko-board/ui/PlinkoBoardHeader.tsx`. It accepts only `onMobileMenuClick?: () => void`. Because this prop is the stabilized `handleMobileOpen` from Layer 1, the component is stable for the entire game session.

```ts
export const PlinkoBoardHeader = memo(function PlinkoBoardHeader({
  onMobileMenuClick,
}: PlinkoBoardHeaderProps) { ... })
```

**Wrap `PlinkoBoard` in `memo`**

```ts
export const PlinkoBoard = memo(function PlinkoBoard({ ... }) { ... })
```

`PlinkoBoard` still re-renders when `activeRounds` changes (correct — the canvas needs it), but not from unrelated `GameScreen` state changes.

### Layer 3: `GameSidebar` and sub-components

**Wrap `GameSidebar` in `memo`**

```ts
export const GameSidebar = memo(function GameSidebar({ ... }) { ... })
```

Stops re-renders triggered by `isMobileSidebarOpen` changes in `GameScreen`.

**Wrap stable sub-components in `memo`**

| Component | Re-renders only when |
|---|---|
| `SidebarFooter` | `animationsEnabled`, `soundEnabled`, `isFullscreen`, or `isAnimationToggleDisabled` changes |
| `ModeToggle` | `mode` or `disabled` changes |
| `RiskSelector` | `risk`, `availableRisks`, or `disabled` changes |
| `RowsSelector` | `rows`, `rowsProgress`, or `disabled` changes |

Each gets `memo(function ComponentName(...) { ... })` — no other changes to those files.

**Stabilize handlers in `useGameSidebarActions`**

Convert five plain function declarations to `useCallback`:

- `handleBetAmountKeyDown` — empty dep array (reads no closed-over state)
- `handleBetControlClick` — deps: `[betAmount, minBetAmount, maxBetAmount, setBetAmount]`
- `handleBetClick` — deps: `[selectedMode, placeBetMutation.isPending, isManualRoundLimitReached, getValidatedBetAmount, validationMessage, setError, clearError, rows, risk, placeBetMutation.placeBet]`
- `handleStartAutoPlay` — deps: `[getValidatedBetAmount, validationMessage, setError, clearError, autoBetCount, risk, rows, stopOnLoss, stopOnProfit, autoPlay.start]`
- `handleMainButtonClick` — deps: `[autoPlay.isPlaying, autoPlay.isStopping, autoPlay.stop, selectedMode, handleStartAutoPlay, handleBetClick]`

## Files Changed

| File | Change |
|---|---|
| `src/widgets/game-screen/ui/GameScreen.tsx` | stabilize 2 inline handlers; add `activeRoundsRef`; remove `activeRounds` from `handleBetPresentationComplete` deps |
| `src/widgets/plinko-board/ui/PlinkoBoard.tsx` | wrap in `memo`; replace inline header with `<PlinkoBoardHeader>` |
| `src/widgets/plinko-board/ui/PlinkoBoardHeader.tsx` | **new file** — memoized header component |
| `src/widgets/game-sidebar/ui/GameSidebar.tsx` | wrap in `memo` |
| `src/widgets/game-sidebar/ui/SidebarFooter.tsx` | wrap in `memo` |
| `src/widgets/game-sidebar/ui/ModeToggle.tsx` | wrap in `memo` |
| `src/widgets/game-sidebar/ui/RiskSelector.tsx` | wrap in `memo` |
| `src/widgets/game-sidebar/ui/RowsSelector.tsx` | wrap in `memo` |
| `src/widgets/game-sidebar/model/useGameSidebarActions.ts` | wrap 5 handlers in `useCallback` |

## Out of Scope

- Store structure changes
- Prop interface changes
- `BetAmountControl` and `BetActionButton` — these legitimately re-render during a bet and are left as-is
- `AutoPlayControls` — not rendered during manual play; deferred
