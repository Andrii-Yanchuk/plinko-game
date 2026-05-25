# AGENTS.md

Rules for AI/code agents working in this repository.

## Project

This is a Next.js Plinko game using TypeScript, React, React Query, Zustand, and Tailwind CSS.

## Architecture

Follow the lightweight Feature-Sliced Design structure documented in `docs/architecture/fsd.md`.

Allowed dependency direction:

`app -> widgets -> features -> entities -> shared`

Do not introduce reverse imports, including:

- `entities -> features`
- `entities -> widgets`
- `features -> widgets`
- `shared -> entities`
- `shared -> features`
- `shared -> widgets`

Place code by ownership:

- `app`: Next.js pages, layouts, providers, and API routes.
- `widgets`: composed UI sections used by pages.
- `features`: user actions and flows.
- `entities`: domain models, entity APIs, entity UI, and pure domain helpers.
- `shared`: cross-cutting infrastructure and generic utilities.

## State Management

Use React Query for server state:

- current user
- game config
- bet history
- bet mutations

Use Zustand only for client interaction state:

- game screen selections
- sidebar form state
- autoplay progress and stop request state
- history filters

Do not create a global `src/stores` folder.

Stores must live in the `model` folder of the slice that owns the state.

Avoid storing full server responses in Zustand.

Keep round lifecycle state local when it depends on refs, animation callbacks, or component-local timing.

## API Rules

Client-side entity APIs should call local Next API routes under `/api`.

Do not call the backend API directly from client components.

Authenticated backend requests should go through `src/shared/api/authenticatedApi.ts` so token refresh behavior stays centralized.

Do not duplicate refresh-token handling in individual API route handlers.

## Money Values

Backend bet, payout, and balance values are represented in minimal units.

UI displays credits.

Use helpers from:

- `src/entities/game/lib/amount.ts`
- `src/entities/bet/lib/formatters.ts`

Do not duplicate manual `1_000_000` conversions inside React components.

## Game Logic

Keep Plinko board math, path logic, animation helpers, physics, and multiplier logic outside React UI components when practical.

Prefer pure helpers in `lib` folders for deterministic game calculations.

React components should mainly compose UI, wire hooks, and handle callbacks.

## UI

Keep the existing compact game UI style.

Do not replace the app with a marketing-style landing page.

Avoid unrelated visual redesigns unless explicitly requested.

For gameplay/canvas changes, verify that animation, layout, and interaction still work visually.

## Verification

Before finishing code changes, run:

```bash
npm run build
```

For lint-only or small styling changes, also run:

```bash
npm run lint
```

If changing gameplay, canvas, layout, auth, or API behavior, verify the affected page in the browser.
