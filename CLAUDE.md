# CLAUDE.md — Task Manager Project

Context and constraints for Claude Code working in this repository.

## Tech Stack (non-negotiable)

- **Angular 21** — Standalone Components only. No NgModules.
- **`@angular/cdk`** — use for overlays, drag-and-drop, focus trapping, accessibility. Do NOT use Angular Material.
- **Tailwind CSS v4** — CSS-first (no `tailwind.config.js`). Utility classes only.
- **`@jsverse/transloco`** — all user-facing strings must go through Transloco. No hardcoded English strings in templates.
- **`chart.js`** — direct usage, tree-shaken. No chart wrapper libraries.
- **Vitest + @testing-library/angular** — do not use Karma or Jasmine.

## Common Commands

```bash
npm start              # dev server on :4200
npm test               # run all tests once
npm run test:watch     # interactive watch mode
npm run test:coverage  # coverage report → coverage/
npm run lint           # ESLint across all TS and HTML files
npm run build          # production build → dist/
```

## Architecture Rules

- **Smart / Presentational split** — smart components inject services; presentational components accept `@Input()` and emit `@Output()` only.
- **`ChangeDetectionStrategy.OnPush`** on every component — no exceptions.
- **Signals for state** — use `signal()`, `computed()`, `effect()`. Avoid BehaviorSubjects for new state.
- **`takeUntilDestroyed()`** on all RxJS subscriptions. Never unsubscribe manually.
- **`track task.id`** on every `@for` loop over tasks.
- **Lazy-loaded routes** — `dashboard` and `tasks` features are separate route chunks. Keep them that way.

## Folder Conventions

- New features go in `src/app/features/<feature-name>/` with their own routes file and `i18n/` folder.
- Shared presentational components go in `src/app/shared/components/`.
- HTTP services go in `src/app/core/services/`.
- New interceptors go in `src/app/core/interceptors/`.

## Do NOT

- Add Angular Material (`@angular/material`) — CDK + Tailwind is the deliberate choice.
- Write impure pipes.
- Hardcode strings in templates without a Transloco key.
- Use `any` type — `@typescript-eslint/no-explicit-any` is an error.
- Add `console.log` calls — `console.warn` and `console.error` are acceptable.
- Import from `rxjs/internal`.

## Translation Key Convention

- Global keys (nav, actions, errors, confirm dialogs): `assets/i18n/en.json`
- Feature keys: `src/app/features/<feature>/i18n/en.json`
- Always add both `en.json` and `ar.json` keys at the same time.

## Testing Conventions

- All component tests provide `TranslocoTestingModule` with inline mock translations.
- Use `@testing-library/angular` queries (`getByRole`, `getByLabelText`, `getByText`) — not `fixture.debugElement`.
- Unit tests for services use `HttpClientTestingModule`.
- Coverage threshold is 80% — check with `npm run test:coverage` before committing.
