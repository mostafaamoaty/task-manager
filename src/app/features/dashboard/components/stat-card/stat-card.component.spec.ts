import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { StatCardComponent } from './stat-card.component';
import { Statistic } from '../../../../core/models/statistic.model';

const makeStat = (changeType: Statistic['changeType'] = 'positive'): Statistic => ({
  id: '1',
  title: 'Total Tasks',
  icon: '📋',
  value: 42,
  change: '+5',
  changeLabel: 'vs last week',
  changeType,
  color: '#4CAF50',
});

describe('StatCardComponent', () => {
  it('renders the stat value and title', async () => {
    await render(StatCardComponent, { inputs: { stat: makeStat() } });
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('Total Tasks')).toBeTruthy();
  });

  it('renders the change badge', async () => {
    await render(StatCardComponent, { inputs: { stat: makeStat() } });
    expect(screen.getByText('+5')).toBeTruthy();
    expect(screen.getByText('vs last week')).toBeTruthy();
  });

  it('applies text-green-600 for positive changeType', async () => {
    const { container } = await render(StatCardComponent, {
      inputs: { stat: makeStat('positive') },
    });
    const badge = container.querySelector('.text-green-600');
    expect(badge).toBeTruthy();
  });

  it('applies text-red-500 for negative changeType', async () => {
    const { container } = await render(StatCardComponent, {
      inputs: { stat: makeStat('negative') },
    });
    const badge = container.querySelector('.text-red-500');
    expect(badge).toBeTruthy();
  });

  it('applies text-gray-500 for neutral changeType', async () => {
    const { container } = await render(StatCardComponent, {
      inputs: { stat: makeStat('neutral') },
    });
    const badge = container.querySelector('.text-gray-500');
    expect(badge).toBeTruthy();
  });
});
