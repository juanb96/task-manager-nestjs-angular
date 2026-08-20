import { Component, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreateTaskRequest,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
} from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  readonly taskToEdit = input<Task | null>(null);

  readonly create = output<CreateTaskRequest>();
  readonly save = output<{ id: string; changes: UpdateTaskRequest }>();
  readonly cancelEdit = output<void>();

  readonly statusOptions = Object.values(TaskStatus);
  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityOptions = Object.values(TaskPriority);
  readonly priorityLabels = TASK_PRIORITY_LABELS;

  private readonly fb = new FormBuilder();

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    status: [TaskStatus.PENDING, Validators.required],
    priority: [TaskPriority.MEDIUM, Validators.required],
  });

  constructor() {
    effect(() => {
      const task = this.taskToEdit();
      if (task) {
        this.form.setValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
        });
      }
    });
  }

  get isEditing(): boolean {
    return this.taskToEdit() !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const editing = this.taskToEdit();

    if (editing) {
      this.save.emit({ id: editing.id, changes: value });
    } else {
      this.create.emit(value);
      this.form.reset({
        title: '',
        description: '',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      });
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}
