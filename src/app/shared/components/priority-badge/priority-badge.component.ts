import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TaskPriority } from '../../../core/models/task.model';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './priority-badge.component.html',
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: TaskPriority;

  get colorClass(): string {
    const map: Record<TaskPriority, string> = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return map[this.priority] ?? '';
  }
}
