# FSD Zustand Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the current mixed `components` / `lib` structure into an FSD-lite architecture with local Zustand stores placed in the owning `model` layers.

**Architecture:** Keep `src/app` as thin Next.js route entrypoints. Move domain types, API clients, and pure domain helpers into `entities`; move user actions into `features`; move composed screen sections into `widgets`; keep cross-cutting infrastructure in `shared`. React Query remains the source of truth for server state, while Zustand stores only client interaction state.

**Tech Stack:** Next.js App Router, React 19, TypeScript, TanStack Query, Zustand, Tailwind CSS.

---

## Target Structure

```txt
src/
  app/
    api/
    game/page.tsx
    history/page.tsx
    login/page.tsx
    register/page.tsx
    layout.tsx
    providers.tsx

  widgets/
    game-screen/
      ui/GameScreen.tsx
      model/useGameScreenStore.ts

    game-sidebar/
      ui/GameSidebar.tsx
      ui/AutoPlayControls.tsx
      ui/BetActionButton.tsx
      ui/BetAmountControl.tsx
      ui/LastBetSummary.tsx
      ui/ModeToggle.tsx
      ui/RiskSelector.tsx
      ui/RowsSelector.tsx
      ui/SettingsModal.tsx
      ui/SettingsToggle.tsx
      ui/SidebarFooter.tsx
      model/useGameSidebarStore.ts
      model/useGameSidebarConfig.ts

    plinko-board/
      ui/PlinkoBoard.tsx
      ui/PlinkoCanvas.tsx
      ui/HistoryButton.tsx
      lib/canvas/drawing.ts
      lib/canvas/physics.ts
      lib/animation.ts
      lib/board.ts
      lib/multiplier.ts
      lib/path.ts

    bet-history/
      ui/BetHistoryView.tsx
      ui/HistoryFilters.tsx
      ui/HistoryItem.tsx
      ui/RiskBadge.tsx
      ui/CreditAmount.tsx
      model/useBetHistoryFiltersStore.ts
      model/constants.ts

  features/
    place-bet/
      model/usePlaceBet.ts

    auto-play/
      model/useAutoPlay.ts
      model/useAutoPlayStore.ts
      lib/validation.ts

    auth/
      login/model/useLogin.ts
      register/model/useRegister.ts
      logout/ui/LogoutButton.tsx

  entities/
    game/
      model/types.ts
      model/constants.ts
      api/gameApi.ts
      lib/amount.ts
      lib/input.ts
      lib/rows.ts

    bet/
      model/types.ts
      api/betsApi.ts
      lib/formatters.ts

    user/
      model/types.ts
      api/userApi.ts
      ui/UserBalance.tsx

  shared/
    api/authenticatedApi.ts
    api/config.ts
    lib/delay.ts
    lib/queryKeys.ts
    ui/
```

## Dependency Rules

Allowed direction:

```txt
app -> widgets -> features -> entities -> shared
app -> features -> entities -> shared
app -> entities -> shared
```

Forbidden direction:

```txt
entities -> features
entities -> widgets
features -> widgets
shared -> entities
shared -> features
shared -> widgets
```

Zustand rule:

```txt
Store files live in the `model` folder of the slice that owns the state.
Do not create `src/stores`.
Do not put server state in Zustand.
```

React Query keeps:

```txt
currentUser
gameConfig
betHistory
placeBet mutation lifecycle
```

Zustand keeps:

```txt
selected rows/risk
round playing state
last local bet reference
sidebar form values
autoplay progress/stopping flags
history filter UI state
```

---

### Task 1: Add Baseline Guardrails

**Files:**
- Modify: `package.json`
- Create: `docs/superpowers/plans/2026-05-23-fsd-zustand-migration.md`

- [ ] **Step 1: Record current baseline commands**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Both commands either pass, or any pre-existing failures are documented before refactoring starts.
```

- [ ] **Step 2: Add an architecture check script later, not now**

Do not introduce dependency enforcement tooling in the first move. This migration should first stabilize module ownership. Add import-boundary automation only after the folder structure exists.

- [ ] **Step 3: Commit the plan**

Run:

```bash
git add docs/superpowers/plans/2026-05-23-fsd-zustand-migration.md
git commit -m "docs: add fsd zustand migration plan"
```

Expected:

```txt
The plan is committed before production files are moved.
```

---

### Task 2: Create Domain Entities Without Moving UI

**Files:**
- Create: `src/entities/game/model/types.ts`
- Create: `src/entities/bet/model/types.ts`
- Create: `src/entities/user/model/types.ts`
- Modify: `src/lib/game-api.ts`
- Modify: `src/lib/bets-api.ts`
- Modify: `src/lib/auth-api.ts`
- Modify: all imports that currently read `Risk`, `Bet`, `GameConfig`, or `CurrentUser` from lower-level locations

- [ ] **Step 1: Create game domain types**

Create `src/entities/game/model/types.ts`:

```ts
export type BetControl = "1/2" | "2x" | "MAX";
export type GameMode = "Manual" | "Auto";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

