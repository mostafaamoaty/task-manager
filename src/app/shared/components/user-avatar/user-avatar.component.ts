import { Component, Input, ChangeDetectionStrategy, input } from '@angular/core';
import { Assignee } from '../../../core/models/task.model';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-avatar.component.html',
})
export class UserAvatarComponent {
  @Input({ required: true }) user!: Assignee;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showHandle: boolean = false;

  get sizeClass(): string {
    const map = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
    return map[this.size];
  }

  get bgColor(): string {
    let hash = 0;
    for (let i = 0; i < this.user.id.length; i++) {
      hash = this.user.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];
    return colors[Math.abs(hash) % colors.length];
  }
}
