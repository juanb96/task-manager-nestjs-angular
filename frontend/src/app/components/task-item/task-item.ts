import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  imports: [DatePipe],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  readonly task = input.required<Task>();
  readonly showStatus = input(false);

  readonly edit = output<Task>();
  readonly remove = output<string>();

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onRemove(): void {
    this.remove.emit(this.task().id);
  }
}
