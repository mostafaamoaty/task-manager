import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { getTranslocoTestingProvider } from '../../../../test-helpers/transloco-testing';

describe('ConfirmDialogComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  it('renders the delete title', async () => {
    await render(ConfirmDialogComponent, { inputs: { taskTitle: 'My Task' }, providers });
    expect(screen.getByText('Delete Task')).toBeTruthy();
  });

  it('interpolates task title in delete message', async () => {
    await render(ConfirmDialogComponent, { inputs: { taskTitle: 'My Task' }, providers });
    expect(screen.getByText(/My Task/)).toBeTruthy();
  });

  it('emits confirmed when delete button is clicked', async () => {
    const user = userEvent.setup();
    const confirmedSpy = vi.fn();
    const { fixture } = await render(ConfirmDialogComponent, { inputs: { taskTitle: 'Task' }, providers });
    fixture.componentInstance.confirmed.subscribe(confirmedSpy);

    await user.click(screen.getByText('Delete'));
    expect(confirmedSpy).toHaveBeenCalledOnce();
  });

  it('emits cancelled when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const cancelledSpy = vi.fn();
    const { fixture } = await render(ConfirmDialogComponent, { inputs: { taskTitle: 'Task' }, providers });
    fixture.componentInstance.cancelled.subscribe(cancelledSpy);

    await user.click(screen.getByText('Cancel'));
    expect(cancelledSpy).toHaveBeenCalledOnce();
  });

  it('emits cancelled when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const cancelledSpy = vi.fn();
    const { fixture, container } = await render(ConfirmDialogComponent, { inputs: { taskTitle: 'Task' }, providers });
    fixture.componentInstance.cancelled.subscribe(cancelledSpy);

    const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);
    expect(cancelledSpy).toHaveBeenCalledOnce();
  });
});
