import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TASK_STATUS_LABELS, Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  imports: [DatePipe],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  readonly task = input.required<Task>();

  readonly edit = output<Task>();
  readonly remove = output<string>();

  readonly statusLabels = TASK_STATUS_LABELS;

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onRemove(): void {
    this.remove.emit(this.task().id);
  }
}
