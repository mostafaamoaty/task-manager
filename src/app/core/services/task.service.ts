import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Task } from '../models/task.model';

export interface TasksResponse {
  tasks: Task[];
  meta: { totalCount: number; lastUpdated: string };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = '/api/tasks';

  tasksResource = httpResource<Task[]>(() => ({ url: this.baseUrl }));

  getById(id: string) {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(task: Partial<Task>) {
    return this.http.post<Task>(this.baseUrl, task);
  }

  update(id: string, changes: Partial<Task>) {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, changes);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
