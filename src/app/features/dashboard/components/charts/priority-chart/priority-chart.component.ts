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

export interface PriorityChartData {
  high: number;
  medium: number;
  low: number;
}

export interface PriorityChartLabels {
  high: string;
  medium: string;
  low: string;
}

@Component({
  selector: 'app-priority-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './priority-chart.component.html',
})
export class PriorityChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) data!: PriorityChartData;
  @Input({ required: true }) labels!: PriorityChartLabels;
  @Input() title = 'Tasks by Priority';

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
      type: 'bar',
      data: this.buildChartData(),
      options: {
        indexAxis: 'y',
        responsive: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart) return;
    this.chart.data = this.buildChartData();
    this.chart.update();
  }

  private buildChartData() {
    return {
      labels: [this.labels.high, this.labels.medium, this.labels.low],
      datasets: [
        {
          data: [this.data.high, this.data.medium, this.data.low],
          backgroundColor: ['#EF4444', '#F59E0B', '#22C55E'],
          borderRadius: 4,
        },
      ],
    };
  }
}
