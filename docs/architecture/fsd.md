# FSD-lite Architecture

This project uses a lightweight Feature-Sliced Design structure.

## Layers

- `app`: Next.js route entrypoints, providers, and API route handlers.
- `widgets`: composed UI sections used by pages.
- `features`: user actions and flows.
- `entities`: domain models, entity APIs, entity UI, and pure domain helpers.
- `shared`: cross-cutting infrastructure and generic utilities.

## Dependency Direction

Allowed:

```txt
app -> widgets -> features -> entities -> shared
```

Also valid:

```txt
app -> features -> entities -> shared
app -> entities -> shared
widgets -> entities -> shared
```

Forbidden:

```txt
entities -> features
entities -> widgets
features -> widgets
shared -> entities
shared -> features
shared -> widgets
```

## State

React Query owns server state:

- current user
- game config
- bet history
- bet mutations

Zustand owns client interaction state:

- game screen selections
- sidebar form state
- autoplay progress and stop request state
- history filters

Do not create a global `src/stores` folder. Stores live in the `model` folder of the slice that owns the state.

Avoid storing full server responses in Zustand. Keep round lifecycle state local when it depends on component-local refs or animation callbacks.
