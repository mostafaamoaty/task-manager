import { importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

const en = {
  nav: { dashboard: 'Dashboard', tasks: 'Tasks' },
  actions: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', create: 'Create' },
  errors: {
    generic: 'Something went wrong. Please try again.',
    notFound: 'Resource not found.',
    network: 'Network error. Retrying...',
  },
  confirm: {
    deleteTitle: 'Delete Task',
    deleteMessage: 'Are you sure you want to delete "{{ title }}"? This action cannot be undone.',
  },
  date: {
    today: 'Today',
    inDays: 'in {{ count }} days',
    daysAgo: '{{ count }} days ago',
    overdueBy: 'Overdue by {{ count }} days',
    dueToday: 'Due today',
    dueIn: 'Due in {{ count }} days',
  },
  tasks: {
    title: 'Tasks',
    filters: { search: 'Search tasks...', status: 'Status', priority: 'Priority', assignee: 'Assignee', all: 'All' },
    status: { todo: 'To Do', in_progress: 'In Progress', done: 'Done' },
    priority: { high: 'High', medium: 'Medium', low: 'Low' },
    form: {
      titleLabel: 'Title',
      titlePlaceholder: 'Enter task title',
      descriptionLabel: 'Description',
      dueDateLabel: 'Due Date',
      assigneeLabel: 'Assignee',
      tagsLabel: 'Tags',
      createTitle: 'Create Task',
      editTitle: 'Edit Task',
    },
    validation: {
      titleRequired: 'Title is required.',
      titleMinLength: 'Title must be at least 3 characters.',
      titleDuplicate: 'A task with this title already exists.',
      descriptionRequired: 'Description is required.',
      dueDateRequired: 'Due date is required.',
      dueDateFuture: 'Due date must be in the future.',
      assigneeRequired: 'Assignee is required.',
      priorityRequired: 'Priority is required.',
      statusRequired: 'Status is required.',
    },
    empty: { noTasks: 'No tasks found.', noTasksAction: 'Create your first task' },
    overdue: 'Overdue',
  },
};

export function getTranslocoTestingProvider(options: TranslocoTestingOptions = {}) {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en },
      translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
      preloadLangs: true,
      ...options,
    }),
  );
}
