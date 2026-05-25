# Progression Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/progress` page with authenticated progression data, claim actions, and UI matching the provided progression mockup.

**Architecture:** Add a focused `entities/progression` slice for response types and client-side API functions. Add local Next API routes under `/api/progression/...` that proxy to the backend `/api/v1/progression/...` endpoints through `proxyAuthenticatedRequest`, keeping token refresh centralized. Render the page through a `widgets/progression` client widget powered by React Query.

**Tech Stack:** Next.js App Router, React 19, TypeScript, React Query 5, Tailwind CSS 4, Feature-Sliced Design.

---

## File Structure

- Create `src/entities/progression/model/types.ts`: progression aggregate, mission, daily reward, and claim response types.
- Create `src/entities/progression/api/progressionApi.ts`: client functions for `GET /api/progression/me`, daily claim, and mission claim.
- Modify `src/shared/lib/queryKeys.ts`: add `progression` query key.
- Create `src/app/api/progression/me/route.ts`: proxy authenticated GET to backend `/api/v1/progression/me`.
- Create `src/app/api/progression/daily/claim/route.ts`: proxy authenticated POST to backend `/api/v1/progression/daily/claim`.
- Create `src/app/api/progression/missions/[id]/claim/route.ts`: proxy authenticated POST to backend `/api/v1/progression/missions/{id}/claim`.
- Create `src/widgets/progression/ui/ProgressionView.tsx`: client UI, queries, claim mutations, and cache updates.
- Modify `src/app/(main)/progress/page.tsx`: render `ProgressionView`.

---

### Task 1: Add Progression Entity Contract And Client API

**Files:**
- Create: `src/entities/progression/model/types.ts`
- Create: `src/entities/progression/api/progressionApi.ts`
- Modify: `src/shared/lib/queryKeys.ts`

- [ ] **Step 1: Add progression model types**

Create `src/entities/progression/model/types.ts`:

```ts
export type ProgressionReward = {
  credits: string;
  xp: number;
};

export type DailyProgression = {
  reward: ProgressionReward;
  canClaim: boolean;
  streak: number;
  nextClaimAt: string | null;
};

export type ProgressionMission = {
  creditReward: string;
  id: string;
  key: string;
  type: unknown;
  title: string;
  description: string;
  periodKey: string;
  target: number;
  progress: number;
  status: unknown;
  xpReward: number;
  claimable: boolean;
  completedAt: string | null;
  claimedAt: string | null;
};

export type ProgressionMissions = {
  daily: ProgressionMission[];
  starter: ProgressionMission[];
};

export type Progression = {
  daily: DailyProgression;
  missions: ProgressionMissions;
  level: number;
  xp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpIntoCurrentLevel: number;
};

export type ProgressionClaimReward = {
  source: string;
  missionId: string | null;
  missionKey: string | null;
  credits: string;
  balanceAfter: string;
  sourceKey: string;
  periodKey: string;
  xp: number;
  levelBefore: number;
  levelAfter: number;
};

export type ProgressionClaimResponse = {
  reward: ProgressionClaimReward;
  progression: Progression;
};
```

- [ ] **Step 2: Add the progression query key**

Update `src/shared/lib/queryKeys.ts` from:

```ts
export const queryKeys = {
  betHistory: (params: { rows?: number }) => ["betHistory", params] as const,
  currentUser: ["currentUser"] as const,
  gameConfig: ["gameConfig"] as const,
};
```

to:

```ts
export const queryKeys = {
  betHistory: (params: { rows?: number }) => ["betHistory", params] as const,
  currentUser: ["currentUser"] as const,
  gameConfig: ["gameConfig"] as const,
  progression: ["progression"] as const,
};
```

- [ ] **Step 3: Add client-side progression API functions**

Create `src/entities/progression/api/progressionApi.ts`:

