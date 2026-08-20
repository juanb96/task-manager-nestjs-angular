import { TestBed } from '@angular/core/testing';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { TaskList } from './task-list';

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Sample task',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdAt: '2026-01-01T00:00:00.000Z',
    position: 0,
    ...overrides,
  };
}

describe('TaskList', () => {
  const tasks = [
    buildTask({ id: '1', title: 'Pending one', status: TaskStatus.PENDING }),
    buildTask({ id: '2', title: 'In progress one', status: TaskStatus.IN_PROGRESS }),
    buildTask({ id: '3', title: 'Completed one', status: TaskStatus.COMPLETED }),
  ];

  it('shows every task when the filter is "all"', async () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.componentRef.setInput('tasks', tasks);
    fixture.componentRef.setInput('statusFilter', 'all');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.filteredTasks.length).toBe(3);
  });

  it('shows only tasks matching the selected status', async () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.componentRef.setInput('tasks', tasks);
    fixture.componentRef.setInput('statusFilter', TaskStatus.IN_PROGRESS);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.filteredTasks).toEqual([tasks[1]]);
  });

  it('shows the empty state message when there is nothing to display', async () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.componentRef.setInput('tasks', []);
    fixture.componentRef.setInput('statusFilter', 'all');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay tareas para mostrar');
  });

  it('emits filterChange with the selected status', async () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.componentRef.setInput('tasks', tasks);
    fixture.componentRef.setInput('statusFilter', 'all');
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: string | undefined;
    fixture.componentInstance.filterChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onFilterChange(TaskStatus.COMPLETED);

    expect(emitted).toBe(TaskStatus.COMPLETED);
  });
});
