import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PriorityBadgeComponent } from './priority-badge.component';
import { getTranslocoTestingProvider } from '../../../../test-helpers/transloco-testing';

describe('PriorityBadgeComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  it('renders "High" label for high priority', async () => {
    await render(PriorityBadgeComponent, { inputs: { priority: 'high' }, providers });
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('renders "Medium" label for medium priority', async () => {
    await render(PriorityBadgeComponent, { inputs: { priority: 'medium' }, providers });
    expect(screen.getByText('Medium')).toBeTruthy();
  });

  it('renders "Low" label for low priority', async () => {
    await render(PriorityBadgeComponent, { inputs: { priority: 'low' }, providers });
    expect(screen.getByText('Low')).toBeTruthy();
  });

  it('applies red color class for high priority', async () => {
    const { fixture } = await render(PriorityBadgeComponent, { inputs: { priority: 'high' }, providers });
    expect(fixture.componentInstance.colorClass).toContain('text-red-700');
  });

  it('applies amber color class for medium priority', async () => {
    const { fixture } = await render(PriorityBadgeComponent, { inputs: { priority: 'medium' }, providers });
    expect(fixture.componentInstance.colorClass).toContain('text-amber-700');
  });

  it('applies green color class for low priority', async () => {
    const { fixture } = await render(PriorityBadgeComponent, { inputs: { priority: 'low' }, providers });
    expect(fixture.componentInstance.colorClass).toContain('text-green-700');
  });
});
