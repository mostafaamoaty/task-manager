import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('tasks')],
    loadComponent: () => import('./tasks.component').then((m) => m.TasksComponent),
  },
];
