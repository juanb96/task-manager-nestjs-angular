import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskForm } from './components/task-form/task-form';
import { StatusFilter, TaskList } from './components/task-list/task-list';
import { CreateTaskRequest, Task, UpdateTaskRequest } from './models/task.model';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  imports: [TaskList, TaskForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly taskService = inject(TaskService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<StatusFilter>('all');
  readonly editingTask = signal<Task | null>(null);

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
      next: (task) => this.tasks.update((tasks) => [...tasks, task]),
      error: () => this.error.set('No se pudo crear la tarea.'),
    });
  }

  onSave(event: { id: string; changes: UpdateTaskRequest }): void {
    this.error.set(null);
    this.taskService.update(event.id, event.changes).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) => tasks.map((task) => (task.id === updated.id ? updated : task)));
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

  onEdit(task: Task): void {
    this.editingTask.set(task);
  }

  onCancelEdit(): void {
    this.editingTask.set(null);
  }

  onFilterChange(filter: StatusFilter): void {
    this.statusFilter.set(filter);
  }
}
