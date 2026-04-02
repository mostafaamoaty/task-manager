import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Statistic } from '../../../../core/models/statistic.model';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input({ required: true }) stat!: Statistic;
}