```ts
import type {
  Progression,
  ProgressionClaimResponse,
} from "@/entities/progression/model/types";

async function readErrorMessage(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  const message = error?.message ?? error?.error ?? fallback;

  return Array.isArray(message) ? message.join(", ") : message;
}

export async function getProgression() {
  const response = await fetch("/api/progression/me", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to load progression"),
    );
  }

  return response.json() as Promise<Progression>;
}

export async function claimDailyProgressionReward() {
  const response = await fetch("/api/progression/daily/claim", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to claim daily reward"),
    );
  }

  return response.json() as Promise<ProgressionClaimResponse>;
}

export async function claimMissionProgressionReward(id: string) {
  const response = await fetch(
    `/api/progression/missions/${encodeURIComponent(id)}/claim`,
    {
      method: "POST",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to claim mission reward"),
    );
  }

  return response.json() as Promise<ProgressionClaimResponse>;
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: lint completes without errors for `src/entities/progression` and `src/shared/lib/queryKeys.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/entities/progression src/shared/lib/queryKeys.ts
git commit -m "feat: add progression client api"
```

---

### Task 2: Add Local Progression API Routes

**Files:**
- Create: `src/app/api/progression/me/route.ts`
- Create: `src/app/api/progression/daily/claim/route.ts`
- Create: `src/app/api/progression/missions/[id]/claim/route.ts`

- [ ] **Step 1: Add the progression aggregate route**

Create `src/app/api/progression/me/route.ts`:

```ts
import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

export async function GET(request: Request) {
  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(`${API_BASE_URL}/api/v1/progression/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
}
```

- [ ] **Step 2: Add the daily claim route**

Create `src/app/api/progression/daily/claim/route.ts`:

```ts
import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

export async function POST(request: Request) {
  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(`${API_BASE_URL}/api/v1/progression/daily/claim`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
}
```

- [ ] **Step 3: Add the mission claim route**

Create `src/app/api/progression/missions/[id]/claim/route.ts`:

```ts
import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(
      `${API_BASE_URL}/api/v1/progression/missions/${encodeURIComponent(
        id,
      )}/claim`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ),
  );
}
```

- [ ] **Step 4: Run build to verify route signatures**

Run:

```bash
npm run build
```

Expected: Next.js accepts all three API routes and reports no route handler type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/progression
git commit -m "feat: proxy progression api routes"
```

---

### Task 3: Add The Progression View Widget

**Files:**
- Create: `src/widgets/progression/ui/ProgressionView.tsx`

- [ ] **Step 1: Create the widget shell, query, mutations, and cache updates**

Create `src/widgets/progression/ui/ProgressionView.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimDailyProgressionReward,
  claimMissionProgressionReward,
  getProgression,
} from "@/entities/progression/api/progressionApi";
import type {
  Progression,
  ProgressionMission,
} from "@/entities/progression/model/types";
import { formatCredits } from "@/entities/bet/lib/formatters";
import { queryKeys } from "@/shared/lib/queryKeys";

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getLevelPercent(progression: Progression) {
  const requiredXp =
    progression.xpForNextLevel - progression.xpForCurrentLevel;

  if (requiredXp <= 0) {
    return 0;
  }

  return clampPercent((progression.xpIntoCurrentLevel / requiredXp) * 100);
}

function getMissionPercent(mission: ProgressionMission) {
  if (mission.target <= 0) {
    return mission.progress > 0 ? 100 : 0;
  }

  return clampPercent((mission.progress / mission.target) * 100);
}

function getTimeLabel(value: string | null) {
  if (!value) {
    return "11:59 PM";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "11:59 PM";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  }).format(date);
}

function updateProgressionCache(queryClient: ReturnType<typeof useQueryClient>) {
  return (response: { progression: Progression }) => {
    queryClient.setQueryData(queryKeys.progression, response.progression);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };
}

