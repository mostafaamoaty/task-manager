import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskFormComponent } from './task-form.component';
import { Task, Assignee } from '../../../../core/models/task.model';
import { getTranslocoTestingProvider } from '../../../../../test-helpers/transloco-testing';

const users: Assignee[] = [
  { id: 'u1', name: 'Alice', avatar: '', email: 'alice@example.com' },
];

const existingTask: Task = {
  id: '1',
  title: 'Existing Task',
  description: 'An existing description',
  status: 'in_progress',
  priority: 'high',
  dueDate: '2030-06-01',
  assignee: users[0],
  tags: ['tag1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('TaskFormComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  it('marks all fields touched and does not emit when onSubmit called with invalid form', async () => {
    const savedSpy = vi.fn();
    const { fixture } = await render(TaskFormComponent, { inputs: { users }, providers });
    fixture.componentInstance.saved.subscribe(savedSpy);

    // Call onSubmit directly (submit button is disabled when form is invalid)
    fixture.componentInstance.onSubmit();

    expect(savedSpy).not.toHaveBeenCalled();
    // markAllAsTouched sets all child controls as touched
    expect(fixture.componentInstance.titleControl.touched).toBe(true);
  });

  it('pre-fills form fields when task input is provided', async () => {
    await render(TaskFormComponent, { inputs: { task: existingTask, users }, providers });
    const titleInput = screen.getByDisplayValue('Existing Task');
    expect(titleInput).toBeTruthy();
  });

  it('emits saved event with correct payload on valid form submit', async () => {
    const savedSpy = vi.fn();
    const { fixture } = await render(TaskFormComponent, { inputs: { users }, providers });
    fixture.componentInstance.saved.subscribe(savedSpy);

    // Fill the form programmatically
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const dateStr = future.toISOString().split('T')[0];

    fixture.componentInstance.form.patchValue({
      title: 'New Task Title',
      description: 'A valid description',
      priority: 'medium',
      status: 'todo',
      dueDate: dateStr,
      assigneeId: 'u1',
    });

    fixture.componentInstance.onSubmit();

    expect(savedSpy).toHaveBeenCalledOnce();
    const payload = savedSpy.mock.calls[0][0];
    expect(payload.title).toBe('New Task Title');
    expect(payload.priority).toBe('medium');
    expect(payload.status).toBe('todo');
    expect(payload.assignee.id).toBe('u1');
  });

  it('emits cancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const cancelSpy = vi.fn();
    const { fixture } = await render(TaskFormComponent, { inputs: { users }, providers });
    fixture.componentInstance.cancel.subscribe(cancelSpy);

    await user.click(screen.getByText('Cancel'));
    expect(cancelSpy).toHaveBeenCalledOnce();
  });

  it('shows validation error for title required', async () => {
    const { fixture } = await render(TaskFormComponent, { inputs: { users }, providers });

    // Call onSubmit to trigger markAllAsTouched
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(screen.getByText('Title is required.')).toBeTruthy();
  });

  it('shows minLength error when title is too short', async () => {
    const { fixture } = await render(TaskFormComponent, { inputs: { users }, providers });

    fixture.componentInstance.form.patchValue({ title: 'ab' });
    fixture.componentInstance.titleControl.markAsTouched();
    fixture.detectChanges();

    expect(screen.getByText('Title must be at least 3 characters.')).toBeTruthy();
  });
});
