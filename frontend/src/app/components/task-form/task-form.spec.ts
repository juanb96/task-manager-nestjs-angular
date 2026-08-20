import { TestBed } from '@angular/core/testing';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { TaskForm } from './task-form';

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Existing task',
    description: 'Existing description',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    createdAt: '2026-01-01T00:00:00.000Z',
    position: 0,
    ...overrides,
  };
}

describe('TaskForm', () => {
  it('defaults to an empty, pending/medium form when there is no task to edit', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.componentInstance.form;
    expect(form.value).toEqual({
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
    });
    expect(fixture.componentInstance.isEditing).toBe(false);
  });

  it('pre-fills the form and flags isEditing when given a task to edit', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    const task = buildTask();
    fixture.componentRef.setInput('taskToEdit', task);
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.componentInstance.form;
    expect(form.value).toEqual({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
    expect(fixture.componentInstance.isEditing).toBe(true);
  });

  it('does not emit create and marks fields as touched when the title is missing', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let created = false;
    fixture.componentInstance.create.subscribe(() => (created = true));

    fixture.componentInstance.onSubmit();

    expect(created).toBe(false);
    expect(fixture.componentInstance.form.controls.title.touched).toBe(true);
  });

  it('emits create with the form value when submitted in create mode', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let payload: unknown;
    fixture.componentInstance.create.subscribe((value) => (payload = value));

    fixture.componentInstance.form.setValue({
      title: 'New task',
      description: 'New description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
    });
    fixture.componentInstance.onSubmit();

    expect(payload).toEqual({
      title: 'New task',
      description: 'New description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
    });
  });

  it('emits save with the task id and changes when submitted in edit mode', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    const task = buildTask();
    fixture.componentRef.setInput('taskToEdit', task);
    fixture.detectChanges();
    await fixture.whenStable();

    let payload: { id: string; changes: unknown } | undefined;
    fixture.componentInstance.save.subscribe((value) => (payload = value));

    fixture.componentInstance.form.controls.status.setValue(TaskStatus.COMPLETED);
    fixture.componentInstance.onSubmit();

    expect(payload?.id).toBe(task.id);
    expect((payload?.changes as { status: TaskStatus }).status).toBe(TaskStatus.COMPLETED);
  });

  it('emits cancelEdit when cancelled', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let cancelled = false;
    fixture.componentInstance.cancelEdit.subscribe(() => (cancelled = true));

    fixture.componentInstance.onCancel();

    expect(cancelled).toBe(true);
  });
});
