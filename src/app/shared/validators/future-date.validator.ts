import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(control.value);
    date.setHours(0, 0, 0, 0);
    return date <= today ? { futureDate: true } : null;
  };
}
