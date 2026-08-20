import { Component, computed, input, output } from '@angular/core';
import { Task, TaskStatus } from '../../../models/task.model';

export type BoardView = 'board' | 'list';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly view = input.required<BoardView>();
  readonly tasks = input.required<Task[]>();

  readonly viewChange = output<BoardView>();

  readonly total = computed(() => this.tasks().length);

  readonly counts = computed(() => {
    const tasks = this.tasks();
    return {
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    };
  });

  percentOf(count: number): number {
    const total = this.total();
    return total === 0 ? 0 : (count / total) * 100;
  }

  selectView(view: BoardView): void {
    this.viewChange.emit(view);
  }
}
