# App Footer Navigation Design

## Goal

Add a fixed bottom footer navigation that is visible on all authenticated app pages except login and registration. The footer shows the active page across four destinations: Game, Progress, History, and Profile.

## Scope

- Add footer navigation for:
  - Game: `/game`
  - Progress: `/progress`
  - History: `/history`
  - Profile: `/profile`
- Create minimal `/progress` and `/profile` pages with page titles.
- Keep `/login` and `/register` free of the footer.
- Add a reusable `container` class with a maximum width of `900px`.
- Adjust the game sidebar bottom controls so the fixed footer does not cover them.
- Preserve the compact dark game UI style.

## Architecture

Use the recommended Feature-Sliced Design placement:

- `widgets/app-footer/ui/AppFooter.tsx` owns the composed footer navigation UI.
- A Next.js route group layout should wrap app pages that need the footer, while auth pages remain outside that group.
- The footer component may use `usePathname()` to determine which nav item is active.

This keeps the footer out of `RootLayout`, avoiding accidental display on auth pages, and avoids duplicating footer markup in every page.

## Routing

The existing `/game` and `/history` routes remain available at the same URLs. Add:

- `src/app/progress/page.tsx`
- `src/app/profile/page.tsx`

Each new page can initially render a full-height dark page with a clear title matching the route.

If a route group is introduced, it must preserve public URL paths. For example, pages can live under a group such as `src/app/(main)/game/page.tsx`, but the browser URL remains `/game`.

## Footer UI

The footer is fixed to the bottom of the viewport:

- `position: fixed`
- `left: 0`
- `right: 0`
- `bottom: 0`
- full browser width

Use a compact height around 64px, a dark translucent background, and a top border consistent with the current sidebar and history styling. The active item should have a stronger text color and subtle background treatment; inactive items should be muted.

The fixed footer background should span the full browser width. Its navigation content should sit inside a reusable `container` class that sets `max-width: 900px`, `width: 100%`, and horizontal centering. This keeps the footer aligned and prevents the navigation from stretching too far on wide screens.

Icons are not required for the initial implementation. Text labels are enough. Icons can be added later as a separate enhancement.

## Layout Behavior

Because the footer is fixed, pages that show it need bottom padding at least equal to the footer height. This prevents page content from being hidden under the footer.

The game screen and sidebar require special care:

- The game screen should reserve bottom space for the fixed footer.
- The sidebar bottom controls in `SidebarFooter` should be moved upward by adding enough bottom spacing so fullscreen/settings buttons remain visible and clickable above the app footer.
- The Plinko board should remain visually usable on desktop and mobile.

## State And Data Flow

No new server state or global client state is required.

`AppFooter` derives active navigation from the current route with `usePathname()`. It should not introduce Zustand state.

## Testing And Verification

After implementation:

- Run `npm run build`.
- Run `npm run lint`.
- Verify `/game`, `/history`, `/progress`, and `/profile` in the browser.
- Confirm `/login` and `/register` do not show the footer.
- Confirm sidebar bottom controls are not covered by the fixed footer.
