# CLAUDE.md

Repository instructions for Claude Code and other AI coding agents.

## Tech Stack

- Next.js
- TypeScript
- React
- TanStack Query
- Zustand
- Tailwind CSS

---

# Architecture

Use lightweight Feature-Sliced Design.

Dependency direction:

`app -> widgets -> features -> entities -> shared`

Never create reverse imports.

Forbidden imports:

- `entities -> features`
- `entities -> widgets`
- `features -> widgets`
- `shared -> entities`
- `shared -> features`
- `shared -> widgets`

Folder ownership:

- `app` — pages, layouts, providers, route handlers
- `widgets` — page sections composed from features/entities
- `features` — user actions and business flows
- `entities` — domain models, APIs, UI, pure business helpers
- `shared` — reusable infrastructure and generic utilities

---

# State Management

## TanStack Query

Use TanStack Query for server state:

- auth user
- game config
- bet history
- backend mutations

## Zustand

Use Zustand only for client/UI state:

- temporary UI selections
- autoplay progress
- local interaction state
- filters
- modal visibility

Rules:

- Do not store server responses in Zustand
- Do not create global `src/stores`
- Store Zustand slices inside owning feature/entity `model` folders
- Prefer local React state for animation timing and refs

---

# API Rules

Client components must call local `/api` routes only.

Never call backend services directly from client components.

Authenticated backend communication must go through:

`src/shared/api/authenticatedApi.ts`

Do not duplicate:

- token refresh logic
- auth retry logic
- auth header handling

---

# Money & Formatting

Backend values use minimal units.

UI displays credits.

Use existing helpers:

- `src/entities/game/lib/amount.ts`
- `src/entities/bet/lib/formatters.ts`

Never hardcode conversions like:

- `value / 1_000_000`
- `value * 1_000_000`

inside UI components.

---

# Game Logic

Keep gameplay logic outside React components whenever possible.

Extract into `lib` helpers:

- board math
- physics
- multiplier logic
- path calculations
- animation calculations

Prefer pure deterministic functions.

React components should primarily:

- render UI
- connect hooks
- handle events
- compose state

---

# UI Rules

Preserve the existing compact casino-style interface.

Do not redesign the application into a landing page.

Avoid unrelated visual refactors.

When changing gameplay UI:

- verify animations
- verify layout stability
- verify interaction behavior
- verify responsive behavior

---

# Code Style

Prefer:

- small components
- small hooks
- pure helper functions
- explicit naming
- feature ownership boundaries

Avoid:

- oversized components
- duplicated logic
- deep prop drilling
- unnecessary abstractions

---

# Verification

Before finishing:

```bash
npm run build
```

For smaller changes:

```bash
npm run lint
```

After changing:

- gameplay
- auth
- API logic
- animations
- layout

verify behavior in browser manually.

---

# Agent Workflow

Before implementing:

1. Read surrounding feature structure
2. Reuse existing patterns
3. Check neighboring slices for conventions

When editing:

- keep changes minimal
- avoid unrelated refactors
- preserve naming consistency

After editing:

- run validation commands
- fix TypeScript errors
- fix lint errors
- remove dead code

Do not create new architecture patterns unless explicitly requested.
