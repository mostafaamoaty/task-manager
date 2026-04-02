import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskCardComponent } from './task-card.component';
import { Task } from '../../../../core/models/task.model';
import { getTranslocoTestingProvider } from '../../../../../test-helpers/transloco-testing';

const mockTask: Task = {
  id: '1',
  title: 'Fix Bug #42',
  description: 'There is a critical bug that needs fixing right away.',
  status: 'in_progress',
  priority: 'high',
  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  isOverdue: false,
  assignee: { id: 'u1', name: 'Alice', avatar: '', email: 'alice@example.com' },
  tags: ['bug', 'critical'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('TaskCardComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  it('renders task title', async () => {
    await render(TaskCardComponent, { inputs: { task: mockTask }, providers });
    expect(screen.getByText('Fix Bug #42')).toBeTruthy();
  });

  it('renders truncated description', async () => {
    await render(TaskCardComponent, { inputs: { task: mockTask }, providers });
    expect(screen.getByText(/There is a critical bug/)).toBeTruthy();
  });

  it('renders task tags', async () => {
    await render(TaskCardComponent, { inputs: { task: mockTask }, providers });
    expect(screen.getByText('bug')).toBeTruthy();
    expect(screen.getByText('critical')).toBeTruthy();
  });

  it('opens menu on three-dot button click', async () => {
    const user = userEvent.setup();
    await render(TaskCardComponent, { inputs: { task: mockTask }, providers });
    const menuBtn = screen.getByRole('button', { name: /Actions for/ });
    await user.click(menuBtn);
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('emits edit event when Edit is clicked', async () => {
    const user = userEvent.setup();
    const editSpy = vi.fn();
    const { fixture } = await render(TaskCardComponent, { inputs: { task: mockTask }, providers });
    fixture.componentInstance.edit.subscribe(editSpy);

    await user.click(screen.getByRole('button', { name: /Actions for/ }));
    await user.click(screen.getByText('Edit'));

    expect(editSpy).toHaveBeenCalledWith(mockTask);
  });

  it('emits delete event when Delete is clicked', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.fn();
    const { fixture } = await render(TaskCardComponent, { inputs: { task: mockTask }, providers });
    fixture.componentInstance.delete.subscribe(deleteSpy);

    await user.click(screen.getByRole('button', { name: /Actions for/ }));
    await user.click(screen.getByText('Delete'));

    expect(deleteSpy).toHaveBeenCalledWith(mockTask);
  });

  it('shows overdue styling when task is overdue', async () => {
    const overdueTask: Task = { ...mockTask, isOverdue: true };
    const { container } = await render(TaskCardComponent, { inputs: { task: overdueTask }, providers });
    const dueDateEl = container.querySelector('.text-red-500');
    expect(dueDateEl).toBeTruthy();
  });
});
