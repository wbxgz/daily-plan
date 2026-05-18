# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Type-check + production build → dist/
npm run preview  # Serve the production build locally
```

## Architecture

PWA app for daily planning. Single-page React app with three views (today / calendar / settings) toggled via state — no router library is used despite react-router-dom being installed (it was added but not wired in; the app uses simple `useState<ViewMode>` switching in `App.tsx`).

**Data layer**: Dexie.js wraps IndexedDB. The singleton `db` instance (`src/db/index.ts`) is imported directly by hooks — no context/provider layer. All DB operations live in `src/hooks/usePlans.ts` as custom hooks.

**Data model** (`src/types/index.ts`):
- `Plan` — keyed by `id`, indexed by `date`, `status`, `categoryId`, `sortOrder`. Status is `'pending' | 'done' | 'postponed' | 'cancelled'`. Postponement rewrites the plan's `date` to the target date so it appears on that day's list.
- `Category` — five defaults seeded on first DB open via Dexie `populate` event (`work`, `study`, `life`, `health`, `other`). Default categories have `isDefault: true` and cannot be deleted through the UI.

**Key hooks** (`src/hooks/usePlans.ts`):
- `usePlans(date)` — CRUD for a single day's plans
- `useCategories()` — category list + add/delete
- `useMonthPlans(year, month)` — returns a `Set<string>` of dates that have ≥1 done plan (drives the green dots on calendar)
- `useExport()` — JSON export/import of the full database

**PWA**: `vite-plugin-pwa` with `generateSW` strategy. Service worker precaches all assets and registers for auto-update. Icons are solid-color PNGs generated at build time.

**Styling**: Plain CSS per-page, mobile-first, `max-width: 600px` centered layout. CSS custom properties in `index.css` for colors/spacing. Bottom nav bar with `safe-area-inset-bottom` for notched phones.
