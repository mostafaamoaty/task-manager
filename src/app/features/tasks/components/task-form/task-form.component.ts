import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { Task, Assignee, TaskStatus, TaskPriority } from '../../../../core/models/task.model';
import { futureDateValidator } from '../../../../shared/validators/future-date.validator';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() task: Task | null = null;
  @Input() users: Assignee[] = [];
  @Output() saved = new EventEmitter<Partial<Task>>();
  @Output() formClosed = new EventEmitter<void>();

  submitting = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    priority: ['' as TaskPriority | '', Validators.required],
    status: ['' as TaskStatus | '', Validators.required],
    dueDate: ['', Validators.required],
    assigneeId: ['', Validators.required],
    tags: this.fb.array<string>([]),
  });

  get titleControl(): AbstractControl {
    return this.form.get('title')!;
  }

  get descriptionControl(): AbstractControl {
    return this.form.get('description')!;
  }

  get tagsArray(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  ngOnInit(): void {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        status: this.task.status,
        dueDate: this.task.dueDate,
        assigneeId: this.task.assignee.id,
      });
      this.task.tags.forEach((tag) => this.tagsArray.push(this.fb.control<string>(tag)));
    } else {
      // Apply future date validator only on create
      this.form.get('dueDate')?.addValidators(futureDateValidator());
      this.form.get('dueDate')?.updateValueAndValidity();
    }
  }

  addTag(value: string): void {
    const tag = value.trim();
    if (tag) {
      this.tagsArray.push(this.fb.control<string>(tag));
    }
  }

  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const assignee = this.users.find((u) => u.id === this.form.value.assigneeId);
    const payload: Partial<Task> = {
      title: this.form.value.title!,
      description: this.form.value.description!,
      priority: this.form.value.priority as TaskPriority,
      status: this.form.value.status as TaskStatus,
      dueDate: this.form.value.dueDate!,
      assignee:
        assignee ??
        this.task?.assignee ??
        ({ id: '', name: '', avatar: '', email: '' } as Assignee),
      tags: this.tagsArray.value as string[],
    };
    this.submitting.set(true);
    this.saved.emit(payload);
  }
}
