# Task Manager Dashboard

A production-ready Task Management Dashboard built with Angular 21, demonstrating modern Angular features, clean architecture, and enterprise-level development practices.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack & Architecture Decisions](#tech-stack--architecture-decisions)
- [Project Structure](#project-structure)
- [Design Patterns & State Management](#design-patterns--state-management)
- [Setup & Installation](#setup--installation)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [Testing Strategy](#testing-strategy)
- [Performance Optimization](#performance-optimization)
- [Internationalization (i18n)](#internationalization-i18n)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)

---

## Project Overview

A fully featured Task Management Dashboard that allows users to:

- **Create, edit, and delete tasks** with full form validation
- **Filter and search** tasks by status, priority, and assignee in real time
- **Switch between list and kanban board** views with drag-and-drop status changes
- **View dashboard analytics** — stat cards, status doughnut chart, priority bar chart, and a recent activity feed
- **Toggle dark mode** and switch between English and Arabic (RTL support)

All data is served from an in-memory mock API that replicates a REST backend with realistic latency simulation, caching, and retry logic.

---

## Tech Stack & Architecture Decisions

| Purpose      | Choice                                | Rationale                                                                                                 |
| ------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Framework    | Angular 21 (Standalone)               | Latest stable, no NgModules overhead                                                                      |
| UI Behavior  | `@angular/cdk`                        | Provides Overlay, DragDrop, FocusTrap, A11y — behavioral primitives without visual opinions               |
| Styling      | Tailwind CSS v4                       | Utility-first, zero runtime cost, integrates directly with CDK behavior                                   |
| Charts       | `chart.js` (tree-shaken)              | Minimal bundle — only register the controllers/elements actually used                                     |
| Localization | `@jsverse/transloco`                  | Lazy-loaded per-feature scopes, supports RTL, better DX than Angular's built-in i18n                      |
| Mock Backend | `angular-in-memory-web-api`           | Drop-in HTTP interception without a running server                                                        |
| Testing      | `vitest` + `@testing-library/angular` | Vitest is significantly faster than Karma/Jest; Testing Library encourages accessible, user-centric tests |
| Formatting   | `prettier`                            | Consistent formatting enforced on staged files                                                            |

### Why CDK + Tailwind instead of Angular Material?

The assignment lists Angular Material as a suggestion, but this is a deliberate deviation worth explaining:

1. **Design fidelity** — The provided Figma design uses a custom design system. Angular Material's opinionated visual layer (Material Design tokens, component overrides) would have required more work to match the spec than building directly with Tailwind utilities.
2. **Bundle size** — Angular Material pulls in a large stylesheet and component tree. CDK is ~40 KB smaller because it ships only behavior (accessibility, overlay positioning, drag-and-drop) with no CSS.
3. **The CDK is the right abstraction boundary** — All interactive patterns in this app (modals, drag-and-drop, focus trapping, click-outside) are behavioral problems. CDK solves them; Tailwind styles them. This separation is cleaner than overriding Material component internals.

---

## Project Structure

```
src/
  app/
    core/
      interceptors/         # Cache, error, retry HTTP interceptors
      models/               # Task, Statistic, User TypeScript interfaces
      services/             # TaskService, StatisticsService, UserService, ErrorService
      store/                # Signal-based TaskStore (reactive state)
    features/
      dashboard/            # Lazy-loaded: stat cards, charts, activity feed
        components/
          stat-card/
          activity-feed/
          charts/
            status-chart/   # Doughnut chart (Chart.js)
            priority-chart/ # Bar chart (Chart.js)
        i18n/               # en.json, ar.json (dashboard scope)
      tasks/                # Lazy-loaded: list view, board view, CRUD
        components/
          task-board/       # CDK DragDrop kanban board
          task-card/        # Presentational task card
          task-filters/     # Status/priority/assignee/search filters
          task-form/        # Reactive form (create & edit) via CDK Overlay
        i18n/               # en.json, ar.json (tasks scope)
    shared/
      components/           # ConfirmDialog, SkeletonLoader, EmptyState, Badges, Avatar, LanguageSwitcher
      directives/           # ClickOutsideDirective
      pipes/                # RelativeDatePipe, TruncatePipe
      validators/           # futureDateValidator, noDuplicateTitleValidator
  assets/
    i18n/                   # en.json, ar.json (global scope)
  data-fetching/
    in-memory-data.service.ts
    tasks.json
    statistics.json
```

---

## Design Patterns & State Management

### Smart / Presentational Component Split

Every feature follows a strict smart/dumb split:

- **Smart components** (`DashboardComponent`, `TasksComponent`) inject services and the task store, derive all data, and pass it down via `@Input()`.
- **Presentational components** (`StatCardComponent`, `TaskCardComponent`, `TaskFiltersComponent`, etc.) accept typed inputs and emit typed outputs — zero service injection, fully testable in isolation.

### Signal-Based State (`TaskStore`)

State lives in a single `@Injectable({ providedIn: 'root' })` store using Angular Signals:

```
TaskStore
  ├── _tasks: signal<Task[]>           # source of truth
  ├── _loading: signal<boolean>
  ├── _error: signal<string | null>
  ├── filters: signal<TaskFilters>     # user-driven filter state
  ├── filteredTasks: computed(...)     # derived — no duplication
  ├── tasksByStatus: computed(...)     # used by kanban board
  └── recentActivity: computed(...)    # last 5 updated tasks
```

Mutations (`add`, `update`, `remove`) apply optimistic updates immediately, then call the HTTP service and roll back on error.

### HTTP Layer

Three functional interceptors compose automatically:

| Interceptor        | Responsibility                                                             |
| ------------------ | -------------------------------------------------------------------------- |
| `CacheInterceptor` | Caches `GET` responses for 5 min; invalidates on `POST`/`PUT`/`DELETE`     |
| `RetryInterceptor` | Retries `GET` requests up to 3× on network errors with exponential backoff |
| `ErrorInterceptor` | Maps HTTP status codes to translated error messages via `TranslocoService` |

### Data Flow

```
HTTP request
  → RetryInterceptor (retry on network error)
  → CacheInterceptor (serve from cache or forward)
  → MockApiInterceptor (in-memory web API in dev)
  → ErrorInterceptor (catch and translate errors)
  → TaskService / StatisticsService
  → TaskStore (signals)
  → Smart component
  → Presentational components (inputs only)
```

---

## Setup & Installation

### Prerequisites

- Node.js 20+
- npm 10+
- Angular CLI 21: `npm install -g @angular/cli`

### Installation

```bash
git clone <repo-url>
cd task-manager
npm install
```

### Run Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200`. The app uses an in-memory mock API — no backend required.

---

## Available Scripts

| Script              | Command                 | Description                                             |
| ------------------- | ----------------------- | ------------------------------------------------------- |
| Start dev server    | `npm start`             | Serve with hot reload on port 4200                      |
| Production build    | `npm run build`         | Outputs optimized bundles to `dist/`                    |
| Watch build         | `npm run watch`         | Build in watch mode (development config)                |
| Run tests           | `npm test`              | Run all tests once (no watch)                           |
| Tests in watch mode | `npm run test:watch`    | Run tests in interactive watch mode                     |
| Coverage report     | `npm run test:coverage` | Generate coverage report in `coverage/`                 |
| Lint                | `npm run lint`          | Run Angular ESLint across all TypeScript and HTML files |

---

## Environment Configuration

The app uses Angular's build-time configuration system. No `.env` files are required.

**Development** (`ng serve`): The in-memory web API intercepts all HTTP requests automatically via `isDevMode()` guard in `app.config.ts`. Mock data is generated from `tasks.json` and `statistics.json` in `src/data-fetching/`.

**Production** (`ng build`): The mock API interceptor is excluded. Replace the API base URL in `core/services/task.service.ts` with your real backend URL.

---

## Testing Strategy

### Stack

- **[Vitest](https://vitest.dev/)** — test runner (faster than Karma, compatible with Vite-based Angular build)
- **[@testing-library/angular](https://testing-library.com/docs/angular-testing-library/intro/)** — component tests that mirror real user interactions
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** — custom DOM matchers

### What is Tested

| Layer                       | Approach                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- |
| `TaskStore`                 | Unit tests for all computed signals across filter permutations               |
| `TaskService`               | Unit tests with `HttpClientTestingModule` for all CRUD methods               |
| `CacheInterceptor`          | Unit tests: cache hit, miss, TTL expiry, mutation invalidation               |
| `RetryInterceptor`          | Unit tests: retry count on 503, no retry on 404                              |
| `RelativeDatePipe`          | Unit tests: past, future, today, overdue — in `en` and `ar`                  |
| `futureDateValidator`       | Unit tests: valid future date, past date, today edge case                    |
| `noDuplicateTitleValidator` | Unit tests: unique title passes, duplicate fails                             |
| `StatCardComponent`         | Component test: renders value, change badge color per `changeType`           |
| `TaskCardComponent`         | Component test: renders all fields, emits correct `@Output()` events         |
| `PriorityBadgeComponent`    | Component test: translated label and correct color class per priority        |
| `StatusBadgeComponent`      | Component test: translated label per status                                  |
| `TaskFiltersComponent`      | Component test: search triggers `filtersChange`, chip state                  |
| `TaskFormComponent`         | Component test: invalid submission shows error messages, valid emits payload |
| `ConfirmDialogComponent`    | Component test: title interpolation, `confirmed`/`cancelled` output          |
| `LanguageSwitcherComponent` | Component test: language switch calls `setActiveLang`, flips `dir`           |

### Coverage Target

Minimum **80% coverage** across statements, branches, functions, and lines — enforced via threshold config in `vitest.config.ts`.

```bash
npm run test:coverage
# Report written to coverage/
```

### Testing Philosophy

All component tests use `@testing-library/angular` rather than direct DOM queries on fixture elements. This means tests exercise what users actually see and interact with — labels, roles, accessible names — rather than implementation details like class names or component methods.

Mock translations are provided via `TranslocoTestingModule` so component tests run without HTTP.

---

## Performance Optimization

| Technique                        | Where Applied                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `ChangeDetectionStrategy.OnPush` | Every component in the application                                                     |
| `track task.id` on `@for` loops  | All task list and board renders                                                        |
| Lazy-loaded feature routes       | `dashboard` and `tasks` are separate code-split chunks                                 |
| Transloco scoped loaders         | Each feature loads only its own translation file at route activation                   |
| Chart.js tree-shaking            | Only `DoughnutController`, `BarController`, and their required elements are registered |
| HTTP response caching            | `CacheInterceptor` caches `GET` responses for 5 minutes                                |
| Debounced search                 | `debounceTime(300)` + `distinctUntilChanged()` on the search input                     |
| `takeUntilDestroyed()`           | All RxJS subscriptions auto-cleaned on component destroy                               |
| Pure pipes only                  | `RelativeDatePipe` and `TruncatePipe` are pure — no unnecessary re-evaluation          |

---

## Internationalization (i18n)

Full English / Arabic support via `@jsverse/transloco`:

- **Language switcher** in the top nav persists the selection to `localStorage`
- **RTL layout** — switching to Arabic flips the `dir` attribute on `<html>`, which Tailwind's `rtl:` variants respond to automatically
- **Scoped translation files** — global keys live in `assets/i18n/`, feature-specific keys in each feature's `i18n/` folder (loaded lazily at route activation)
- **Chart labels** re-render on language change via `ngOnChanges` without recreating the chart instance

---

## Known Limitations & Future Improvements

### Not Implemented

- **Virtual scroll** — the `CdkVirtualScrollViewport` performance optimization for lists exceeding 100 tasks was planned but not implemented; current lists render all items.
- **E2E tests** — Playwright or Cypress integration was not set up.

### Possible Improvements

- Connect to a real REST backend (swap out the in-memory interceptor)
- Add Playwright E2E tests covering the create → filter → delete task flow
- Implement `CdkVirtualScrollViewport` for large datasets
- Add a PWA manifest and service worker for offline support
- CI/CD pipeline (GitHub Actions: lint → test → build → deploy to GitHub Pages)
- Docker containerization for local development parity

---

## Development Tooling

This project was developed with **[Claude Code](https://claude.ai/code)** — Anthropic's CLI for AI-assisted development. A `CLAUDE.md` file at the project root documents the project's architecture constraints and conventions so the assistant stays aligned with decisions made across sessions.
