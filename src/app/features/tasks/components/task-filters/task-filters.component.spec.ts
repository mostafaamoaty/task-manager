import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskFiltersComponent } from './task-filters.component';
import { TaskFilters } from '../../../../core/models/task.model';
import { getTranslocoTestingProvider } from '../../../../../test-helpers/transloco-testing';

const defaultFilters: TaskFilters = { status: null, priority: null, assigneeId: null, search: '' };

describe('TaskFiltersComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  it('renders search input', async () => {
    await render(TaskFiltersComponent, { inputs: { filters: defaultFilters }, providers });
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('emits filtersChange with status on select change', async () => {
    const filtersChangeSpy = vi.fn();
    const { fixture } = await render(TaskFiltersComponent, { inputs: { filters: defaultFilters }, providers });
    fixture.componentInstance.filtersChange.subscribe(filtersChangeSpy);

    const selects = document.querySelectorAll('select');
    const statusSelect = selects[0] as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'done' } });

    expect(filtersChangeSpy).toHaveBeenCalledWith({ status: 'done' });
  });

  it('emits filtersChange with null status when select is cleared', async () => {
    const filtersChangeSpy = vi.fn();
    const { fixture } = await render(TaskFiltersComponent, { inputs: { filters: defaultFilters }, providers });
    fixture.componentInstance.filtersChange.subscribe(filtersChangeSpy);

    const selects = document.querySelectorAll('select');
    const statusSelect = selects[0] as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: '' } });

    expect(filtersChangeSpy).toHaveBeenCalledWith({ status: null });
  });

  it('emits filtersChange with priority on select change', async () => {
    const filtersChangeSpy = vi.fn();
    const { fixture } = await render(TaskFiltersComponent, { inputs: { filters: defaultFilters }, providers });
    fixture.componentInstance.filtersChange.subscribe(filtersChangeSpy);

    const selects = document.querySelectorAll('select');
    const prioritySelect = selects[1] as HTMLSelectElement;
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    expect(filtersChangeSpy).toHaveBeenCalledWith({ priority: 'high' });
  });

  it('emits search change after debounce', async () => {
    const user = userEvent.setup({ delay: null });
    const filtersChangeSpy = vi.fn();
    const { fixture } = await render(TaskFiltersComponent, { inputs: { filters: defaultFilters }, providers });
    fixture.componentInstance.filtersChange.subscribe(filtersChangeSpy);

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'bug');

    // Wait for debounce (300ms)
    await new Promise((r) => setTimeout(r, 350));

    expect(filtersChangeSpy).toHaveBeenCalledWith({ search: 'bug' });
  });
});
