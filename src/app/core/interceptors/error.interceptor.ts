import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let messageKey = 'errors.generic';
      if (error.status === 404) messageKey = 'errors.notFound';
      else if (error.status === 0 || error.status === 503) messageKey = 'errors.network';
      errorService.setError(messageKey);
      return throwError(() => error);
    }),
  );
};
