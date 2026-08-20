import { TestBed } from '@angular/core/testing';
import { TaskPriority, TaskStatus, Task } from '../../models/task.model';
import { TaskItem } from './task-item';

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Sample task',
    description: 'Some description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdAt: '2026-01-01T00:00:00.000Z',
    position: 0,
    ...overrides,
  };
}

describe('TaskItem', () => {
  it('renders the title, description and priority label', async () => {
    const fixture = TestBed.createComponent(TaskItem);
    fixture.componentRef.setInput('task', buildTask({ title: 'Buy milk', priority: TaskPriority.HIGH }));
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Buy milk');
    expect(compiled.querySelector('.task-card__description')?.textContent).toContain('Some description');
    expect(compiled.textContent).toContain('Alta');
  });

  it('does not render a description element when the task has none', async () => {
    const fixture = TestBed.createComponent(TaskItem);
    fixture.componentRef.setInput('task', buildTask({ description: '' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.task-card__description')).toBeNull();
  });

  it('shows the status badge only when showStatus is true', async () => {
    const fixture = TestBed.createComponent(TaskItem);
    fixture.componentRef.setInput('task', buildTask({ status: TaskStatus.IN_PROGRESS }));
    fixture.detectChanges();
    await fixture.whenStable();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('En progreso');

    fixture.componentRef.setInput('showStatus', true);
    fixture.detectChanges();
    await fixture.whenStable();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('En progreso');
  });

  it('emits edit with the task when the edit button is clicked', async () => {
    const fixture = TestBed.createComponent(TaskItem);
    const task = buildTask();
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    await fixture.whenStable();

    let received: Task | undefined;
    fixture.componentInstance.edit.subscribe((t) => (received = t));

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[title="Editar"]')?.click();

    expect(received).toBe(task);
  });

  it('emits remove with the task id when the delete button is clicked', async () => {
    const fixture = TestBed.createComponent(TaskItem);
    const task = buildTask({ id: 'task-42' });
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    await fixture.whenStable();

    let received: string | undefined;
    fixture.componentInstance.remove.subscribe((id) => (received = id));

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[title="Eliminar"]')?.click();

    expect(received).toBe('task-42');
  });
});
