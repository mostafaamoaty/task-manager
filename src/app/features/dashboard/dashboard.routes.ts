import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('dashboard')],
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
