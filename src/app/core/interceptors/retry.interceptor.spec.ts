import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    httpMock.verify();
  });

  it('does not retry non-GET requests on 503', () => {
    let errored = false;
    http.post('/api/tasks', {}).subscribe({ error: () => (errored = true) });

    const req = httpMock.expectOne('/api/tasks');
    req.flush(null, { status: 503, statusText: 'Service Unavailable' });

    // Only 1 request — no retry for non-GET
    httpMock.expectNone('/api/tasks');
    expect(errored).toBe(true);
  });

  it('does not retry on 404', () => {
    let errored = false;
    http.get('/api/tasks').subscribe({ error: () => (errored = true) });

    const req = httpMock.expectOne('/api/tasks');
    req.flush(null, { status: 404, statusText: 'Not Found' });

    httpMock.expectNone('/api/tasks');
    expect(errored).toBe(true);
  });

  it('succeeds after transient 503 if retry succeeds', async () => {
    let result: unknown;
    http.get('/api/tasks').subscribe({ next: (v) => (result = v) });

    // First request fails with 503
    httpMock.expectOne('/api/tasks').flush(null, { status: 503, statusText: 'Service Unavailable' });

    // Advance past the exponential backoff delay (attempt 1 = 2^0 * 1000 = 1000ms)
    await vi.advanceTimersByTimeAsync(1000);

    // Retry 1 succeeds
    httpMock.expectOne('/api/tasks').flush([{ id: '1' }]);

    expect(result).toEqual([{ id: '1' }]);
  });

  it('retries up to 3 times on 503 and eventually errors', async () => {
    let errored = false;
    http.get('/api/tasks').subscribe({ error: () => (errored = true) });

    // Initial request fails
    httpMock.expectOne('/api/tasks').flush(null, { status: 503, statusText: 'Service Unavailable' });

    // Retry 1 (delay 1s)
    await vi.advanceTimersByTimeAsync(1000);
    httpMock.expectOne('/api/tasks').flush(null, { status: 503, statusText: 'Service Unavailable' });

    // Retry 2 (delay 2s)
    await vi.advanceTimersByTimeAsync(2000);
    httpMock.expectOne('/api/tasks').flush(null, { status: 503, statusText: 'Service Unavailable' });

    // Retry 3 (delay 4s)
    await vi.advanceTimersByTimeAsync(4000);
    httpMock.expectOne('/api/tasks').flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(errored).toBe(true);
  });
});
