import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({ name: 'relativeDate', standalone: true, pure: true })
export class RelativeDatePipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(value: string): string {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return this.transloco.translate('date.today');
    if (diffDays > 0) return this.transloco.translate('date.inDays', { count: diffDays });
    const absDiff = Math.abs(diffDays);
    return this.transloco.translate('date.daysAgo', { count: absDiff });
  }
}
