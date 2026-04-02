import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, attempt: number) => {
        if (error.status !== 0 && error.status !== 503) {
          throw error;
        }
        return timer(Math.pow(2, attempt - 1) * 1000);
      },
    }),
  );
};
