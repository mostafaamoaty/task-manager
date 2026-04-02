import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';
import { getTranslocoTestingProvider } from '../../../test-helpers/transloco-testing';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'A test task',
  status: 'todo',
  priority: 'medium',
  dueDate: '2030-01-01',
  assignee: { id: 'u1', name: 'User One', avatar: '', email: 'u1@example.com' },
  tags: ['test'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        getTranslocoTestingProvider(),
      ],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getById sends GET to /api/tasks/:id', () => {
    service.getById('1').subscribe((task) => {
      expect(task.id).toBe('1');
    });
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTask);
  });

  it('create sends POST to /api/tasks', () => {
    const payload = { title: 'New Task', description: 'desc' };
    service.create(payload).subscribe((task) => {
      expect(task.title).toBe(mockTask.title);
    });
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockTask);
  });

  it('update sends PUT to /api/tasks/:id', () => {
    const changes = { title: 'Updated' };
    service.update('1', changes).subscribe((task) => {
      expect(task).toBeTruthy();
    });
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(changes);
    req.flush(mockTask);
  });

  it('delete sends DELETE to /api/tasks/:id', () => {
    service.delete('1').subscribe();
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
