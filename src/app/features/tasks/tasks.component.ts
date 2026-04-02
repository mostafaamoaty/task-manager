import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';
import { TaskStore } from '../../core/store/task.store';
import { UserService } from '../../core/services/user.service';
import { UiEventService } from '../../core/services/ui-event.service';
import { Task, Assignee } from '../../core/models/task.model';
import { TaskBoardComponent } from './components/task-board/task-board.component';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    TranslocoDirective,
    TaskBoardComponent,
    TaskFiltersComponent,
    TaskFormComponent,
    ConfirmDialogComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit, OnDestroy {
  store = inject(TaskStore);
  private userService = inject(UserService);
  private uiEventService = inject(UiEventService);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  showForm = signal(false);
  selectedTask = signal<Task | null>(null);
  taskToDelete = signal<Task | null>(null);
  users = signal<Assignee[]>([]);

  todoTasks = computed(() => this.store.filteredTasks().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.store.filteredTasks().filter(t => t.status === 'in_progress'));
  doneTasks = computed(() => this.store.filteredTasks().filter(t => t.status === 'done'));

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
    this.uiEventService.openCreateTask$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.openCreateForm());
    // Handle case where trigger fired before this component was mounted
    if (this.uiEventService.consumePendingCreateTask()) {
      this.openCreateForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    if (this.store.tasks().length > 0) return;
    this.store.setLoading(true);
    this.http
      .get<Task[]>('/api/tasks')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => this.store.setTasks(tasks),
        error: () => this.store.setLoading(false),
      });
  }

  private loadUsers(): void {
    this.userService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => this.users.set(users as Assignee[]),
      });
  }

  openCreateForm(): void {
    this.selectedTask.set(null);
    this.showForm.set(true);
  }

  openEditForm(task: Task): void {
    this.selectedTask.set(task);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedTask.set(null);
  }

  confirmDelete(task: Task): void {
    this.taskToDelete.set(task);
  }

  onSaved(payload: Partial<Task>): void {
    const task = this.selectedTask();
    if (task) {
      this.store.update(task.id, payload);
    } else {
      this.store.add({
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOverdue: false,
        tags: payload.tags ?? [],
      });
    }
    this.closeForm();
  }

  onDeleteConfirmed(): void {
    const task = this.taskToDelete();
    if (task) this.store.remove(task.id);
    this.taskToDelete.set(null);
  }

  onStatusChanged(event: { id: string; status: Task['status'] }): void {
    this.store.update(event.id, { status: event.status });
  }
}
