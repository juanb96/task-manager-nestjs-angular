import { TestBed } from '@angular/core/testing';
import { Task, TaskPriority, TaskStatus } from '../../../models/task.model';
import { Sidebar } from './sidebar';

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

describe('Sidebar', () => {
  it('counts tasks per status and computes the total', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('view', 'board');
    fixture.componentRef.setInput('tasks', [
      buildTask({ status: TaskStatus.PENDING }),
      buildTask({ status: TaskStatus.PENDING }),
      buildTask({ status: TaskStatus.IN_PROGRESS }),
      buildTask({ status: TaskStatus.COMPLETED }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.total()).toBe(4);
    expect(fixture.componentInstance.counts()).toEqual({ pending: 2, inProgress: 1, completed: 1 });
  });

  it('returns 0% for an empty task list instead of dividing by zero', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('view', 'board');
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.percentOf(0)).toBe(0);
  });

  it('emits viewChange when a nav item is selected', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('view', 'board');
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: string | undefined;
    fixture.componentInstance.viewChange.subscribe((view) => (emitted = view));

    fixture.componentInstance.selectView('list');

    expect(emitted).toBe('list');
  });
});
