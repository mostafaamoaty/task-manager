import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TranslocoDirective } from '@jsverse/transloco';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [DragDropModule, TranslocoDirective, TaskCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-board.component.html',
})
export class TaskBoardComponent {
  @Input({ required: true }) todoTasks!: Task[];
  @Input({ required: true }) inProgressTasks!: Task[];
  @Input({ required: true }) doneTasks!: Task[];
  @Input() statusFilter: TaskStatus | null = null;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() statusChanged = new EventEmitter<{ id: string; status: TaskStatus }>();

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const task = event.container.data[event.currentIndex];
      this.statusChanged.emit({ id: task.id, status: targetStatus });
    }
  }
}
