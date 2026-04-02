import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TaskStore } from '../../core/store/task.store';
import { StatisticsService } from '../../core/services/statistics.service';
import { Statistic } from '../../core/models/statistic.model';
import { Task } from '../../core/models/task.model';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';
import {
  StatusChartComponent,
  StatusChartData,
} from './components/charts/status-chart/status-chart.component';
import {
  PriorityChartComponent,
  PriorityChartData,
} from './components/charts/priority-chart/priority-chart.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TranslocoDirective,
    StatCardComponent,
    ActivityFeedComponent,
    StatusChartComponent,
    PriorityChartComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private store = inject(TaskStore);
  private statisticsService = inject(StatisticsService);
  private transloco = inject(TranslocoService);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  statistics = signal<Statistic[]>([]);
  loadingStats = signal(true);

  recentActivity = this.store.recentActivity;

  statusChartData = computed<StatusChartData>(() => {
    const byStatus = this.store.tasksByStatus();
    return {
      todo: byStatus.todo.length,
      in_progress: byStatus.in_progress.length,
      done: byStatus.done.length,
    };
  });

  priorityChartData = computed<PriorityChartData>(() => {
    const tasks = this.store.tasks();
    return {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    };
  });

  statusLabels = computed(() => ({
    todo: this.transloco.translate('tasks.status.todo'),
    in_progress: this.transloco.translate('tasks.status.in_progress'),
    done: this.transloco.translate('tasks.status.done'),
  }));

  priorityLabels = computed(() => ({
    high: this.transloco.translate('tasks.priority.high'),
    medium: this.transloco.translate('tasks.priority.medium'),
    low: this.transloco.translate('tasks.priority.low'),
  }));

  ngOnInit(): void {
    this.loadStatistics();
    this.loadTasksFromApi();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistics(): void {
    this.statisticsService
      .getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.statistics.set(res.statistics);
          this.loadingStats.set(false);
        },
        error: () => this.loadingStats.set(false),
      });
  }

  private loadTasksFromApi(): void {
    if (this.store.tasks().length > 0) return;
    this.store.setLoading(true);
    this.http
      .get<Task[]>('/api/tasks')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => this.store.setTasks(tasks),
        error: () => this.store.setLoading(false),
      });
  }
}
