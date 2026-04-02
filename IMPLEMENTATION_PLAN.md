# Task Manager — Implementation Plan

## Tech Stack

| Purpose | Package |
|---|---|
| Framework | Angular 21 (Standalone Components) |
| UI Behavior | `@angular/cdk` (overlay, drag-drop, a11y, scroll, layout) |
| Styling | Tailwind CSS v4 |
| Charts | `chart.js` (direct, tree-shaken — no wrapper) |
| Localization | `@jsverse/transloco` |
| Mock Backend | `angular-in-memory-web-api` |
| Testing | `vitest` + `@testing-library/angular` |
| Linting | `eslint` + `@angular-eslint/*` |
| Formatting | `prettier` + `lint-staged` |
| Git Hooks | `husky` + `commitlint` |

---

## Folder Structure

```
src/
  app/
    core/
      interceptors/
        cache.interceptor.ts
        error.interceptor.ts
        retry.interceptor.ts
      models/
        task.model.ts
        statistic.model.ts
        user.model.ts
      services/
        task.service.ts
        statistics.service.ts
        user.service.ts
      store/
        task.store.ts
    features/
      dashboard/                  # lazy-loaded
        components/
          stat-card/
          activity-feed/
          charts/
            status-chart/
            priority-chart/
        dashboard.component.ts
        dashboard.routes.ts
        i18n/
          en.json
          ar.json
      tasks/                      # lazy-loaded
        components/
          task-list/
          task-card/
          task-filters/
          task-form/
          task-detail/
        tasks.component.ts
        tasks.routes.ts
        i18n/
          en.json
          ar.json
    shared/
      components/
        confirm-dialog/
        skeleton-loader/
        empty-state/
        priority-badge/
        status-badge/
        user-avatar/
      pipes/
        relative-date.pipe.ts
        truncate.pipe.ts
      directives/
        click-outside.directive.ts
      validators/
        future-date.validator.ts
        no-duplicate-title.validator.ts
    app.component.ts
    app.routes.ts
    app.config.ts
  assets/
    i18n/
      en.json           # global/shared keys
      ar.json
  data-fetching/
    generate-data.js
    tasks.json
    statistics.json
    in-memory-data.service.ts
  styles/
    tailwind.css        # @import "tailwindcss" + dark variant
    cdkoverlay.css      # CDK overlay backdrop styles
```

---

## Phase 1 — Project Scaffolding & Infrastructure

### 1.1 Angular Project
- Already scaffolded (Angular 21.2)
- Enable strict TypeScript (`strict: true` in tsconfig)
- Set `changeDetection: ChangeDetectionStrategy.OnPush` as default in `angular.json` schematics

### 1.2 Tailwind CSS
- Already installed (`tailwindcss@4`, `@tailwindcss/postcss`, `postcss`)
- Tailwind v4 is CSS-first: no `tailwind.config.js` needed
- Configure in `styles/tailwind.css` via:
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- Dark mode via `.dark` class on `<html>` (toggled by a signal)

### 1.3 Angular CDK
- `npm install @angular/cdk`
- Import CDK overlay prebuilt styles in `styles/cdkoverlay.css`

### 1.4 Chart.js (tree-shaken setup)
```typescript
// Register only what is needed — no full Chart.js bundle
import {
  Chart,
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  DoughnutController, BarController,
  ArcElement, BarElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
);
```
- Call this once in `app.config.ts` via an `APP_INITIALIZER` token

### 1.5 Transloco (Localization)
- `npm install @jsverse/transloco`
- `ng add @jsverse/transloco` — generates config, loader, and base translation files
- Configure in `app.config.ts`:
  ```typescript
  provideTransloco({
    config: {
      availableLangs: ['en', 'ar'],
      defaultLang: 'en',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader,
  })
  ```
- Translation files loaded lazily per feature scope (see Phase 1.5.1)
- RTL support: `dir` attribute on `<html>` flipped when active language is `ar`

