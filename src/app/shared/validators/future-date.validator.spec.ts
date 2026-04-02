import { describe, it, expect } from 'vitest';
import { FormControl } from '@angular/forms';
import { futureDateValidator } from './future-date.validator';

describe('futureDateValidator', () => {
  const validate = futureDateValidator();

  it('returns null when control has no value', () => {
    const control = new FormControl('');
    expect(validate(control)).toBeNull();
  });

  it('returns null for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const control = new FormControl(future.toISOString().split('T')[0]);
    expect(validate(control)).toBeNull();
  });

  it('returns error for a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const control = new FormControl(past.toISOString().split('T')[0]);
    expect(validate(control)).toEqual({ futureDate: true });
  });

  it('returns error for today (same day)', () => {
    const today = new Date().toISOString().split('T')[0];
    const control = new FormControl(today);
    expect(validate(control)).toEqual({ futureDate: true });
  });
});
