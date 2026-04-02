import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  SimpleChanges,
} from '@angular/core';
import { Chart } from 'chart.js';

export interface StatusChartData {
  todo: number;
  in_progress: number;
  done: number;
}

export interface StatusChartLabels {
  todo: string;
  in_progress: string;
  done: string;
}

@Component({
  selector: 'app-status-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-chart.component.html',
})
export class StatusChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) data!: StatusChartData;
  @Input({ required: true }) labels!: StatusChartLabels;
  @Input() title = 'Tasks by Status';

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['labels']) && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: this.buildChartData(),
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true },
        },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart) return;
    const newData = this.buildChartData();
    this.chart.data = newData;
    this.chart.update();
  }

  private buildChartData() {
    return {
      labels: [this.labels.todo, this.labels.in_progress, this.labels.done],
      datasets: [
        {
          data: [this.data.todo, this.data.in_progress, this.data.done],
          backgroundColor: ['#94A3B8', '#3B82F6', '#22C55E'],
          borderWidth: 2,
          borderColor: ['#fff', '#fff', '#fff'],
        },
      ],
    };
  }
}
