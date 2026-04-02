import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Assignee, TaskFilters, TaskPriority, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-filters.component.html',
})
export class TaskFiltersComponent implements OnInit, OnDestroy {
  @Input({ required: true }) filters!: TaskFilters;
  @Input() users: Assignee[] = [];
  @Output() filtersChange = new EventEmitter<Partial<TaskFilters>>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchControl.setValue(this.filters.search, { emitEvent: false });
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => this.filtersChange.emit({ search: search ?? '' }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtersChange.emit({ status: (value as TaskStatus) || null });
  }

  onPriorityChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtersChange.emit({ priority: (value as TaskPriority) || null });
  }

  onAssigneeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtersChange.emit({ assigneeId: value || null });
  }
}
