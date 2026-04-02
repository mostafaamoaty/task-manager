import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Task } from '../../../../core/models/task.model';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { UserAvatarComponent } from '../../../../shared/components/user-avatar/user-avatar.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [TranslocoDirective, RelativeDatePipe, UserAvatarComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-feed.component.html',
})
export class ActivityFeedComponent {
  @Input({ required: true }) activities!: Task[];
}