#### 1.5.1 Translation File Structure
```
assets/i18n/en.json          # global keys (nav, common actions, errors)
assets/i18n/ar.json

features/dashboard/i18n/en.json   # dashboard-scoped keys
features/dashboard/i18n/ar.json

features/tasks/i18n/en.json       # tasks-scoped keys
features/tasks/i18n/ar.json
```

Global `en.json` example:
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "tasks": "Tasks"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "notFound": "Resource not found.",
    "network": "Network error. Retrying..."
  },
  "confirm": {
    "deleteTitle": "Delete Task",
    "deleteMessage": "Are you sure you want to delete \"{{ title }}\"? This action cannot be undone."
  }
}
```

Tasks-scoped `en.json` example:
```json
{
  "title": "Tasks",
  "filters": {
    "search": "Search tasks...",
    "status": "Status",
    "priority": "Priority",
    "assignee": "Assignee",
    "all": "All"
  },
  "status": {
    "todo": "To Do",
    "in_progress": "In Progress",
    "done": "Done"
  },
  "priority": {
    "high": "High",
    "medium": "Medium",
    "low": "Low"
  },
  "form": {
    "titleLabel": "Title",
    "titlePlaceholder": "Enter task title",
    "descriptionLabel": "Description",
    "dueDateLabel": "Due Date",
    "assigneeLabel": "Assignee",
    "tagsLabel": "Tags",
    "createTitle": "Create Task",
    "editTitle": "Edit Task"
  },
  "validation": {
    "titleRequired": "Title is required.",
    "titleMinLength": "Title must be at least 3 characters.",
    "titleDuplicate": "A task with this title already exists.",
    "descriptionRequired": "Description is required.",
    "dueDateRequired": "Due date is required.",
    "dueDateFuture": "Due date must be in the future.",
    "assigneeRequired": "Assignee is required.",
    "priorityRequired": "Priority is required.",
    "statusRequired": "Status is required."
  },
  "empty": {
    "noTasks": "No tasks found.",
    "noTasksAction": "Create your first task"
  },
  "overdue": "Overdue"
}
```

#### 1.5.2 Usage in Components
- Use `TranslocoDirective` (`*transloco`) or `TranslocoPipe` in templates
- Inject `TranslocoService` in components that need programmatic translation (e.g. chart labels, form validators error messages)
- Scoped loaders for feature modules: `provideTranslocoScope('tasks')` in `tasks.routes.ts`

```html
<!-- Template usage -->
<ng-container *transloco="let t; read: 'tasks'">
  <input [placeholder]="t('filters.search')" />
  <button>{{ t('form.createTitle') }}</button>
</ng-container>
```

```typescript
// Programmatic usage (e.g. chart labels)
private transloco = inject(TranslocoService);

