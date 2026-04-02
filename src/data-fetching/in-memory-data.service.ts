import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import tasksData from './tasks.json';
import statisticsData from './statistics.json';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const tasks = tasksData.tasks;
    const statistics = statisticsData.statistics;
    const users = [
      { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
      { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah.smith@company.com' },
      { id: 'user-003', name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@company.com' },
      { id: 'user-004', name: 'Emily Davis', avatar: 'ED', email: 'emily.davis@company.com' },
    ];
    return { tasks, statistics, users };
  }
}
