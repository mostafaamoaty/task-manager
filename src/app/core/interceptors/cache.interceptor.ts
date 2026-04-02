import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap, of } from 'rxjs';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    // Invalidate cache for mutations
    cache.forEach((_, key) => {
      if (key.includes('/api/')) cache.delete(key);
    });
    return next(req);
  }

  if (req.headers.get('Cache-Control') === 'no-cache') {
    cache.delete(req.url);
    return next(req);
  }

  const cached = cache.get(req.url);
  if (cached && cached.expiresAt > Date.now()) {
    return of(new HttpResponse({ body: cached.data, status: 200 }));
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, { data: event.body, expiresAt: Date.now() + TTL });
      }
    }),
  );
};