export type GameConfig = {
  rows: number[];
  risks: Risk[];
  minBet: string;
  maxBet: string;
  payoutTables: Record<Risk, Record<number, number[]>>;
};
```

- [ ] **Step 2: Create bet domain types**

Create `src/entities/bet/model/types.ts`:

```ts
import type { Risk } from "@/entities/game/model/types";

export type PlaceBetPayload = {
  amount: string;
  rows: number;
  risk: Risk;
};

export type BetSeed = {
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
};

export type Bet = {
  seed: BetSeed;
  id: string;
  betId: string;
  amount: string;
  rows: number;
  risk: Risk;
  path: string;
  bucketIndex: number;
  multiplier: string;
  payout: string;
  balanceAfter: string;
  createdAt: string;
};

export type BetHistory = {
  items: Bet[];
  nextCursor: string | null;
};

export type GetBetHistoryParams = {
  cursor?: string;
  limit?: number;
  rows?: number;
};
```

- [ ] **Step 3: Create user domain types**

Create `src/entities/user/model/types.ts`:

```ts
export type AuthUser = {
  id: string;
  email: string;
};

export type CurrentUser = AuthUser & {
  balance: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type AuthPayload = {
  email: string;
  password: string;
};
```

- [ ] **Step 4: Update API files to import entity types**

Change `src/lib/game-api.ts` to import `GameConfig` from `@/entities/game/model/types`.

Change `src/lib/bets-api.ts` to import `PlaceBetPayload`, `Bet`, `BetHistory`, and `GetBetHistoryParams` from `@/entities/bet/model/types`.

Change `src/lib/auth-api.ts` to import `AuthPayload`, `AuthResponse`, and `CurrentUser` from `@/entities/user/model/types`.

- [ ] **Step 5: Replace component type imports**

Replace imports like:

```ts
import type { Risk } from "@/components/game/types";
```

with:

```ts
import type { Risk } from "@/entities/game/model/types";
```

Replace imports like:

```ts
import type { Bet } from "@/lib/bets-api";
```

with:

```ts
import type { Bet } from "@/entities/bet/model/types";
```

- [ ] **Step 6: Keep compatibility exports temporarily**

In `src/components/game/types.ts`, temporarily re-export:

```ts
export type {
  BetControl,
  GameMode,
  Risk,
} from "@/entities/game/model/types";
```

This allows the migration to proceed incrementally. Delete this compatibility file after all imports are moved.

- [ ] **Step 7: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
The app compiles with entity-owned domain types.
No `src/lib/*` file imports from `@/components/*`.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/entities src/lib src/components
git commit -m "refactor: move domain types into entities"
```

---

### Task 3: Move API Clients Into Entities

**Files:**
- Create: `src/entities/game/api/gameApi.ts`
- Create: `src/entities/bet/api/betsApi.ts`
- Create: `src/entities/user/api/userApi.ts`
- Modify: `src/lib/game-api.ts`
- Modify: `src/lib/bets-api.ts`
- Modify: `src/lib/auth-api.ts`
- Modify: imports in `src/components/**`

- [ ] **Step 1: Move game API client**

Create `src/entities/game/api/gameApi.ts`:

```ts
import type { GameConfig } from "@/entities/game/model/types";

export async function getGameConfig() {
  const response = await fetch("/api/game/config", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.message ?? error?.error ?? "Unable to load game config";

    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return response.json() as Promise<GameConfig>;
}
```

- [ ] **Step 2: Move bet API client**

Create `src/entities/bet/api/betsApi.ts` with the current `placeBet`, `getBetHistory`, and `readErrorMessage` implementation from `src/lib/bets-api.ts`, importing types from `@/entities/bet/model/types`.

- [ ] **Step 3: Move user API client**

Create `src/entities/user/api/userApi.ts` with `getCurrentUser` from `src/lib/auth-api.ts`.

- [ ] **Step 4: Move auth feature API later**

Keep `login`, `register`, `refreshAuth`, and `logout` in `src/lib/auth-api.ts` for this task. They will move under `features/auth` in a later task.

- [ ] **Step 5: Update imports**

Use these replacements:

```txt
@/lib/game-api -> @/entities/game/api/gameApi
@/lib/bets-api -> @/entities/bet/api/betsApi
getCurrentUser from @/lib/auth-api -> @/entities/user/api/userApi
```

- [ ] **Step 6: Add temporary compatibility exports**

Keep the old `src/lib/game-api.ts` and `src/lib/bets-api.ts` as re-export shims during this task:

```ts
export { getGameConfig } from "@/entities/game/api/gameApi";
export type { GameConfig } from "@/entities/game/model/types";
```

```ts
export { getBetHistory, placeBet } from "@/entities/bet/api/betsApi";
export type {
  Bet,
  BetHistory,
  BetSeed,
  GetBetHistoryParams,
  PlaceBetPayload,
} from "@/entities/bet/model/types";
```

- [ ] **Step 7: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
All UI code uses entity API clients or temporary shims.
No domain API implementation remains coupled to `src/components`.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/entities src/lib src/components
git commit -m "refactor: move domain api clients into entities"
```

---

### Task 4: Move Shared Infrastructure

**Files:**
- Create: `src/shared/api/config.ts`
- Create: `src/shared/api/authenticatedApi.ts`
- Create: `src/shared/lib/queryKeys.ts`
- Create: `src/shared/lib/delay.ts`
- Modify: `src/lib/auth-config.ts`
- Modify: `src/lib/authenticated-api.ts`
- Modify: `src/lib/query-keys.ts`
- Modify: `src/components/game/GameScreen.tsx`
- Modify: `src/components/game/utils/delay.ts`
- Modify: `src/app/api/**`
- Modify: `src/proxy.ts`

- [ ] **Step 1: Move API config**

Create `src/shared/api/config.ts` by moving exports from `src/lib/auth-config.ts`.

- [ ] **Step 2: Move authenticated proxy helper**

Create `src/shared/api/authenticatedApi.ts` by moving `proxyAuthenticatedRequest` from `src/lib/authenticated-api.ts`.

- [ ] **Step 3: Move query keys**

Create `src/shared/lib/queryKeys.ts` by moving `queryKeys` from `src/lib/query-keys.ts`.

- [ ] **Step 4: Move delay helper**

Create `src/shared/lib/delay.ts`:

```ts
export function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
```

- [ ] **Step 5: Keep compatibility shims**

Temporarily replace old files with re-exports:

```ts
export * from "@/shared/api/config";
```

```ts
export * from "@/shared/api/authenticatedApi";
```

```ts
export * from "@/shared/lib/queryKeys";
```

- [ ] **Step 6: Update imports gradually**

Use replacements:

```txt
@/lib/auth-config -> @/shared/api/config
@/lib/authenticated-api -> @/shared/api/authenticatedApi
@/lib/query-keys -> @/shared/lib/queryKeys
./utils/delay -> @/shared/lib/delay
```

- [ ] **Step 7: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
App route handlers still compile.
Client components still compile.
Shared infrastructure no longer belongs to feature folders.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/shared src/lib src/app src/components src/proxy.ts
git commit -m "refactor: move shared infrastructure into shared layer"
```

---

### Task 5: Move Pure Game Helpers Into Entity And Widget Libs

**Files:**
- Create: `src/entities/game/lib/amount.ts`
- Create: `src/entities/game/lib/input.ts`
- Create: `src/entities/game/lib/rows.ts`
- Create: `src/widgets/plinko-board/lib/animation.ts`
- Create: `src/widgets/plinko-board/lib/board.ts`
- Create: `src/widgets/plinko-board/lib/multiplier.ts`
- Create: `src/widgets/plinko-board/lib/path.ts`
- Create: `src/widgets/plinko-board/lib/canvas/drawing.ts`
- Create: `src/widgets/plinko-board/lib/canvas/physics.ts`
- Modify: `src/components/game/**`

- [ ] **Step 1: Move reusable game helpers**

Move:

```txt
src/components/game/utils/amount.ts -> src/entities/game/lib/amount.ts
src/components/game/utils/input.ts -> src/entities/game/lib/input.ts
src/components/game/utils/rows.ts -> src/entities/game/lib/rows.ts
```

Rationale:

```txt
These helpers are domain-level or reusable form logic and should not belong to a widget.
```

- [ ] **Step 2: Move plinko-board-only helpers**

Move:

```txt
src/components/game/utils/animation.ts -> src/widgets/plinko-board/lib/animation.ts
src/components/game/utils/board.ts -> src/widgets/plinko-board/lib/board.ts
src/components/game/utils/multiplier.ts -> src/widgets/plinko-board/lib/multiplier.ts
src/components/game/utils/path.ts -> src/widgets/plinko-board/lib/path.ts
src/components/game/canvas/drawing.ts -> src/widgets/plinko-board/lib/canvas/drawing.ts
src/components/game/canvas/physics.ts -> src/widgets/plinko-board/lib/canvas/physics.ts
```

Rationale:

```txt
These helpers describe Plinko board rendering and animation. They should live with `widgets/plinko-board`.
```

- [ ] **Step 3: Update imports**

Use replacements:

```txt
./utils/amount -> @/entities/game/lib/amount
./utils/input -> @/entities/game/lib/input
./utils/rows -> @/entities/game/lib/rows
./utils/animation -> @/widgets/plinko-board/lib/animation
./utils/board -> @/widgets/plinko-board/lib/board
./utils/multiplier -> @/widgets/plinko-board/lib/multiplier
./utils/path -> @/widgets/plinko-board/lib/path
./canvas/drawing -> @/widgets/plinko-board/lib/canvas/drawing
./canvas/physics -> @/widgets/plinko-board/lib/canvas/physics
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
No helper import points to `src/components/game/utils` or `src/components/game/canvas`.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/entities src/widgets src/components
git commit -m "refactor: move game helpers into fsd layers"
```

---

### Task 6: Extract Place Bet Feature

**Files:**
- Create: `src/features/place-bet/model/usePlaceBet.ts`
- Modify: `src/components/game/usePlaceBet.ts`
- Modify: `src/components/game/GameSidebar.tsx`

- [ ] **Step 1: Move the hook**

Create `src/features/place-bet/model/usePlaceBet.ts`:

```ts
import { useMutation } from "@tanstack/react-query";
import { placeBet } from "@/entities/bet/api/betsApi";
import type { Bet } from "@/entities/bet/model/types";

type UsePlaceBetParams = {
  onBetAmountSettled: (amount: string) => void;
  onBetPlaced: (bet: Bet) => Promise<void> | void;
};

export function usePlaceBet({
  onBetAmountSettled,
  onBetPlaced,
}: UsePlaceBetParams) {
  const mutation = useMutation({
    mutationFn: placeBet,
    onSuccess: async (bet) => {
      onBetAmountSettled((Number(bet.amount) / 1_000_000).toFixed(2));
      await onBetPlaced(bet);
    },
  });

  return {
    isPending: mutation.isPending,
    placeBet: mutation.mutateAsync,
  };
}
```

- [ ] **Step 2: Replace old hook with compatibility shim**

Replace `src/components/game/usePlaceBet.ts` with:

```ts
export { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
```

- [ ] **Step 3: Update `GameSidebar` import**

Change:

```ts
import { usePlaceBet } from "./usePlaceBet";
```

to:

```ts
import { usePlaceBet } from "@/features/place-bet/model/usePlaceBet";
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Bet placement behavior remains unchanged.
The mutation feature no longer lives under the game widget.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/features src/components
git commit -m "refactor: extract place bet feature"
```

---

### Task 7: Extract Auto Play Feature And Store

**Files:**
- Create: `src/features/auto-play/lib/validation.ts`
- Create: `src/features/auto-play/model/useAutoPlayStore.ts`
- Create: `src/features/auto-play/model/useAutoPlay.ts`
- Modify: `src/components/game/useAutoPlay.ts`
- Modify: `src/components/game/GameSidebar.tsx`

- [ ] **Step 1: Extract validation helpers**

Create `src/features/auto-play/lib/validation.ts`:

```ts
export function parsePositiveInteger(value: string) {
  const number = Number(value);

  return Number.isFinite(number) && Number.isInteger(number) && number > 0
    ? number
    : null;
}

export function parseNonNegativeNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}
```

- [ ] **Step 2: Create Zustand store for autoplay UI state**

Create `src/features/auto-play/model/useAutoPlayStore.ts`:

```ts
import { create } from "zustand";

type AutoProgress = {
  current: number;
  total: number;
};

type AutoPlayState = {
  isPlaying: boolean;
  isStopping: boolean;
  progress: AutoProgress;
  setPlaying: (isPlaying: boolean) => void;
  setStopping: (isStopping: boolean) => void;
  setProgress: (progress: AutoProgress) => void;
  reset: () => void;
};

const initialProgress: AutoProgress = {
  current: 0,
  total: 0,
};

export const useAutoPlayStore = create<AutoPlayState>((set) => ({
  isPlaying: false,
  isStopping: false,
  progress: initialProgress,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setStopping: (isStopping) => set({ isStopping }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      isPlaying: false,
      isStopping: false,
      progress: initialProgress,
    }),
}));
```

- [ ] **Step 3: Move autoplay orchestration**

Create `src/features/auto-play/model/useAutoPlay.ts` by moving current logic from `src/components/game/useAutoPlay.ts`.

Keep orchestration in the hook, but replace local `useState` calls with `useAutoPlayStore` selectors.

Use these imports:

```ts
import { useRef } from "react";
import type { Bet, PlaceBetPayload } from "@/entities/bet/model/types";
import type { Risk } from "@/entities/game/model/types";
import { getMinimalUnitsFromCredits } from "@/entities/game/lib/amount";
import {
  parseNonNegativeNumber,
  parsePositiveInteger,
} from "@/features/auto-play/lib/validation";
import { useAutoPlayStore } from "@/features/auto-play/model/useAutoPlayStore";
```

- [ ] **Step 4: Replace old hook with compatibility shim**

Replace `src/components/game/useAutoPlay.ts` with:

```ts
export { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
```

- [ ] **Step 5: Update `GameSidebar` import**

Change:

```ts
import { useAutoPlay } from "./useAutoPlay";
```

to:

```ts
import { useAutoPlay } from "@/features/auto-play/model/useAutoPlay";
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Manual bet and autoplay flows compile.
Autoplay state is owned by `features/auto-play/model`.
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/features src/components
git commit -m "refactor: extract autoplay feature state"
```

---

### Task 8: Move Game Screen And Add Screen Store

**Files:**
- Create: `src/widgets/game-screen/model/useGameScreenStore.ts`
- Create: `src/widgets/game-screen/ui/GameScreen.tsx`
- Modify: `src/components/game/GameScreen.tsx`
- Modify: `src/app/game/page.tsx`

- [ ] **Step 1: Create screen store**

Create `src/widgets/game-screen/model/useGameScreenStore.ts`:

```ts
import { create } from "zustand";
import type { Bet } from "@/entities/bet/model/types";
import type { Risk } from "@/entities/game/model/types";

type GameScreenState = {
  lastBet: Bet | null;
  isRoundPlaying: boolean;
  rows: number;
  risk: Risk;
  setLastBet: (bet: Bet | null) => void;
  setRoundPlaying: (isRoundPlaying: boolean) => void;
  setRows: (rows: number) => void;
  setRisk: (risk: Risk) => void;
};

export const useGameScreenStore = create<GameScreenState>((set) => ({
  lastBet: null,
  isRoundPlaying: false,
  rows: 8,
  risk: "LOW",
  setLastBet: (lastBet) => set({ lastBet }),
  setRoundPlaying: (isRoundPlaying) => set({ isRoundPlaying }),
  setRows: (rows) => set({ rows }),
  setRisk: (risk) => set({ risk }),
}));
```

- [ ] **Step 2: Move GameScreen UI**

Move `src/components/game/GameScreen.tsx` to `src/widgets/game-screen/ui/GameScreen.tsx`.

Update imports:

```txt
@/lib/game-api -> @/entities/game/api/gameApi
@/lib/query-keys -> @/shared/lib/queryKeys
@/lib/auth-api CurrentUser type -> @/entities/user/model/types
@/lib/bets-api Bet type -> @/entities/bet/model/types
./GameSidebar -> @/widgets/game-sidebar/ui/GameSidebar
./PlinkoBoard -> @/widgets/plinko-board/ui/PlinkoBoard
./useFullscreen -> keep temporary import until Task 12 or move to shared/lib
./utils/delay -> @/shared/lib/delay
```

- [ ] **Step 3: Replace local screen state with store selectors**

Replace local `useState` for `lastBet`, `isRoundPlaying`, `rows`, and `risk` with selectors from `useGameScreenStore`.

Keep `roundCompletionRef` local because it is an implementation detail of animation promise resolution, not application state.

- [ ] **Step 4: Add compatibility shim**

Replace `src/components/game/GameScreen.tsx` with:

```ts
export { GameScreen } from "@/widgets/game-screen/ui/GameScreen";
```

- [ ] **Step 5: Update page import**

Change `src/app/game/page.tsx`:

```ts
import { GameScreen } from "@/widgets/game-screen/ui/GameScreen";
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
The game page compiles through the widget import.
Screen-level client interaction state is in Zustand.
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/widgets src/components src/app/game/page.tsx
git commit -m "refactor: move game screen into widget layer"
```

---

### Task 9: Move Game Sidebar Widget And Add Sidebar Store

**Files:**
- Create: `src/widgets/game-sidebar/model/useGameSidebarStore.ts`
- Create: `src/widgets/game-sidebar/model/useGameSidebarConfig.ts`
- Create: `src/widgets/game-sidebar/ui/*.tsx`
- Modify: `src/components/game/GameSidebar.tsx`
- Modify: `src/components/game/sidebar/*.tsx`
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`

- [ ] **Step 1: Create sidebar store**

Create `src/widgets/game-sidebar/model/useGameSidebarStore.ts`:

```ts
import { create } from "zustand";
import type { GameMode } from "@/entities/game/model/types";

type GameSidebarState = {
  selectedMode: GameMode;
  betAmount: string;
  autoBetCount: string;
  stopOnProfit: string;
  stopOnLoss: string;
  error: string;
  setSelectedMode: (selectedMode: GameMode) => void;
  setBetAmount: (betAmount: string) => void;
  setAutoBetCount: (autoBetCount: string) => void;
  setStopOnProfit: (stopOnProfit: string) => void;
  setStopOnLoss: (stopOnLoss: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
};

export const useGameSidebarStore = create<GameSidebarState>((set) => ({
  selectedMode: "Manual",
  betAmount: "1.00",
  autoBetCount: "10",
  stopOnProfit: "0.00",
  stopOnLoss: "0.00",
  error: "",
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setBetAmount: (betAmount) => set({ betAmount }),
  setAutoBetCount: (autoBetCount) => set({ autoBetCount }),
  setStopOnProfit: (stopOnProfit) => set({ stopOnProfit }),
  setStopOnLoss: (stopOnLoss) => set({ stopOnLoss }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: "" }),
}));
```

- [ ] **Step 2: Move sidebar config hook**

Move:

```txt
src/components/game/useGameSidebarConfig.ts -> src/widgets/game-sidebar/model/useGameSidebarConfig.ts
```

Update imports:

```txt
@/lib/game-api -> @/entities/game/model/types
./utils/amount -> @/entities/game/lib/amount
./utils/rows -> @/entities/game/lib/rows
./types -> @/entities/game/model/types
```

- [ ] **Step 3: Move sidebar UI files**

Move:

```txt
src/components/game/GameSidebar.tsx -> src/widgets/game-sidebar/ui/GameSidebar.tsx
src/components/game/sidebar/AutoPlayControls.tsx -> src/widgets/game-sidebar/ui/AutoPlayControls.tsx
src/components/game/sidebar/BetActionButton.tsx -> src/widgets/game-sidebar/ui/BetActionButton.tsx
src/components/game/sidebar/BetAmountControl.tsx -> src/widgets/game-sidebar/ui/BetAmountControl.tsx
src/components/game/sidebar/LastBetSummary.tsx -> src/widgets/game-sidebar/ui/LastBetSummary.tsx
src/components/game/sidebar/ModeToggle.tsx -> src/widgets/game-sidebar/ui/ModeToggle.tsx
src/components/game/sidebar/RiskSelector.tsx -> src/widgets/game-sidebar/ui/RiskSelector.tsx
src/components/game/sidebar/RowsSelector.tsx -> src/widgets/game-sidebar/ui/RowsSelector.tsx
src/components/game/sidebar/SettingsModal.tsx -> src/widgets/game-sidebar/ui/SettingsModal.tsx
src/components/game/sidebar/SettingsToggle.tsx -> src/widgets/game-sidebar/ui/SettingsToggle.tsx
src/components/game/sidebar/SidebarFooter.tsx -> src/widgets/game-sidebar/ui/SidebarFooter.tsx
```

- [ ] **Step 4: Replace local sidebar state with store selectors**

In `src/widgets/game-sidebar/ui/GameSidebar.tsx`, replace local `useState` for:

```txt
selectedMode
betAmount
autoBetCount
stopOnProfit
stopOnLoss
error
```

with `useGameSidebarStore` selectors.

- [ ] **Step 5: Add compatibility shims**

Replace old moved files with re-exports only if other imports still reference them. Once all imports are updated, delete the old files.

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Game sidebar compiles from `widgets/game-sidebar`.
Sidebar form state is owned by a local widget store.
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/widgets src/components
git commit -m "refactor: move game sidebar into widget layer"
```

---

### Task 10: Move Plinko Board Widget

**Files:**
- Create: `src/widgets/plinko-board/ui/PlinkoBoard.tsx`
- Create: `src/widgets/plinko-board/ui/PlinkoCanvas.tsx`
- Create: `src/widgets/plinko-board/ui/HistoryButton.tsx`
- Modify: `src/components/game/PlinkoBoard.tsx`
- Modify: `src/components/game/PlinkoCanvas.tsx`
- Modify: `src/components/game/HistoryButton.tsx`
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`

- [ ] **Step 1: Move board UI files**

Move:

```txt
src/components/game/PlinkoBoard.tsx -> src/widgets/plinko-board/ui/PlinkoBoard.tsx
src/components/game/PlinkoCanvas.tsx -> src/widgets/plinko-board/ui/PlinkoCanvas.tsx
src/components/game/HistoryButton.tsx -> src/widgets/plinko-board/ui/HistoryButton.tsx
```

- [ ] **Step 2: Update imports**

Use replacements:

```txt
@/lib/bets-api Bet type -> @/entities/bet/model/types
@/lib/game-api GameConfig type -> @/entities/game/model/types
./types -> @/entities/game/model/types
./utils/animation -> @/widgets/plinko-board/lib/animation
./utils/board -> @/widgets/plinko-board/lib/board
./utils/multiplier -> @/widgets/plinko-board/lib/multiplier
./canvas/drawing -> @/widgets/plinko-board/lib/canvas/drawing
./canvas/physics -> @/widgets/plinko-board/lib/canvas/physics
../UserBalance -> @/entities/user/ui/UserBalance after Task 11
```

- [ ] **Step 3: Keep `UserBalance` import temporary if Task 11 is not complete**

If `UserBalance` still lives in `src/components/UserBalance.tsx`, keep that import until Task 11.

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Plinko board rendering code lives under `widgets/plinko-board`.
Canvas and animation helpers are local to the board widget.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/widgets src/components
git commit -m "refactor: move plinko board into widget layer"
```

---

### Task 11: Move User Balance Entity UI

**Files:**
- Create: `src/entities/user/ui/UserBalance.tsx`
- Modify: `src/components/UserBalance.tsx`
- Modify: `src/widgets/plinko-board/ui/PlinkoBoard.tsx`

- [ ] **Step 1: Move `UserBalance`**

Move:

```txt
src/components/UserBalance.tsx -> src/entities/user/ui/UserBalance.tsx
```

Update imports:

```txt
@/lib/auth-api getCurrentUser -> @/entities/user/api/userApi
@/lib/query-keys -> @/shared/lib/queryKeys
```

- [ ] **Step 2: Add compatibility shim**

Replace `src/components/UserBalance.tsx` with:

```ts
export { UserBalance } from "@/entities/user/ui/UserBalance";
```

- [ ] **Step 3: Update board import**

In `src/widgets/plinko-board/ui/PlinkoBoard.tsx`, import:

```ts
import { UserBalance } from "@/entities/user/ui/UserBalance";
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
User balance is entity UI and still reads server state through React Query.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/entities src/components src/widgets
git commit -m "refactor: move user balance into user entity"
```

---

### Task 12: Move Bet History Widget And Store

**Files:**
- Create: `src/widgets/bet-history/model/useBetHistoryFiltersStore.ts`
- Create: `src/widgets/bet-history/model/constants.ts`
- Create: `src/widgets/bet-history/ui/BetHistoryView.tsx`
- Create: `src/widgets/bet-history/ui/HistoryFilters.tsx`
- Create: `src/widgets/bet-history/ui/HistoryItem.tsx`
- Create: `src/widgets/bet-history/ui/RiskBadge.tsx`
- Create: `src/widgets/bet-history/ui/CreditAmount.tsx`
- Create: `src/entities/bet/lib/formatters.ts`
- Modify: `src/components/history/**`
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: Create history filter store**

Create `src/widgets/bet-history/model/useBetHistoryFiltersStore.ts`:

```ts
import { create } from "zustand";
import type { Risk } from "@/entities/game/model/types";

type HistoryRisk = Risk | "ALL";

type BetHistoryFiltersState = {
  risk: HistoryRisk;
  rows: string;
  setRisk: (risk: HistoryRisk) => void;
  setRows: (rows: string) => void;
};

export const useBetHistoryFiltersStore = create<BetHistoryFiltersState>((set) => ({
  risk: "ALL",
  rows: "ALL",
  setRisk: (risk) => set({ risk }),
  setRows: (rows) => set({ rows }),
}));
```

- [ ] **Step 2: Move history constants**

Move:

```txt
src/components/history/constants.ts -> src/widgets/bet-history/model/constants.ts
```

- [ ] **Step 3: Move history formatters to bet entity**

Move:

```txt
src/components/history/formatters.ts -> src/entities/bet/lib/formatters.ts
```

- [ ] **Step 4: Move history UI files**

Move:

```txt
src/components/history/BetHistoryView.tsx -> src/widgets/bet-history/ui/BetHistoryView.tsx
src/components/history/HistoryFilters.tsx -> src/widgets/bet-history/ui/HistoryFilters.tsx
src/components/history/HistoryItem.tsx -> src/widgets/bet-history/ui/HistoryItem.tsx
src/components/history/RiskBadge.tsx -> src/widgets/bet-history/ui/RiskBadge.tsx
src/components/history/CreditAmount.tsx -> src/widgets/bet-history/ui/CreditAmount.tsx
```

- [ ] **Step 5: Replace local filter state**

In `src/widgets/bet-history/ui/BetHistoryView.tsx`, replace local `useState` for `risk` and `rows` with `useBetHistoryFiltersStore` selectors.

- [ ] **Step 6: Update imports**

Use replacements:

```txt
@/components/game/types -> @/entities/game/model/types
@/lib/bets-api -> @/entities/bet/api/betsApi
@/lib/query-keys -> @/shared/lib/queryKeys
./constants -> @/widgets/bet-history/model/constants
./formatters -> @/entities/bet/lib/formatters
```

- [ ] **Step 7: Update page import**

Change `src/app/history/page.tsx`:

```ts
import { BetHistoryView } from "@/widgets/bet-history/ui/BetHistoryView";
```

- [ ] **Step 8: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
History page compiles through `widgets/bet-history`.
History filter UI state is in Zustand.
Bet formatters are owned by the bet entity.
```

- [ ] **Step 9: Commit**

Run:

```bash
git add src/widgets src/entities src/components src/app/history/page.tsx
git commit -m "refactor: move bet history into widget layer"
```

---

### Task 13: Move Auth Feature UI And Hooks

**Files:**
- Create: `src/features/auth/login/model/useLogin.ts`
- Create: `src/features/auth/register/model/useRegister.ts`
- Create: `src/features/auth/logout/ui/LogoutButton.tsx`
- Create: `src/features/auth/api/authApi.ts`
- Modify: `src/components/AuthCard.tsx`
- Modify: `src/components/RegisterCard.tsx`
- Modify: `src/components/LogoutButton.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`

- [ ] **Step 1: Move auth API**

Create `src/features/auth/api/authApi.ts` with `login`, `register`, `refreshAuth`, and `logout` from `src/lib/auth-api.ts`.

Use:

```ts
import type { AuthPayload, AuthResponse } from "@/entities/user/model/types";
```

- [ ] **Step 2: Extract login hook**

Create `src/features/auth/login/model/useLogin.ts`:

```ts
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/features/auth/api/authApi";

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(payload: { email: string; password: string }) {
    setError("");
    setIsLoading(true);

    try {
      await login(payload);
      router.push("/game");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    error,
    isLoading,
    submit,
  };
}
```

- [ ] **Step 3: Extract register hook**

Create `src/features/auth/register/model/useRegister.ts` with the same shape as `useLogin`, calling `register` and using fallback message `"Unable to create account"`.

- [ ] **Step 4: Move logout button**

Move:

```txt
src/components/LogoutButton.tsx -> src/features/auth/logout/ui/LogoutButton.tsx
```

Update it to import `logout` from `@/features/auth/api/authApi`.

- [ ] **Step 5: Update auth cards**

Change `AuthCard` to use `useLogin`.

Change `RegisterCard` to use `useRegister`.

Keep visual markup in place for this task. Do not move `AuthCard`, `RegisterCard`, or `AuthPageShell` yet unless the team decides to introduce `pages/auth` later.

- [ ] **Step 6: Add compatibility shim**

Replace `src/components/LogoutButton.tsx` with:

```ts
export { LogoutButton } from "@/features/auth/logout/ui/LogoutButton";
```

- [ ] **Step 7: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Login, register, and logout behavior compile through auth feature APIs/hooks.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features src/components src/lib
git commit -m "refactor: extract auth features"
```

---

### Task 14: Remove Compatibility Shims And Dead Folders

**Files:**
- Delete: `src/components/game/types.ts`
- Delete: `src/components/game/usePlaceBet.ts`
- Delete: `src/components/game/useAutoPlay.ts`
- Delete: old moved files under `src/components/game`
- Delete: old moved files under `src/components/history`
- Delete: old moved API shims only after imports are gone
- Modify: remaining imports

- [ ] **Step 1: Search for old imports**

Run:

```bash
rg "@/components/game|@/components/history|@/lib/game-api|@/lib/bets-api|@/lib/query-keys|@/lib/auth-config|@/lib/authenticated-api" src
```

Expected before cleanup:

```txt
Only compatibility shims or intentionally postponed files appear.
```

- [ ] **Step 2: Replace remaining imports**

Replace old imports with final FSD paths:

```txt
@/components/game/GameScreen -> @/widgets/game-screen/ui/GameScreen
@/components/history/BetHistoryView -> @/widgets/bet-history/ui/BetHistoryView
@/components/LogoutButton -> @/features/auth/logout/ui/LogoutButton
@/components/UserBalance -> @/entities/user/ui/UserBalance
@/lib/game-api -> @/entities/game/api/gameApi
@/lib/bets-api -> @/entities/bet/api/betsApi
@/lib/query-keys -> @/shared/lib/queryKeys
@/lib/auth-config -> @/shared/api/config
@/lib/authenticated-api -> @/shared/api/authenticatedApi
```

- [ ] **Step 3: Delete shims**

Delete files that only re-export final modules and are no longer imported.

- [ ] **Step 4: Verify no forbidden imports remain**

Run:

```bash
rg "@/components/game|@/components/history|@/lib/game-api|@/lib/bets-api|@/lib/query-keys|@/lib/auth-config|@/lib/authenticated-api" src
```

Expected:

```txt
No matches.
```

- [ ] **Step 5: Verify build**

Run:

```bash
npm run lint
npm run build
```

Expected:

```txt
Both commands pass.
```

- [ ] **Step 6: Commit**

Run:

```bash
git add src
git commit -m "refactor: remove legacy component and lib shims"
```

---

### Task 15: Add Import Boundary Documentation

**Files:**
- Create: `docs/architecture/fsd.md`
- Modify: `README.md`

- [ ] **Step 1: Create architecture documentation**

Create `docs/architecture/fsd.md`:

```md
# FSD-lite Architecture

This project uses a lightweight Feature-Sliced Design structure.

## Layers

- `app`: Next.js route entrypoints, providers, API route handlers.
- `widgets`: composed UI sections used by pages.
- `features`: user actions and flows.
- `entities`: domain models, entity APIs, entity UI, and pure domain helpers.
- `shared`: cross-cutting infrastructure and generic utilities.

## Dependency Direction

Allowed:

```txt
app -> widgets -> features -> entities -> shared
```

Forbidden:

```txt
entities -> features
entities -> widgets
features -> widgets
shared -> entities
```

## State

React Query owns server state:

- current user
- game config
- bet history
- bet mutations

Zustand owns client interaction state:

- game screen selections and round state
- sidebar form state
- autoplay progress
- history filters

Do not create a global `src/stores` folder. Stores live in the `model` folder of the slice that owns the state.
```

- [ ] **Step 2: Link architecture docs from README**

Add a short section to `README.md`:

```md
## Architecture

This project uses a lightweight Feature-Sliced Design layout. See [docs/architecture/fsd.md](docs/architecture/fsd.md).
```

- [ ] **Step 3: Verify docs only**

Run:

```bash
npm run lint
```

Expected:

```txt
Lint still passes after docs changes.
```

- [ ] **Step 4: Commit**

Run:

```bash
git add README.md docs/architecture/fsd.md
git commit -m "docs: document fsd architecture"
```

---

### Task 16: Final Verification

**Files:**
- Review all changed files

- [ ] **Step 1: Check final imports**

Run:

```bash
rg "@/components/game|@/components/history|@/lib/game-api|@/lib/bets-api|@/lib/query-keys|@/lib/auth-config|@/lib/authenticated-api" src
```

Expected:

```txt
No matches.
```

- [ ] **Step 2: Check Zustand store locations**

Run:

```bash
rg "create<|create\\(" src
```

Expected:

```txt
Zustand stores appear only under `src/widgets/**/model` or `src/features/**/model`.
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected:

```txt
0 lint errors.
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected:

```txt
Production build exits successfully.
```

- [ ] **Step 5: Manual smoke test**

Open:

```txt
http://localhost:3000/game
http://localhost:3000/history
http://localhost:3000/login
http://localhost:3000/register
```

Verify:

```txt
Game screen renders.
Sidebar controls update.
Manual bet button behavior is unchanged.
Autoplay controls render and can start/stop if authenticated.
History filters update visible rows.
Login/register forms still submit.
Logout button still signs out.
```

- [ ] **Step 6: Review git diff**

Run:

```bash
git diff --stat HEAD
git status --short
```

Expected:

```txt
Only intentional FSD migration files are changed.
No generated build artifacts are staged.
```

---

## Execution Notes

Recommended execution mode:

```txt
Use superpowers:using-git-worktrees before implementation.
Then use superpowers:subagent-driven-development or superpowers:executing-plans.
```

Suggested branch:

```txt
codex/fsd-zustand-migration
```

Commit strategy:

```txt
Commit after every task that passes lint and build.
Avoid one large migration commit.
```

Rollback strategy:

```txt
If a task becomes noisy, keep compatibility shims and stop at the last passing commit.
Do not continue moving another layer until lint and build pass.
```