getChartLabels(): string[] {
  return [
    this.transloco.translate('tasks.status.todo'),
    this.transloco.translate('tasks.status.in_progress'),
    this.transloco.translate('tasks.status.done'),
  ];
}
```

#### 1.5.3 Language Switcher
- `LanguageSwitcherComponent` in `shared/` — dropdown with `en` / `ar` options
- On change: calls `translocoService.setActiveLang(lang)` and flips `dir` on `<html>`
- Active language persisted in `localStorage`

### 1.6 ESLint + Prettier
- `ng add @angular-eslint/schematics`
- Install: `npm install -D eslint-config-prettier lint-staged`
- `.eslintrc.json`: extend `@angular-eslint/recommended`, `@typescript-eslint/recommended`
- Custom rules:
  ```json
  {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@angular-eslint/prefer-on-push-component-change-detection": "error",
    "@angular-eslint/use-injectable-provided-in": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
  ```
- `.prettierrc`: `{ "singleQuote": true, "trailingComma": "all", "printWidth": 100 }`

### 1.7 Husky + Commitlint
- `npx husky-init && npm install`
- `npm install -D @commitlint/config-conventional @commitlint/cli`
- `commitlint.config.js`: extend `@commitlint/config-conventional`
- Hooks:
  - `pre-commit`: `lint-staged` (ESLint + Prettier on staged files)
  - `commit-msg`: `commitlint --edit $1`

### 1.8 Mock Backend
- `npm install angular-in-memory-web-api --save-dev`
- Run `node data-fetching/generate-data.js` to produce `tasks.json` and `statistics.json`
- `InMemoryDataService` implements `InMemoryDbService`, returns the generated JSON as collections
- Register `provideHttpClient()` + `withInterceptorsFromDi()` + `HttpClientInMemoryWebApiModule` (dev only via `isDevMode()`) in `app.config.ts`
- API endpoints:
  - `GET    /api/tasks`
  - `GET    /api/tasks/:id`
  - `POST   /api/tasks`
  - `PUT    /api/tasks/:id`
  - `DELETE /api/tasks/:id`
  - `GET    /api/statistics`
  - `GET    /api/users`

---

## Phase 2 — Core Data Layer

### 2.1 Domain Models (`core/models/`)

```typescript
// task.model.ts
export type TaskStatus   = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ChangeType   = 'positive' | 'negative' | 'neutral';

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  completedAt?: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status: TaskStatus | null;
  priority: TaskPriority | null;
  assigneeId: string | null;
  search: string;
}
```

```typescript
// statistic.model.ts
export interface Statistic {
  id: string;
  title: string;
  icon: string;
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
}
```

### 2.2 HTTP Services using `httpResource()`

```typescript
// task.service.ts
@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = '/api/tasks';

  tasksResource = httpResource<TasksResponse>(() => this.baseUrl);

  getById(id: string)                        { return this.http.get<Task>(`${this.baseUrl}/${id}`); }
  create(task: Partial<Task>)                { return this.http.post<Task>(this.baseUrl, task); }
  update(id: string, changes: Partial<Task>) { return this.http.put<Task>(`${this.baseUrl}/${id}`, changes); }
  delete(id: string)                         { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}
