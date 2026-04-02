import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { TaskStore } from '../../core/store/task.store';

export function noDuplicateTitleValidator(excludeId?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    const store = inject(TaskStore);
    return toObservable(store.tasks).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      take(1),
      map((tasks) => {
        const duplicate = tasks.some(
          (t) =>
            t.title.toLowerCase() === control.value.toLowerCase() && t.id !== excludeId,
        );
        return duplicate ? { duplicateTitle: true } : null;
      }),
    );
  };
}
