# System Toasts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restrained system notifications with `react-hot-toast` for auth failures, claimed progression rewards, and successful profile updates.

**Architecture:** Mount one global `Toaster` in the app providers and keep toast calls inside the feature/widget model hooks that own the relevant actions. Use existing FSD boundaries: auth feature hooks can call toast directly, progression/profile widget model hooks can call toast after successful React Query mutations, and amount formatting stays in existing entity helpers.

**Tech Stack:** Next.js, React, TypeScript, React Query, Tailwind CSS, react-hot-toast.

---

### Task 1: Add Global Toast Host

**Files:**
- Modify: `src/app/providers.tsx`

- [ ] **Step 1: Import `Toaster`**

Add the import near the existing imports:

```tsx
import { Toaster } from "react-hot-toast";
```

- [ ] **Step 2: Render the toast host in the top-right**

Replace the provider return with:

```tsx
return (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4_000,
        style: {
          background: "#1A1F2E",
          border: "1px solid #2A2F3E",
          borderRadius: "8px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
          color: "#F8FAFC",
          fontSize: "14px",
          fontWeight: 600,
          height: "54px",
          lineHeight: "20px",
          maxWidth: "calc(100vw - 32px)",
          minWidth: "356px",
          padding: "0 12px 0 14px",
          width: "fit-content",
        },
      }}
    />
  </QueryClientProvider>
);
```

- [ ] **Step 3: Verify typecheck through build**

Run: `npm run build`

Expected: build completes without TypeScript errors related to `Toaster` or toast option styles.

---

### Task 2: Show Auth Error Toasts

**Files:**
- Modify: `src/features/auth/login/model/useLogin.ts`
- Modify: `src/features/auth/register/model/useRegister.ts`

- [ ] **Step 1: Import toast in login hook**

Add:

```tsx
import toast from "react-hot-toast";
```

- [ ] **Step 2: Toast login failures while preserving inline error**

Replace the login `catch` block with:

```tsx
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Login failed. Please check your credentials.";

  setError(message);
  toast.error(message);
}
```

- [ ] **Step 3: Import toast in register hook**

Add:

```tsx
import toast from "react-hot-toast";
```

- [ ] **Step 4: Toast register failures while preserving inline error**

Replace the register `catch` block with:

```tsx
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Unable to create account";

  setError(message);
  toast.error(message);
}
```

- [ ] **Step 5: Verify auth hooks compile**

Run: `npm run lint`

Expected: no lint errors in auth hooks.

---

### Task 3: Show Progression Reward Toasts

**Files:**
- Modify: `src/widgets/progression/model/useProgressionView.ts`

- [ ] **Step 1: Import toast and credit formatter**

Add:

```tsx
import toast from "react-hot-toast";
import { formatWholeCredits } from "@/entities/bet/lib/formatters";
```

- [ ] **Step 2: Add reward message helper in the same file**

Place above `createClaimSuccessHandler`:

```tsx
function createRewardToastMessage(response: ProgressionClaimResponse) {
  const credits = formatWholeCredits(response.reward.credits);
  const xp = response.reward.xp;
  const rewardLabel =
    response.reward.source === "daily"
      ? "Daily reward claimed"
      : "Mission reward claimed";
  const levelLabel =
    response.reward.levelAfter > response.reward.levelBefore
      ? `, Level ${response.reward.levelAfter} reached`
      : "";

  return `${rewardLabel}! +${credits} credits, +${xp} XP${levelLabel}`;
}
```

- [ ] **Step 3: Toast after successful claim and keep cache behavior**

Update `createClaimSuccessHandler`:

```tsx
function createClaimSuccessHandler(queryClient: QueryClient) {
  return (response: ProgressionClaimResponse) => {
    queryClient.setQueryData(queryKeys.progression, response.progression);
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    toast.success(createRewardToastMessage(response));
  };
}
```

- [ ] **Step 4: Toast claim errors without removing existing inline errors**

Add `onError` to both claim mutations:

```tsx
const dailyClaim = useMutation<ProgressionClaimResponse, Error>({
  mutationFn: claimDailyProgressionReward,
  onError: (error) => toast.error(error.message),
  onSuccess: handleClaimSuccess,
});
const missionClaim = useMutation<ProgressionClaimResponse, Error, string>({
  mutationFn: claimMissionProgressionReward,
  onError: (error) => toast.error(error.message),
  onSuccess: handleClaimSuccess,
});
```

- [ ] **Step 5: Verify progression compiles**

Run: `npm run lint`

Expected: no lint errors in `useProgressionView.ts`.

---

### Task 4: Show Profile Update Toasts

**Files:**
- Modify: `src/widgets/profile/model/useProfileView.ts`

- [ ] **Step 1: Import toast**

Add:

```tsx
import toast from "react-hot-toast";
```

- [ ] **Step 2: Keep shared cache update helper pure**

Leave `handleProfileSuccess` responsible only for cache updates:

```tsx
const handleProfileSuccess = (profile: PlayerProfile) => {
  queryClient.setQueryData(queryKeys.profile, profile);
  void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
};
```

- [ ] **Step 3: Add nickname success and error toasts**

Update nickname mutation:

```tsx
const nicknameMutation = useMutation<PlayerProfile, Error, string>({
  mutationFn: (nickname) => updateProfile({ nickname }),
  onError: (error) => toast.error(error.message),
  onSuccess: (profile) => {
    handleProfileSuccess(profile);
    toast.success("Nickname updated");
  },
});
```

- [ ] **Step 4: Add avatar success and error toasts**

Update avatar mutation:

```tsx
const avatarMutation = useMutation<PlayerProfile, Error, File>({
  mutationFn: uploadProfileAvatar,
  onError: (error) => toast.error(error.message),
  onSuccess: (profile) => {
    handleProfileSuccess(profile);
    toast.success("Profile photo updated");
  },
});
```

- [ ] **Step 5: Verify profile compiles**

Run: `npm run lint`

Expected: no lint errors in `useProfileView.ts`.

---

### Task 5: Final Verification

**Files:**
- No additional file changes.

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: ESLint exits successfully.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: Next.js production build exits successfully.

- [ ] **Step 3: Browser-check toast placement and behavior**

Run the app, then verify:

```bash
npm run dev
```

Open `/login`, `/progress`, and `/profile`.

Expected:
- Toasts appear in the top-right.
- Toast style matches the provided dark examples.
- Login/register backend failures show toast and existing inline error.
- Daily/mission claim shows reward amount and XP.
- Nickname and avatar updates show success messages.
- No toast appears for normal bet win/loss/balance changes.

---

## Self-Review

- Spec coverage: covers top-left placement, auth errors, reward XP/credits, nickname update, avatar update, restrained system-notification scope, and no casino-style bet result toasts.
- Placeholder scan: no placeholders remain.
- Type consistency: uses existing `ProgressionClaimResponse`, `PlayerProfile`, React Query mutation callbacks, and `formatWholeCredits`.
