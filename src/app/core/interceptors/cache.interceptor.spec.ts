import { describe, it, expect, beforeEach } from 'vitest';
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
import { cacheInterceptor } from './cache.interceptor';

describe('cacheInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear cache between tests by issuing a mutation to /api/tasks
    http.post('/api/tasks', {}).subscribe();
    httpMock.expectOne('/api/tasks').flush({});
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('passes GET request through on cache miss', () => {
    http.get('/api/tasks').subscribe();
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('returns cached response on second GET (no new HTTP request)', () => {
    // First request populates cache
    http.get('/api/tasks').subscribe();
    httpMock.expectOne('/api/tasks').flush([{ id: '1' }]);

    // Second request should hit cache — no HTTP request should be made
    http.get('/api/tasks').subscribe((res) => {
      expect(res).toBeTruthy();
    });
    httpMock.expectNone('/api/tasks');
  });

  it('bypasses cache when Cache-Control: no-cache header is set', () => {
    // Populate cache
    http.get('/api/tasks').subscribe();
    httpMock.expectOne('/api/tasks').flush([]);

    // Force bypass
    http.get('/api/tasks', { headers: { 'Cache-Control': 'no-cache' } }).subscribe();
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('invalidates cache on POST mutation', () => {
    // Populate cache
    http.get('/api/tasks').subscribe();
    httpMock.expectOne('/api/tasks').flush([{ id: '1' }]);

    // POST invalidates cache
    http.post('/api/tasks', {}).subscribe();
    httpMock.expectOne('/api/tasks').flush({});

    // Next GET must go to network
    http.get('/api/tasks').subscribe();
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('does not cache non-GET methods', () => {
    http.delete('/api/tasks/1').subscribe();
    httpMock.expectOne('/api/tasks/1').flush(null);

    // Another DELETE should still go to network
    http.delete('/api/tasks/1').subscribe();
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
