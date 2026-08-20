import { Component, input, output } from '@angular/core';
import { TASK_STATUS_LABELS, Task, TaskStatus } from '../../models/task.model';
import { TaskItem } from '../task-item/task-item';

export type StatusFilter = TaskStatus | 'all';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  readonly tasks = input.required<Task[]>();
  readonly statusFilter = input<StatusFilter>('all');

  readonly filterChange = output<StatusFilter>();
  readonly edit = output<Task>();
  readonly remove = output<string>();

  readonly statusOptions = Object.values(TaskStatus);
  readonly statusLabels = TASK_STATUS_LABELS;

  get filteredTasks(): Task[] {
    const filter = this.statusFilter();
    const tasks = this.tasks();
    return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
  }

  onFilterChange(value: string): void {
    this.filterChange.emit(value as StatusFilter);
  }
}
