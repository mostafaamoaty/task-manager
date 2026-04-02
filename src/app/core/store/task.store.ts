import { Injectable, inject, signal, computed } from '@angular/core';
import { Task, TaskFilters } from '../models/task.model';
import { TaskService } from '../services/task.service';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private taskService = inject(TaskService);

  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  filters = signal<TaskFilters>({ status: null, priority: null, assigneeId: null, search: '' });

  tasks = this._tasks.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  filteredTasks = computed(() => {
    const { status, priority, assigneeId, search } = this.filters();
    return this._tasks().filter(
      (t) =>
        (!status || t.status === status) &&
        (!priority || t.priority === priority) &&
        (!assigneeId || t.assignee.id === assigneeId) &&
        (!search ||
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())),
    );
  });

  tasksByStatus = computed(() => ({
    todo: this._tasks().filter((t) => t.status === 'todo'),
    in_progress: this._tasks().filter((t) => t.status === 'in_progress'),
    done: this._tasks().filter((t) => t.status === 'done'),
  }));

  recentActivity = computed(() =>
    [...this._tasks()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
  );

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.taskService.tasksResource.value();
    // Use the resource's reactive value
    const tasks = this.taskService.tasksResource.value();
    if (tasks) {
      this._tasks.set(tasks);
      this._loading.set(false);
    }
  }

  loadTasks(): void {
    this._loading.set(true);
    this._error.set(null);
    this.taskService
      .getById('') // workaround - use direct HTTP
      .subscribe({
        error: () => {
          this._loading.set(false);
          this._error.set('errors.generic');
        },
      });
  }

  add(task: Partial<Task>): void {
    this.taskService.create(task).subscribe({
      next: (created) => {
        this._tasks.update((tasks) => [...tasks, created]);
      },
      error: () => this._error.set('errors.generic'),
    });
  }

  update(id: string, changes: Partial<Task>): void {
    const original = this._tasks().find((t) => t.id === id);
    // Optimistic update
    this._tasks.update((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    );
    this.taskService.update(id, changes).subscribe({
      error: () => {
        // Rollback
        if (original) {
          this._tasks.update((tasks) => tasks.map((t) => (t.id === id ? original : t)));
        }
        this._error.set('errors.generic');
      },
    });
  }

  remove(id: string): void {
    const original = this._tasks().find((t) => t.id === id);
    // Optimistic delete
    this._tasks.update((tasks) => tasks.filter((t) => t.id !== id));
    this.taskService.delete(id).subscribe({
      error: () => {
        // Rollback
        if (original) {
          this._tasks.update((tasks) => [...tasks, original]);
        }
        this._error.set('errors.generic');
      },
    });
  }

  setFilter(patch: Partial<TaskFilters>): void {
    this.filters.update((f) => ({ ...f, ...patch }));
  }

  setTasks(tasks: Task[]): void {
    this._tasks.set(tasks);
    this._loading.set(false);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
