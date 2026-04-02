import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TaskStore } from './task.store';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { getTranslocoTestingProvider } from '../../../test-helpers/transloco-testing';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Task 1',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  dueDate: '2030-01-01',
  assignee: { id: 'u1', name: 'User', avatar: '', email: 'u@ex.com' },
  tags: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('TaskStore', () => {
  let store: TaskStore;
  let taskService: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        getTranslocoTestingProvider(),
      ],
    });
    store = TestBed.inject(TaskStore);
    taskService = TestBed.inject(TaskService);
  });

  describe('filteredTasks', () => {
    beforeEach(() => {
      store.setTasks([
        makeTask({ id: '1', title: 'Alpha', status: 'todo', priority: 'high', assignee: { id: 'u1', name: 'Alice', avatar: '', email: '' } }),
        makeTask({ id: '2', title: 'Beta', status: 'in_progress', priority: 'low', assignee: { id: 'u2', name: 'Bob', avatar: '', email: '' } }),
        makeTask({ id: '3', title: 'Gamma done', status: 'done', priority: 'medium', assignee: { id: 'u1', name: 'Alice', avatar: '', email: '' } }),
      ]);
    });

    it('returns all tasks when no filters are applied', () => {
      expect(store.filteredTasks().length).toBe(3);
    });

    it('filters by status', () => {
      store.setFilter({ status: 'todo' });
      expect(store.filteredTasks()).toHaveLength(1);
      expect(store.filteredTasks()[0].id).toBe('1');
    });

    it('filters by priority', () => {
      store.setFilter({ priority: 'low' });
      expect(store.filteredTasks()).toHaveLength(1);
      expect(store.filteredTasks()[0].id).toBe('2');
    });

    it('filters by assigneeId', () => {
      store.setFilter({ assigneeId: 'u1' });
      expect(store.filteredTasks()).toHaveLength(2);
    });

    it('filters by search (title match)', () => {
      store.setFilter({ search: 'alpha' });
      expect(store.filteredTasks()).toHaveLength(1);
      expect(store.filteredTasks()[0].id).toBe('1');
    });

    it('filters by search (description match)', () => {
      store.setFilter({ search: 'desc' });
      expect(store.filteredTasks()).toHaveLength(3);
    });

    it('combines multiple filters', () => {
      store.setFilter({ status: 'done', assigneeId: 'u1' });
      expect(store.filteredTasks()).toHaveLength(1);
      expect(store.filteredTasks()[0].id).toBe('3');
    });

    it('returns empty when no tasks match', () => {
      store.setFilter({ search: 'nonexistent' });
      expect(store.filteredTasks()).toHaveLength(0);
    });
  });

  describe('tasksByStatus', () => {
    it('groups tasks by status correctly', () => {
      store.setTasks([
        makeTask({ id: '1', status: 'todo' }),
        makeTask({ id: '2', status: 'todo' }),
        makeTask({ id: '3', status: 'in_progress' }),
        makeTask({ id: '4', status: 'done' }),
      ]);
      const grouped = store.tasksByStatus();
      expect(grouped.todo).toHaveLength(2);
      expect(grouped.in_progress).toHaveLength(1);
      expect(grouped.done).toHaveLength(1);
    });
  });

  describe('recentActivity', () => {
    it('returns up to 5 tasks sorted by updatedAt descending', () => {
      const tasks = Array.from({ length: 7 }, (_, i) =>
        makeTask({ id: String(i), updatedAt: `2025-01-0${i + 1}T00:00:00Z` }),
      );
      store.setTasks(tasks);
      const recent = store.recentActivity();
      expect(recent).toHaveLength(5);
      expect(recent[0].id).toBe('6'); // most recently updated
    });
  });

  describe('add', () => {
    it('appends the created task to the store', () => {
      const newTask = makeTask({ id: '99', title: 'Created' });
      vi.spyOn(taskService, 'create').mockReturnValue(of(newTask));
      store.add({ title: 'Created' });
      expect(store.tasks()).toContainEqual(expect.objectContaining({ id: '99' }));
    });

    it('sets error key on create failure', () => {
      vi.spyOn(taskService, 'create').mockReturnValue(throwError(() => new Error('fail')));
      store.add({ title: 'Bad' });
      expect(store.error()).toBe('errors.generic');
    });
  });

  describe('update', () => {
    it('optimistically updates the task', () => {
      store.setTasks([makeTask({ id: '1', title: 'Original' })]);
      vi.spyOn(taskService, 'update').mockReturnValue(of(makeTask({ id: '1', title: 'Updated' })));
      store.update('1', { title: 'Updated' });
      expect(store.tasks()[0].title).toBe('Updated');
    });

    it('rolls back on update failure', () => {
      store.setTasks([makeTask({ id: '1', title: 'Original' })]);
      vi.spyOn(taskService, 'update').mockReturnValue(throwError(() => new Error('fail')));
      store.update('1', { title: 'Bad' });
      // After rollback, original title is restored
      expect(store.tasks()[0].title).toBe('Original');
      expect(store.error()).toBe('errors.generic');
    });
  });

  describe('remove', () => {
    it('optimistically removes the task', () => {
      store.setTasks([makeTask({ id: '1' }), makeTask({ id: '2' })]);
      vi.spyOn(taskService, 'delete').mockReturnValue(of(undefined));
      store.remove('1');
      expect(store.tasks()).toHaveLength(1);
      expect(store.tasks()[0].id).toBe('2');
    });

    it('rolls back on delete failure', () => {
      store.setTasks([makeTask({ id: '1' })]);
      vi.spyOn(taskService, 'delete').mockReturnValue(throwError(() => new Error('fail')));
      store.remove('1');
      // After rollback, task is restored
      expect(store.tasks()).toHaveLength(1);
      expect(store.error()).toBe('errors.generic');
    });
  });

  describe('setFilter', () => {
    it('merges partial filter updates', () => {
      store.setFilter({ status: 'done' });
      store.setFilter({ priority: 'high' });
      expect(store.filters().status).toBe('done');
      expect(store.filters().priority).toBe('high');
    });
  });
});
