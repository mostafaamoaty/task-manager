import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RelativeDatePipe } from './relative-date.pipe';
import { getTranslocoTestingProvider } from '../../../test-helpers/transloco-testing';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

describe('RelativeDatePipe', () => {
  let pipe: RelativeDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        getTranslocoTestingProvider(),
        RelativeDatePipe,
      ],
    });
    pipe = TestBed.runInInjectionContext(() => new RelativeDatePipe());
  });

  it('returns "Today" for today', () => {
    expect(pipe.transform(daysFromNow(0))).toBe('Today');
  });

  it('returns "in N days" for a future date', () => {
    expect(pipe.transform(daysFromNow(3))).toBe('in 3 days');
  });

  it('returns "N days ago" for a past date', () => {
    expect(pipe.transform(daysFromNow(-2))).toBe('2 days ago');
  });
});
