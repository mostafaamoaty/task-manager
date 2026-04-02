import { Injectable } from '@angular/core';
import tasksData from '../../../data-fetching/tasks.json';
import statisticsData from '../../../data-fetching/statistics.json';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class MockDbService {
  private tasks: Task[] = tasksData.tasks.map((t) => ({
    ...t,
    status: t.status as Task['status'],
    priority: t.priority as Task['priority'],
    isOverdue: t.isOverdue ?? false,
  }));

  private statistics = statisticsData.statistics;

  private users = [
    { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
    { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah.smith@company.com' },
    { id: 'user-003', name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@company.com' },
    { id: 'user-004', name: 'Emily Davis', avatar: 'ED', email: 'emily.davis@company.com' },
  ];

  getTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  createTask(data: Partial<Task>): Task {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: data.title ?? '',
      description: data.description ?? '',
      status: data.status ?? 'todo',
      priority: data.priority ?? 'medium',
      dueDate: data.dueDate ?? '',
      isOverdue: false,
      assignee: data.assignee ?? { id: '', name: '', avatar: '', email: '' },
      tags: data.tags ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks = [...this.tasks, task];
    return task;
  }

  updateTask(id: string, changes: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    const updated = { ...this.tasks[index], ...changes, updatedAt: new Date().toISOString() };
    this.tasks = this.tasks.map((t) => (t.id === id ? updated : t));
    return updated;
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  getStatistics() {
    return { statistics: this.statistics, lastUpdated: new Date().toISOString() };
  }

  getUsers() {
    return this.users;
  }
}
