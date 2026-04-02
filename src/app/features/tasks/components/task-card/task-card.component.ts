import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, HostListener, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { Task } from '../../../../core/models/task.model';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { UserAvatarComponent } from '../../../../shared/components/user-avatar/user-avatar.component';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    TranslocoDirective,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    UserAvatarComponent,
    TruncatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() statusChange = new EventEmitter<{ task: Task; status: Task['status'] }>();

  private transloco = inject(TranslocoService);
  menuOpen = signal(false);
  dragging = signal(false);

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  dueDateLabel(dueDate: string): string {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return this.transloco.translate('date.dueToday');
    if (diffDays > 0) return this.transloco.translate('date.dueIn', { count: diffDays });
    return this.transloco.translate('date.overdueBy', { count: Math.abs(diffDays) });
  }
}
