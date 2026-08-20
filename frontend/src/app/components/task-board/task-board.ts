import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, effect, input, output, signal } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskItem } from '../task-item/task-item';

const PAGE_SIZE = 6;

interface BoardColumn {
  status: TaskStatus;
  label: string;
  dotClass: string;
  tasks: ReturnType<typeof signal<Task[]>>;
  page: ReturnType<typeof signal<number>>;
}

export interface TaskReorderEvent {
  id: string;
  position: number;
  status: TaskStatus;
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
  readonly reorder = output<TaskReorderEvent>();

  readonly columns: BoardColumn[] = [
    { status: TaskStatus.PENDING, label: 'Pendiente', dotClass: 'pending', tasks: signal<Task[]>([]), page: signal(1) },
    { status: TaskStatus.IN_PROGRESS, label: 'En progreso', dotClass: 'in-progress', tasks: signal<Task[]>([]), page: signal(1) },
    { status: TaskStatus.COMPLETED, label: 'Completada', dotClass: 'completed', tasks: signal<Task[]>([]), page: signal(1) },
  ];

  constructor() {
    effect(() => {
      const tasks = this.tasks();
      for (const column of this.columns) {
        column.tasks.set(tasks.filter((task) => task.status === column.status));
      }
    });
  }

  totalPages(column: BoardColumn): number {
    return Math.max(1, Math.ceil(column.tasks().length / PAGE_SIZE));
  }

  currentPage(column: BoardColumn): number {
    return Math.min(column.page(), this.totalPages(column));
  }

  pagedTasks(column: BoardColumn): Task[] {
    const start = (this.currentPage(column) - 1) * PAGE_SIZE;
    return column.tasks().slice(start, start + PAGE_SIZE);
  }

  goToPage(column: BoardColumn, page: number): void {
    column.page.set(Math.max(1, Math.min(page, this.totalPages(column))));
  }

  /** Midpoint between the two tasks that will surround `index` once the moved task is inserted. */
  private positionForIndex(itemsWithoutMoved: Task[], index: number): number {
    const prev = itemsWithoutMoved[index - 1];
    const next = itemsWithoutMoved[index];
    if (!prev && !next) return Date.now();
    if (!prev) return next.position - 1;
    if (!next) return prev.position + 1;
    return (prev.position + next.position) / 2;
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    const toColumn = this.columns.find((c) => c.status === targetStatus)!;
    const toOffset = (this.currentPage(toColumn) - 1) * PAGE_SIZE;
    const absoluteCurrentIndex = toOffset + event.currentIndex;

    if (event.previousContainer === event.container) {
      const items = [...toColumn.tasks()];
      const absolutePreviousIndex = toOffset + event.previousIndex;
      const [removed] = items.splice(absolutePreviousIndex, 1);

      const position = this.positionForIndex(items, absoluteCurrentIndex);
      const moved = { ...removed, position };
      items.splice(absoluteCurrentIndex, 0, moved);
      toColumn.tasks.set(items);

      this.reorder.emit({ id: moved.id, position, status: targetStatus });
      return;
    }

    const sourceStatus = event.previousContainer.id.replace('col-', '') as TaskStatus;
    const fromColumn = this.columns.find((c) => c.status === sourceStatus)!;
    const fromOffset = (this.currentPage(fromColumn) - 1) * PAGE_SIZE;
    const absolutePreviousIndex = fromOffset + event.previousIndex;

    const fromItems = [...fromColumn.tasks()];
    const toItems = [...toColumn.tasks()];
    const [removed] = fromItems.splice(absolutePreviousIndex, 1);

    const position = this.positionForIndex(toItems, absoluteCurrentIndex);
    const moved = { ...removed, position, status: targetStatus };
    toItems.splice(absoluteCurrentIndex, 0, moved);

    fromColumn.tasks.set(fromItems);
    toColumn.tasks.set(toItems);

    this.reorder.emit({ id: moved.id, position, status: targetStatus });
  }
}
