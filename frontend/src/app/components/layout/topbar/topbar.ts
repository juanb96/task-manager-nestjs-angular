import { Component, input, output, signal } from '@angular/core';
import { TASK_PRIORITY_LABELS, TaskPriority } from '../../../models/task.model';

export type PriorityFilter = TaskPriority | 'all';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  readonly search = input<string>('');
  readonly priorityFilter = input<PriorityFilter>('all');

  readonly newTask = output<void>();
  readonly searchChange = output<string>();
  readonly priorityFilterChange = output<PriorityFilter>();

  readonly priorityOptions = Object.values(TaskPriority);
  readonly priorityLabels = TASK_PRIORITY_LABELS;

  readonly filterOpen = signal(false);

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  toggleFilter(): void {
    this.filterOpen.update((open) => !open);
  }

  selectPriority(value: PriorityFilter): void {
    this.priorityFilterChange.emit(value);
    this.filterOpen.set(false);
  }
}
