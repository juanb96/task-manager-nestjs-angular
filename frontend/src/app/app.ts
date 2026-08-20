import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Sidebar, BoardView } from './components/layout/sidebar/sidebar';
import { PriorityFilter, Topbar } from './components/layout/topbar/topbar';
import { TaskBoard, TaskReorderEvent } from './components/task-board/task-board';
import { TaskForm } from './components/task-form/task-form';
import { StatusFilter, TaskList } from './components/task-list/task-list';
import { CreateTaskRequest, Task, UpdateTaskRequest } from './models/task.model';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  imports: [Sidebar, Topbar, TaskBoard, TaskList, TaskForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly taskService = inject(TaskService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly view = signal<BoardView>('board');
  readonly search = signal('');
  readonly priorityFilter = signal<PriorityFilter>('all');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly isFormOpen = signal(false);
  readonly editingTask = signal<Task | null>(null);

  readonly visibleTasks = computed(() => {
    const query = this.search().trim().toLowerCase();
    const priority = this.priorityFilter();

    return this.tasks()
      .filter((task) => {
        const matchesSearch = query === '' || task.title.toLowerCase().includes(query);
        const matchesPriority = priority === 'all' || task.priority === priority;
        return matchesSearch && matchesPriority;
      })
      // Updating a task in place (e.g. after a drag & drop reorder) doesn't move it
      // within the array, so re-sort by position to keep the board/list consistent
      // with what the backend just persisted.
      .sort((a, b) => a.position - b.position);
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
        this.loading.set(false);
      },
    });
  }

  onCreate(dto: CreateTaskRequest): void {
    this.error.set(null);
    this.taskService.create(dto).subscribe({
      next: (task) => {
        this.tasks.update((tasks) => [...tasks, task]);
        this.isFormOpen.set(false);
      },
      error: () => this.error.set('No se pudo crear la tarea.'),
    });
  }

  onSave(event: { id: string; changes: UpdateTaskRequest }): void {
    this.error.set(null);
    this.taskService.update(event.id, event.changes).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) => tasks.map((task) => (task.id === updated.id ? updated : task)));
        this.isFormOpen.set(false);
        this.editingTask.set(null);
      },
      error: () => this.error.set('No se pudo actualizar la tarea.'),
    });
  }

  onDelete(id: string): void {
    this.error.set(null);
    this.taskService.delete(id).subscribe({
      next: () => this.tasks.update((tasks) => tasks.filter((task) => task.id !== id)),
      error: () => this.error.set('No se pudo eliminar la tarea.'),
    });
  }

  onReorder(event: TaskReorderEvent): void {
    this.onSave({ id: event.id, changes: { position: event.position, status: event.status } });
  }

  onEdit(task: Task): void {
    this.editingTask.set(task);
    this.isFormOpen.set(true);
  }

  onNewTask(): void {
    this.editingTask.set(null);
    this.isFormOpen.set(true);
  }

  onCloseForm(): void {
    this.isFormOpen.set(false);
    this.editingTask.set(null);
  }

  onViewChange(view: BoardView): void {
    this.view.set(view);
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  onPriorityFilterChange(value: PriorityFilter): void {
    this.priorityFilter.set(value);
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.statusFilter.set(value);
  }
}
