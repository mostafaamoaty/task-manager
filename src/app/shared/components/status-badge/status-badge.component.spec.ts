import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StatusBadgeComponent } from './status-badge.component';
import { getTranslocoTestingProvider } from '../../../../test-helpers/transloco-testing';

describe('StatusBadgeComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  it('renders "To Do" for todo status', async () => {
    await render(StatusBadgeComponent, { inputs: { status: 'todo' }, providers });
    expect(screen.getByText('To Do')).toBeTruthy();
  });

  it('renders "In Progress" for in_progress status', async () => {
    await render(StatusBadgeComponent, { inputs: { status: 'in_progress' }, providers });
    expect(screen.getByText('In Progress')).toBeTruthy();
  });

  it('renders "Done" for done status', async () => {
    await render(StatusBadgeComponent, { inputs: { status: 'done' }, providers });
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('applies slate color for todo', async () => {
    const { fixture } = await render(StatusBadgeComponent, { inputs: { status: 'todo' }, providers });
    expect(fixture.componentInstance.colorClass).toContain('text-slate-700');
  });

  it('applies blue color for in_progress', async () => {
    const { fixture } = await render(StatusBadgeComponent, { inputs: { status: 'in_progress' }, providers });
    expect(fixture.componentInstance.colorClass).toContain('text-blue-700');
  });

  it('applies green color for done', async () => {
    const { fixture } = await render(StatusBadgeComponent, { inputs: { status: 'done' }, providers });
    expect(fixture.componentInstance.colorClass).toContain('text-green-700');
  });
});
