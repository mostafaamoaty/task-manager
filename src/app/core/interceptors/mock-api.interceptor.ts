import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, delay } from 'rxjs';
import { MockDbService } from '../services/mock-db.service';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const db = inject(MockDbService);
  const urlParts = req.url.replace('/api/', '').split('/');
  const collection = urlParts[0];
  const id = urlParts[1];

  let body: unknown = null;
  let status = 200;

  if (collection === 'tasks') {
    if (req.method === 'GET' && !id) {
      body = db.getTasks();
    } else if (req.method === 'GET' && id) {
      body = db.getTaskById(id);
      if (!body) status = 404;
    } else if (req.method === 'POST') {
      body = db.createTask(req.body as Partial<import('../models/task.model').Task>);
      status = 201;
    } else if (req.method === 'PUT' && id) {
      body = db.updateTask(id, req.body as Partial<import('../models/task.model').Task>);
      if (!body) status = 404;
    } else if (req.method === 'DELETE' && id) {
      db.deleteTask(id);
      body = null;
    }
  } else if (collection === 'statistics' && req.method === 'GET') {
    body = db.getStatistics();
  } else if (collection === 'users' && req.method === 'GET') {
    body = db.getUsers();
  }

  return of(new HttpResponse({ body, status })).pipe(delay(300));
};