```

### 2.3 Cache Interceptor

- Cache `GET` responses in a `Map<url, { data: unknown; expiresAt: number }>`
- Default TTL: 5 minutes
- Bypass cache if request has `Cache-Control: no-cache` header
- Invalidate relevant cache entries on `POST`, `PUT`, `DELETE` mutations

### 2.4 Error Interceptor

- Catch all HTTP errors
- Map status codes to translated messages via `TranslocoService` (e.g. `errors.generic`, `errors.notFound`)
- Emit to a shared `ErrorService` (signal-based) that the layout component listens to for toast notifications

### 2.5 Retry Interceptor

- Retry `GET` requests up to 3 times on network errors (`0`, `503`)
- Exponential backoff: 1s, 2s, 4s delays
- Do not retry `4xx` errors

### 2.6 Signal-based Task Store

```typescript
// task.store.ts
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private taskService = inject(TaskService);

  // State
  private _tasks   = signal<Task[]>([]);
  private _loading = signal(false);
  private _error   = signal<string | null>(null);
  filters          = signal<TaskFilters>({ status: null, priority: null, assigneeId: null, search: '' });

  // Derived
  tasks         = this._tasks.asReadonly();
  loading       = this._loading.asReadonly();
  error         = this._error.asReadonly();

  filteredTasks = computed(() => {
    const { status, priority, assigneeId, search } = this.filters();
    return this._tasks().filter(t =>
      (!status     || t.status === status) &&
      (!priority   || t.priority === priority) &&
      (!assigneeId || t.assignee.id === assigneeId) &&
      (!search     || t.title.toLowerCase().includes(search.toLowerCase()) ||
                      t.description.toLowerCase().includes(search.toLowerCase()))
    );
  });

  tasksByStatus = computed(() => ({
    todo:        this._tasks().filter(t => t.status === 'todo'),
    in_progress: this._tasks().filter(t => t.status === 'in_progress'),
    done:        this._tasks().filter(t => t.status === 'done'),
  }));

  recentActivity = computed(() =>
    [...this._tasks()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  // Actions
  loadAll()                                  { /* call taskService, update signals */ }
  add(task: Partial<Task>)                   { /* optimistic update + API call */ }
  update(id: string, changes: Partial<Task>) { /* optimistic update + API call */ }
  remove(id: string)                         { /* optimistic delete with rollback on error */ }
  setFilter(patch: Partial<TaskFilters>)     { this.filters.update(f => ({ ...f, ...patch })); }
}
```

---

## Phase 3 — Dashboard Feature (Lazy-Loaded)

**Route:** `/dashboard`
**Transloco scope:** `dashboard`

### 3.1 Smart Component: `DashboardComponent`
- Injects `StatisticsService`, `TaskStore`, and `TranslocoService`
- Passes data down as `@Input()` to all child presentational components
- `ChangeDetectionStrategy.OnPush`

### 3.2 Dumb: `StatCardComponent`
- `@Input() stat: Statistic`
- All labels (title, changeLabel) come from the `stat` object — already translated server-side keys or mapped via Transloco in the smart parent
- Tailwind card: colored left border matching `stat.color`, icon, value, change badge
- `OnPush`

### 3.3 Dumb: `StatusChartComponent`
- `@Input() data: { todo: number; in_progress: number; done: number }`
- `@Input() labels: { todo: string; in_progress: string; done: string }` — translated labels passed from smart parent
- Doughnut chart via Chart.js canvas — manual `AfterViewInit` + `ElementRef`
- Re-renders chart when labels change (e.g. on language switch) via `ngOnChanges`
- `OnPush`, destroy chart in `ngOnDestroy`

### 3.4 Dumb: `PriorityChartComponent`
- `@Input() data: { high: number; medium: number; low: number }`
- `@Input() labels: { high: string; medium: string; low: string }` — translated labels from smart parent
- Horizontal bar chart via Chart.js
- Re-renders on label change via `ngOnChanges`
- `OnPush`, destroy chart in `ngOnDestroy`

### 3.5 Dumb: `ActivityFeedComponent`
- `@Input() activities: Task[]`
- Renders last 5 updated tasks with relative time (via `RelativeDatePipe`)
- Tailwind timeline list — all text via `transloco` directive
- `OnPush`

---

## Phase 4 — Tasks Feature (Lazy-Loaded)

**Route:** `/tasks`
**Transloco scope:** `tasks`

### 4.1 Smart: `TasksComponent`
- Layout shell: filter bar + task list (list view) / kanban board (board view)
- Toggle between list and board view stored in a `signal<'list' | 'board'>`
- Injects `TaskStore`, passes filtered tasks down

### 4.2 Dumb: `TaskFiltersComponent`
- `@Input() filters: TaskFilters`, `@Input() users: Assignee[]`
- `@Output() filtersChange: EventEmitter<Partial<TaskFilters>>`
- Search placeholder, chip labels, and dropdown options all use `transloco` directive
- `OnPush`

### 4.3 Dumb: `TaskCardComponent`
- `@Input() task: Task`
- `@Output() edit`, `@Output() delete`, `@Output() statusChange`
- Displays: title, description truncated, priority badge, status badge, assignee avatar, due date, overdue indicator
- Overdue label and aria labels use `transloco`
- `OnPush`

### 4.4 List View: `TaskListComponent`
- `@Input() tasks: Task[]`
- `@for (task of tasks; track task.id)` — prevents full re-renders
- Stagger enter animation via `@angular/animations`
- `OnPush`

### 4.5 Board View: `TaskBoardComponent`
- Three CDK `cdkDropList` columns: To Do / In Progress / Done
- Column headers use `transloco` (`tasks.status.todo`, etc.)
- `cdkDrag` on each task card
- `(cdkDropListDropped)` calls `store.update()` with new status
- Connected drop lists so tasks can be dragged across columns
- `OnPush`

### 4.6 Task Form (Create/Edit Modal)
- Opened via CDK `Overlay` + `PortalComponent`
- CDK `FocusTrap` keeps focus inside modal; `Escape` key closes
- `@Input() task: Task | null` — `null` means create mode
- All field labels, placeholders, and error messages use `transloco` keys (see `tasks.form.*` and `tasks.validation.*`)
- Reactive Form fields:
  - `title` — required, minLength(3)
  - `description` — required
  - `priority` — required, enum validator
  - `status` — required, enum validator
  - `dueDate` — required, `futureDateValidator` (only on create)
  - `assignee` — required
  - `tags` — dynamic `FormArray`, add/remove tag chips
- Custom async validator: `noDuplicateTitleValidator` — checks store for existing title (debounced)
- On submit: calls `store.add()` or `store.update()`, closes overlay

### 4.7 Confirm Delete Dialog
- CDK Overlay + `PortalComponent`
- Uses `transloco` keys `confirm.deleteTitle` and `confirm.deleteMessage` (with `{{ title }}` interpolation)
- `@Input() taskTitle: string`
- `@Output() confirmed`, `@Output() cancelled`
- Reusable `ConfirmDialogComponent` in `shared/`

---

## Phase 5 — Shared Components

### `SkeletonLoaderComponent`
- `@Input() rows: number`, `@Input() variant: 'card' | 'list' | 'stat'`
- Tailwind `animate-pulse` on placeholder rects/circles
- No text — no translation needed
- Shown while `httpResource.isLoading()` is true

### `EmptyStateComponent`
- `@Input() messageKey: string` — Transloco key, resolved internally via `TranslocoPipe`
- `@Input() actionLabelKey?: string` — Transloco key for action button
- `@Output() action`
- Inline SVG illustration + Tailwind styled text
- `OnPush`

### `LanguageSwitcherComponent`
- Dropdown with `en` and `ar` options
- On change: `translocoService.setActiveLang(lang)`, flips `dir` on `<html>`, persists to `localStorage`
- Displayed in app shell nav bar
- `OnPush`

### `PriorityBadgeComponent`
- `@Input() priority: TaskPriority`
- Label rendered via `transloco` key `tasks.priority.{{ priority }}`
- Color map: high → red, medium → amber, low → green (Tailwind classes)
- `OnPush`

### `StatusBadgeComponent`
- `@Input() status: TaskStatus`
- Label rendered via `transloco` key `tasks.status.{{ status }}`
- Color map: todo → slate, in_progress → blue, done → green
- `OnPush`

### `UserAvatarComponent`
- `@Input() user: Assignee`, `@Input() size: 'sm' | 'md' | 'lg'`
- Renders initials in a colored circle (color derived from user id hash)
- `aria-label` uses user name — no translation key needed
- `OnPush`

### `RelativeDatePipe`
- Pure pipe: `'2 days ago'`, `'in 3 days'`, `'overdue by 1 day'`
- Injects `TranslocoService` to return translated relative strings
- Translation keys in global scope: `date.daysAgo`, `date.inDays`, `date.today`, `date.overdueBy`

### `TruncatePipe`
- Pure pipe: `{{ text | truncate: 80 }}`

### `ClickOutsideDirective`
- `@HostListener('document:click')` checks if click target is outside element
- Used for closing dropdowns

---

## Phase 6 — Testing

### Setup
- **Vitest** already installed (`vitest@4`, `jsdom` already present)
- Install `@testing-library/angular` + `@testing-library/user-event` + `@testing-library/jest-dom`
- Configure `vitest.config.ts` with `jsdom` environment and Angular plugin
- Add `setupFiles: ['@testing-library/jest-dom']`
- Provide a `TranslocoTestingModule` helper to supply mock translations in all component tests

### Unit Tests — Services
- `TaskService`: use `HttpClientTestingModule`, test all CRUD methods and response mapping
- `TaskStore`: instantiate with mock service, test all computed signals across filter combinations
- `CacheInterceptor`: test cache hit, miss, TTL expiry, mutation invalidation
- `RetryInterceptor`: test retry count on `503`, no retry on `404`
- `RelativeDatePipe`: test all date cases (past, future, today, overdue) in both `en` and `ar`

### Unit Tests — Validators
- `futureDateValidator`: valid future date, invalid past date, today edge case
- `noDuplicateTitleValidator`: unique title passes, duplicate title fails

### Component Tests (Testing Library)
- All component tests provide `TranslocoTestingModule` with inline mock translations
- `StatCardComponent`: renders value, change badge with correct color for each `changeType`
- `TaskCardComponent`: renders all task fields, emits correct `@Output()` events on action clicks
- `PriorityBadgeComponent`: renders translated label and correct color class per priority
- `StatusBadgeComponent`: renders translated label per status
- `TaskFiltersComponent`: search input triggers `filtersChange` after debounce, chips update filter state
- `TaskFormComponent`: invalid submission shows translated error messages, valid submission emits correct payload
- `ConfirmDialogComponent`: renders translated task title interpolation, emits `confirmed` / `cancelled` correctly
- `LanguageSwitcherComponent`: switching language calls `setActiveLang` and flips `dir` attribute

### Integration Tests
- `TaskListComponent` + real `TaskStore` + mocked `TaskService` + `TranslocoTestingModule`:
  - Load tasks → renders correct count
  - Apply status filter → list updates
  - Search → debounced filter applies
  - Delete task → confirm dialog → task removed from list
- `TaskBoardComponent`: drag card from `todo` column to `in_progress` → store updated

### Coverage Target
- Minimum **80% coverage** across statements, branches, functions, lines
- Run with `vitest --coverage` and enforce via threshold config in `vitest.config.ts`

---

## Phase 7 — Code Quality & DevOps

### Conventional Commits
Format: `type(scope): description`
Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`, `style`

Examples:
```
feat(tasks): add drag-and-drop kanban board
feat(i18n): add Arabic translation for tasks scope
fix(cache): correct TTL expiry calculation
test(store): add coverage for filter edge cases
```

### Bonus: GitHub Actions CI
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test:ci        # vitest --coverage --run
      - run: npm run build -- --configuration production
```

### Bonus: Docker
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/task-manager/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Performance Checklist

- [ ] `ChangeDetectionStrategy.OnPush` on every component
- [ ] `trackBy` (`track task.id`) on all `@for` loops
- [ ] Lazy-loaded routes for `dashboard` and `tasks` features
- [ ] Transloco scoped loaders — each feature loads only its own translation file
- [ ] Chart.js tree-shaken (only register used controllers/elements)
- [ ] Chart labels re-render on language switch via `ngOnChanges` (not full chart recreation)
- [ ] `httpResource()` caching via interceptor
- [ ] `debounceTime` + `distinctUntilChanged` on search inputs
- [ ] CDK Virtual Scroll for task lists exceeding 100 items
- [ ] Pure pipes only (no impure pipes)
- [ ] `takeUntilDestroyed()` on all RxJS subscriptions (no memory leaks)

---

## Implementation Order

1. **Phase 1** — Scaffolding, Tailwind, CDK, Chart.js, Transloco setup, ESLint, Husky
2. **Phase 2** — Models, services, interceptors, task store
3. **Phase 3** — Dashboard (stats cards, charts, activity feed)
4. **Phase 4** — Tasks feature (list, board, CRUD, filters, form)
5. **Phase 5** — Shared components and pipes (including language switcher)
6. **Phase 6** — Tests (aim for 80%+ coverage, test both languages)
7. **Phase 7** — CI, Docker, final polish and README
