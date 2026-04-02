import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { noDuplicateTitleValidator } from './no-duplicate-title.validator';
import { TaskStore } from '../../core/store/task.store';
import { Task } from '../../core/models/task.model';
import { getTranslocoTestingProvider } from '../../../test-helpers/transloco-testing';

const mockTask: Task = {
  id: '1',
  title: 'Existing Task',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  dueDate: '2030-01-01',
  assignee: { id: 'u1', name: 'User', avatar: '', email: 'u@example.com' },
  tags: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

async function runValidator(
  value: string,
  tasks: Task[],
  excludeId?: string,
): Promise<ValidationErrors | null> {
  return TestBed.runInInjectionContext(async () => {
    const store = TestBed.inject(TaskStore);
    store.setTasks(tasks);
    const control = new FormControl(value);
    const validator = noDuplicateTitleValidator(excludeId);
    return firstValueFrom(validator(control) as Observable<ValidationErrors | null>);
  });
}

describe('noDuplicateTitleValidator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        getTranslocoTestingProvider(),
      ],
    });
  });

  it('returns null for an empty value', async () => {
    const result = await TestBed.runInInjectionContext(async () => {
      const store = TestBed.inject(TaskStore);
      store.setTasks([]);
      const control = new FormControl('');
      const validator = noDuplicateTitleValidator();
      // Empty value returns of(null) synchronously
      const result$ = validator(control);
      return firstValueFrom(result$ as Observable<ValidationErrors | null>);
    });
    expect(result).toBeNull();
  });

  it('returns null for a unique title', async () => {
    const result = await runValidator('A Brand New Title', [mockTask]);
    expect(result).toBeNull();
  });

  it('returns duplicateTitle error for an existing title (case-insensitive)', async () => {
    const result = await runValidator('existing task', [mockTask]);
    expect(result).toEqual({ duplicateTitle: true });
  });

  it('returns null when title matches own excludeId', async () => {
    const result = await runValidator('Existing Task', [mockTask], '1');
    expect(result).toBeNull();
  });
});
