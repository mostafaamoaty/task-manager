import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiEventService {
  private _openCreateTask$ = new Subject<void>();
  openCreateTask$ = this._openCreateTask$.asObservable();

  /** True when a create-task was triggered before the tasks page was mounted. */
  pendingCreateTask = false;

  triggerCreateTask(): void {
    this.pendingCreateTask = true;
    this._openCreateTask$.next();
  }

  consumePendingCreateTask(): boolean {
    const pending = this.pendingCreateTask;
    this.pendingCreateTask = false;
    return pending;
  }
}
