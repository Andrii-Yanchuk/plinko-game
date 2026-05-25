# App Footer Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed bottom footer navigation for the main app pages, excluding login and registration.

**Architecture:** Use a Next.js route group layout for main app routes so the footer is shared by `/game`, `/history`, `/progress`, and `/profile` without appearing on auth pages. Place the footer in `widgets/app-footer` and keep active-route logic local to the footer via `usePathname()`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Feature-Sliced Design.

---

## File Structure

- Create `src/widgets/app-footer/ui/AppFooter.tsx`: client footer navigation component with active link styling.
- Create `src/app/(main)/layout.tsx`: shared main-app layout that renders children and `AppFooter`.
- Move `src/app/game/page.tsx` to `src/app/(main)/game/page.tsx`: preserves `/game` public route while putting it inside the footer layout.
- Move `src/app/history/page.tsx` to `src/app/(main)/history/page.tsx`: preserves `/history` public route while putting it inside the footer layout.
- Create `src/app/(main)/progress/page.tsx`: minimal Progress page.
- Create `src/app/(main)/profile/page.tsx`: minimal Profile page.
- Delete old route files/directories after moves: `src/app/game/page.tsx`, `src/app/history/page.tsx`.
- Modify `src/app/globals.css`: add the reusable `.container` class with `max-width: 900px`.
- Modify `src/widgets/game-sidebar/ui/SidebarFooter.tsx`: add bottom spacing so sidebar controls sit above the fixed app footer.
- Modify `src/widgets/game-screen/ui/GameScreen.tsx`: reserve bottom space for the fixed app footer in the game screen.

---

### Task 1: Add Shared Footer UI And Container Class

**Files:**
- Create: `src/widgets/app-footer/ui/AppFooter.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the reusable container class**

Add this block to `src/app/globals.css` after the `@theme inline` block and before `body`:

```css
.container {
  width: 100%;
  max-width: 900px;
  margin-inline: auto;
}
```

- [ ] **Step 2: Create the app footer component**

Create `src/widgets/app-footer/ui/AppFooter.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/game", label: "Game" },
  { href: "/progress", label: "Progress" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
] as const;

export function AppFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#252D3E] bg-[#101725]/95 px-4 backdrop-blur">
      <nav
        aria-label="Primary"
        className="container flex h-16 items-center justify-between gap-2"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex min-w-0 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[#F4F7FB] text-[#101725]"
                  : "text-[#8B93A7] hover:bg-[#252D3E] hover:text-[#F4F7FB]",
              ].join(" ")}
              href={item.href}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
```

- [ ] **Step 3: Run lint for the new component**

Run:

```bash
npm run lint
```

Expected: no lint errors related to `AppFooter.tsx` or `globals.css`.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/widgets/app-footer/ui/AppFooter.tsx
git commit -m "feat: add app footer navigation"
```

---

### Task 2: Add Main Route Group Layout And Pages

**Files:**
- Create: `src/app/(main)/layout.tsx`
- Create: `src/app/(main)/game/page.tsx`
- Create: `src/app/(main)/history/page.tsx`
- Create: `src/app/(main)/progress/page.tsx`
- Create: `src/app/(main)/profile/page.tsx`
- Delete: `src/app/game/page.tsx`
- Delete: `src/app/history/page.tsx`

- [ ] **Step 1: Create the main route group layout**

Create `src/app/(main)/layout.tsx`:

```tsx
import { AppFooter } from "@/widgets/app-footer/ui/AppFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <AppFooter />
    </>
  );
}
```

- [ ] **Step 2: Move the existing game page into the route group**

Create `src/app/(main)/game/page.tsx` with the same content as the current `src/app/game/page.tsx`:

```tsx
import { GameScreen } from "@/widgets/game-screen/ui/GameScreen";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#101725] text-[#F4F7FB]">
      <GameScreen />
    </main>
  );
}
```

Delete `src/app/game/page.tsx` after the new file exists.

- [ ] **Step 3: Move the existing history page into the route group**

Create `src/app/(main)/history/page.tsx` with the same content as the current `src/app/history/page.tsx`:

```tsx
import { BetHistoryView } from "@/widgets/bet-history/ui/BetHistoryView";

export default function HistoryPage() {
  return <BetHistoryView />;
}
```

