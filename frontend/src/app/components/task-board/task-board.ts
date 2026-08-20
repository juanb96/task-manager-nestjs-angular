import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, effect, input, output, signal } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskItem } from '../task-item/task-item';

interface BoardColumn {
  status: TaskStatus;
  label: string;
  dotClass: string;
  tasks: ReturnType<typeof signal<Task[]>>;
}

@Component({
  selector: 'app-task-board',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, TaskItem],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard {
  readonly tasks = input.required<Task[]>();

  readonly edit = output<Task>();
  readonly remove = output<string>();
  readonly statusChange = output<{ id: string; status: TaskStatus }>();

  readonly columns: BoardColumn[] = [
    { status: TaskStatus.PENDING, label: 'Pendiente', dotClass: 'pending', tasks: signal<Task[]>([]) },
    { status: TaskStatus.IN_PROGRESS, label: 'En progreso', dotClass: 'in-progress', tasks: signal<Task[]>([]) },
    { status: TaskStatus.COMPLETED, label: 'Completada', dotClass: 'completed', tasks: signal<Task[]>([]) },
  ];

  constructor() {
    effect(() => {
      const tasks = this.tasks();
      for (const column of this.columns) {
        column.tasks.set(tasks.filter((task) => task.status === column.status));
      }
    });
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      const column = this.columns.find((c) => c.status === targetStatus)!;
      const items = [...column.tasks()];
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      column.tasks.set(items);
      return;
    }

    const sourceStatus = event.previousContainer.id.replace('col-', '') as TaskStatus;
    const fromColumn = this.columns.find((c) => c.status === sourceStatus)!;
    const toColumn = this.columns.find((c) => c.status === targetStatus)!;

    const fromItems = [...fromColumn.tasks()];
    const toItems = [...toColumn.tasks()];
    transferArrayItem(fromItems, toItems, event.previousIndex, event.currentIndex);
    fromColumn.tasks.set(fromItems);
    toColumn.tasks.set(toItems);

    const movedTask = event.item.data as Task;
    this.statusChange.emit({ id: movedTask.id, status: targetStatus });
  }
}
