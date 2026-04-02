import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Statistic } from '../models/statistic.model';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/statistics';

  getStatistics() {
    return this.http.get<{ statistics: Statistic[]; lastUpdated: string }>(this.baseUrl);
  }
}