Delete `src/app/history/page.tsx` after the new file exists.

- [ ] **Step 4: Add the Progress page**

Create `src/app/(main)/progress/page.tsx`:

```tsx
export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-[#101725] px-4 pb-20 pt-8 text-[#F4F7FB]">
      <section className="container">
        <h1 className="text-2xl font-semibold">Progress</h1>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add the Profile page**

Create `src/app/(main)/profile/page.tsx`:

```tsx
export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#101725] px-4 pb-20 pt-8 text-[#F4F7FB]">
      <section className="container">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Verify routing builds**

Run:

```bash
npm run build
```

Expected: Next.js builds `/game`, `/history`, `/progress`, and `/profile` without duplicate route errors.

- [ ] **Step 7: Commit**

```bash
git add src/app
git commit -m "feat: add main app routes"
```

---

### Task 3: Reserve Space For The Fixed Footer

**Files:**
- Modify: `src/widgets/game-screen/ui/GameScreen.tsx`
- Modify: `src/widgets/game-sidebar/ui/SidebarFooter.tsx`

- [ ] **Step 1: Reserve bottom space in the game screen**

In `src/widgets/game-screen/ui/GameScreen.tsx`, update the `section` className from:

```tsx
className="flex min-h-screen w-full overflow-hidden bg-[#101725] max-md:flex-col"
```

to:

```tsx
className="flex min-h-screen w-full overflow-hidden bg-[#101725] pb-16 max-md:flex-col"
```

- [ ] **Step 2: Move sidebar controls above the app footer**

In `src/widgets/game-sidebar/ui/SidebarFooter.tsx`, update the wrapper `div` className from:

```tsx
className="mt-auto -mx-4 -mb-4 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4"
```

to:

```tsx
className="mt-auto -mx-4 mb-12 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4"
```

- [ ] **Step 3: Run build and lint**

Run:

```bash
npm run build
npm run lint
```

Expected: both commands complete successfully.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/game-screen/ui/GameScreen.tsx src/widgets/game-sidebar/ui/SidebarFooter.tsx
git commit -m "fix: keep game controls above footer"
```

---

### Task 4: Browser Verification

**Files:**
- No code files unless verification reveals layout issues.

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Next.js serves the app on a local port, usually `http://localhost:3000`.

- [ ] **Step 2: Verify footer appears on main pages**

Open these routes in the browser:

```txt
http://localhost:3000/game
http://localhost:3000/history
http://localhost:3000/progress
http://localhost:3000/profile
```

Expected:

- The footer is fixed to the bottom of the viewport.
- The footer background and border span the full browser width.
- Footer nav content is centered and constrained by the `.container` max width of `900px`.
- The active page item is visually highlighted.

- [ ] **Step 3: Verify footer is absent from auth pages**

Open:

```txt
http://localhost:3000/login
http://localhost:3000/register
```

Expected: no app footer is visible.

- [ ] **Step 4: Verify game sidebar controls**

Open:

```txt
http://localhost:3000/game
```

Expected:

- Fullscreen and settings buttons in the sidebar are above the fixed footer.
- The buttons remain visible and clickable.
- The Plinko board remains visible and usable on desktop and mobile widths.

- [ ] **Step 5: Fix any visual overlap if found**

If sidebar controls are still too close to the fixed footer, increase the `SidebarFooter` bottom margin from `mb-12` to `mb-16`:

```tsx
className="mt-auto -mx-4 mb-16 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4"
```

Run:

```bash
npm run build
npm run lint
```

Expected: both commands complete successfully.

- [ ] **Step 6: Commit any verification fixes**

If Step 5 changed code:

```bash
git add src/widgets/game-sidebar/ui/SidebarFooter.tsx
git commit -m "fix: adjust sidebar footer spacing"
```

---

## Self-Review

- Spec coverage: the plan covers the fixed footer, four destinations, missing Progress/Profile pages, auth-page exclusion, 900px `container`, sidebar spacing, and verification.
- Placeholder scan: the plan contains no placeholder markers.
- Type consistency: `AppFooter`, `MainLayout`, `GamePage`, `HistoryPage`, `ProgressPage`, and `ProfilePage` names are consistent with the files that define them.