export function ProgressionView() {
  const queryClient = useQueryClient();
  const { data, error, isError, isLoading } = useQuery({
    queryFn: getProgression,
    queryKey: queryKeys.progression,
  });
  const onClaimSuccess = updateProgressionCache(queryClient);
  const dailyClaim = useMutation({
    mutationFn: claimDailyProgressionReward,
    onSuccess: onClaimSuccess,
  });
  const missionClaim = useMutation({
    mutationFn: claimMissionProgressionReward,
    onSuccess: onClaimSuccess,
  });
  const mutationError = dailyClaim.error ?? missionClaim.error;

  const levelProgress = useMemo(
    () => (data ? getLevelPercent(data) : 0),
    [data],
  );

  return (
    <main className="min-h-screen bg-[#101725] pb-24 text-[#F4F7FB]">
      <header className="flex h-16 items-center gap-4 border-b border-[#222A3B]/80 bg-[#171D2C] px-4">
        <Link
          aria-label="Back to game"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#D1D5DC] transition-colors hover:bg-[#222A3D]"
          href="/game"
        >
          <Image src="/back-icon.svg" alt="" width={18} height={18} />
        </Link>
        <h1 className="text-[18px] font-bold">Progression</h1>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5">
        {isLoading ? (
          <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4 text-sm text-[#8D96A8]">
            Loading progression...
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 p-4 text-sm text-[#FDA4AF]">
            {error.message}
          </div>
        ) : null}

        {mutationError ? (
          <div className="rounded-lg border border-[#FB2C36]/50 bg-[#FB2C36]/10 p-4 text-sm text-[#FDA4AF]">
            {mutationError.message}
          </div>
        ) : null}

        {data ? (
          <>
            <LevelCard progression={data} progress={levelProgress} />
            <DailyRewardCard
              isClaiming={dailyClaim.isPending}
              onClaim={() => dailyClaim.mutate()}
              progression={data}
            />
            <MissionSection
              icon="◎"
              isClaimingId={missionClaim.variables}
              missions={data.missions.daily}
              onClaim={(id) => missionClaim.mutate(id)}
              title="Daily Missions"
            />
            <MissionSection
              icon="↯"
              isClaimingId={missionClaim.variables}
              missions={data.missions.starter}
              onClaim={(id) => missionClaim.mutate(id)}
              title="Starter Missions"
            />
          </>
        ) : null}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Add the level card inside the same file**

Append this code in `src/widgets/progression/ui/ProgressionView.tsx` after `ProgressionView`:

```tsx
function LevelCard({
  progress,
  progression,
}: {
  progress: number;
  progression: Progression;
}) {
  return (
    <article className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#4AA3FF]">↗</span>
          <h2 className="text-sm font-bold">Level {progression.level}</h2>
        </div>
        <span className="text-xs text-[#8D96A8]">
          {progression.xpIntoCurrentLevel} /{" "}
          {progression.xpForNextLevel - progression.xpForCurrentLevel} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#070B12]">
        <div
          className="h-full rounded-full bg-[#4AA3FF]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-[#8D96A8]">
        {progression.xpIntoCurrentLevel} XP to level {progression.level + 1}
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Add the daily reward card inside the same file**

Append this code after `LevelCard`:

```tsx
function DailyRewardCard({
  isClaiming,
  onClaim,
  progression,
}: {
  isClaiming: boolean;
  onClaim: () => void;
  progression: Progression;
}) {
  const credits = formatCredits(progression.daily.reward.credits);
  const canClaim = progression.daily.canClaim && !isClaiming;

  return (
    <article className="rounded-lg border border-[#A34D12]/70 bg-[linear-gradient(110deg,#1A1F2E_0%,#2B1716_55%,#221923_100%)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#FF9F00]">▣</span>
            <h2 className="text-sm font-bold">Daily Reward</h2>
          </div>
          <p className="mt-2 text-xs text-[#8D96A8]">
            Day {Math.min(progression.daily.streak + 1, 7)} of 7
          </p>
        </div>
        <div className="text-right text-xs font-bold">
          <div className="text-[#FFB000]">⊕ {credits}</div>
          <div className="text-[#4AA3FF]">
            +{progression.daily.reward.xp} XP
          </div>
        </div>
      </div>

      <button
        className="mt-4 h-10 w-full rounded-lg bg-[linear-gradient(90deg,#FF7A00_0%,#FF2B45_100%)] text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canClaim}
        onClick={onClaim}
        type="button"
      >
        {isClaiming
          ? "Claiming..."
          : progression.daily.canClaim
            ? "Claim Now"
            : "Claimed"}
      </button>

      <div className="mt-3 flex items-center justify-between border-t border-[#A34D12]/40 pt-3 text-xs">
        <span className="text-[#8D96A8]">Current streak</span>
        <span className="font-bold text-[#FFB000]">
          ↯ {progression.daily.streak} days
        </span>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Add mission section and mission card inside the same file**

Append this code after `DailyRewardCard`:

```tsx
function MissionSection({
  icon,
  isClaimingId,
  missions,
  onClaim,
  title,
}: {
  icon: string;
  isClaimingId?: string;
  missions: ProgressionMission[];
  onClaim: (id: string) => void;
  title: string;
}) {
  if (missions.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <span className="text-[#00E783]">{icon}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <MissionCard
            isClaiming={isClaimingId === mission.id}
            key={mission.id}
            mission={mission}
            onClaim={onClaim}
          />
        ))}
      </div>
    </section>
  );
}

function MissionCard({
  isClaiming,
  mission,
  onClaim,
}: {
  isClaiming: boolean;
  mission: ProgressionMission;
  onClaim: (id: string) => void;
}) {
  const progress = getMissionPercent(mission);
  const canClaim = mission.claimable && !isClaiming;
  const credits = formatCredits(mission.creditReward);

  return (
    <article className="rounded-lg border border-[#19579D] bg-[linear-gradient(110deg,#12233B_0%,#14233A_55%,#1A1F2E_100%)] p-4">
      <div className="grid grid-cols-[2.25rem_1fr] gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#235FA8] bg-[#18345B] text-[#4AA3FF]">
          ◎
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold">{mission.title}</h3>
              <p className="mt-1 text-xs text-[#8D96A8]">
                {mission.description}
              </p>
            </div>
            {mission.claimable || mission.claimedAt ? (
              <button
                className="h-8 rounded-lg border border-[#00C950]/50 px-3 text-xs font-bold text-[#00E783] transition-colors hover:bg-[#00C950]/10 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canClaim}
                onClick={() => onClaim(mission.id)}
                type="button"
              >
                {isClaiming ? "Claiming..." : mission.claimedAt ? "Claimed" : "Claim"}
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#D1D5DC]">
            <span>
              {mission.progress} / {mission.target}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#070B12]">
            <div
              className="h-full rounded-full bg-[#4AA3FF]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 font-bold">
              <span className="text-[#FFB000]">⊕ {credits}</span>
              <span className="text-[#4AA3FF]">+{mission.xpReward} XP</span>
            </div>
            <span className="text-[#8D96A8]">◷ {getTimeLabel(mission.completedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes. If it reports line length or formatting issues, format the affected JSX without changing behavior.

- [ ] **Step 6: Commit**

```bash
git add src/widgets/progression/ui/ProgressionView.tsx
git commit -m "feat: add progression view"
```

---

### Task 4: Wire The Progress Page

**Files:**
- Modify: `src/app/(main)/progress/page.tsx`

- [ ] **Step 1: Render the progression widget from the route**

Replace `src/app/(main)/progress/page.tsx` with:

```tsx
import { ProgressionView } from "@/widgets/progression/ui/ProgressionView";

export default function ProgressPage() {
  return <ProgressionView />;
}
```

- [ ] **Step 2: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands complete successfully.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(main)/progress/page.tsx"
git commit -m "feat: wire progression page"
```

---

### Task 5: Browser Verification And UI Polish

**Files:**
- Modify only files from prior tasks if verification reveals issues.

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Next.js starts on a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Verify `/progress` desktop layout**

Open:

```txt
http://localhost:3000/progress
```

Expected:

- Header has a back icon and `Progression` title.
- Level card shows `Level N`, progress bar, and XP counter.
- Daily reward card shows reward credits, XP reward, claim button, and streak.
- Daily missions and starter missions render from backend data.
- Mission cards show title, description, numeric progress, percent, rewards, and claim state.
- The fixed app footer remains visible and does not overlap the last mission card.

- [ ] **Step 3: Verify mobile layout**

Use the browser at a narrow viewport around `390px` wide.

Expected:

- No text overlaps inside cards.
- Mission claim buttons remain reachable.
- Cards fit within the viewport with horizontal padding.
- Footer does not cover mission rewards or buttons.

- [ ] **Step 4: Verify claim behavior**

Click a claimable daily reward.

Expected:

- Button changes to `Claiming...` while the request is pending.
- On success, the page updates from `response.progression`.
- User balance query is invalidated.
- If the backend returns an error, an error message appears above the cards.

Click a claimable mission reward.

Expected:

- Only the clicked mission shows `Claiming...`.
- On success, the page updates from `response.progression`.
- User balance query is invalidated.
- Claimed missions are no longer claimable.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands complete successfully.

- [ ] **Step 6: Commit verification fixes if any code changed**

If verification required code edits, commit the exact changed files:

```bash
git add src/entities/progression src/app/api/progression src/widgets/progression "src/app/(main)/progress/page.tsx" src/shared/lib/queryKeys.ts
git commit -m "fix: polish progression page"
```

---

## Self-Review

- Spec coverage: the plan covers backend-proxied GET and POST endpoints, entity types, client API functions, React Query server state, cache updates after claims, current user invalidation for balance refresh, the progression route, and UI sections from the provided mockup.
- Placeholder scan: the plan contains no unfinished-marker text or unspecified implementation steps.
- Type consistency: `Progression`, `ProgressionMission`, `ProgressionClaimResponse`, `getProgression`, `claimDailyProgressionReward`, `claimMissionProgressionReward`, and `queryKeys.progression` are defined before use and retain the same names across tasks.
