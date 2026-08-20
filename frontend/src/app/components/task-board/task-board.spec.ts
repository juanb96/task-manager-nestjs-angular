import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { TaskBoard } from './task-board';

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

function makeTasks(count: number, status: TaskStatus): Task[] {
  return Array.from({ length: count }, (_, i) =>
    buildTask({ id: `${status}-${i}`, title: `Task ${i}`, status, position: i }),
  );
}

// Only the fields TaskBoard.onDrop actually reads — a full CdkDragDrop has
// dozens of internal CDK directive fields that are irrelevant here.
interface FakeDropEventInput {
  previousIndex: number;
  currentIndex: number;
  item: { data: Task };
  container: { id: string };
  previousContainer: { id: string };
}

function buildDropEvent(input: FakeDropEventInput): CdkDragDrop<Task[]> {
  return {
    ...input,
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
    dropPoint: { x: 0, y: 0 },
    event: new MouseEvent('mouseup'),
  } as unknown as CdkDragDrop<Task[]>;
}

describe('TaskBoard', () => {
  it('groups tasks into columns by status', async () => {
    const fixture = TestBed.createComponent(TaskBoard);
    fixture.componentRef.setInput('tasks', [...makeTasks(2, TaskStatus.PENDING), ...makeTasks(1, TaskStatus.IN_PROGRESS)]);
    fixture.detectChanges();
    await fixture.whenStable();

    const pendingColumn = fixture.componentInstance.columns.find((c) => c.status === TaskStatus.PENDING)!;
    const inProgressColumn = fixture.componentInstance.columns.find((c) => c.status === TaskStatus.IN_PROGRESS)!;
    expect(pendingColumn.tasks().length).toBe(2);
    expect(inProgressColumn.tasks().length).toBe(1);
  });

  it('paginates a column once it exceeds the page size (6)', async () => {
    const fixture = TestBed.createComponent(TaskBoard);
    fixture.componentRef.setInput('tasks', makeTasks(8, TaskStatus.PENDING));
    fixture.detectChanges();
    await fixture.whenStable();

    const column = fixture.componentInstance.columns.find((c) => c.status === TaskStatus.PENDING)!;
    expect(fixture.componentInstance.totalPages(column)).toBe(2);
    expect(fixture.componentInstance.pagedTasks(column).length).toBe(6);

    fixture.componentInstance.goToPage(column, 2);
    expect(fixture.componentInstance.pagedTasks(column).length).toBe(2);
  });

  it('computes the midpoint position when reordering within the same column', async () => {
    const fixture = TestBed.createComponent(TaskBoard);
    const a = buildTask({ id: 'a', status: TaskStatus.PENDING, position: 0 });
    const b = buildTask({ id: 'b', status: TaskStatus.PENDING, position: 10 });
    const c = buildTask({ id: 'c', status: TaskStatus.PENDING, position: 20 });
    fixture.componentRef.setInput('tasks', [a, b, c]);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: { id: string; position: number; status: TaskStatus } | undefined;
    fixture.componentInstance.reorder.subscribe((e) => (emitted = e));

    // Same physical list on both sides — onDrop distinguishes "same column"
    // from "different column" by reference equality, just like real CDK does.
    const sameContainer = { id: 'col-pending' };

    // Move "a" (index 0) to land between "b" and "c" (index 1 once removed).
    fixture.componentInstance.onDrop(
      buildDropEvent({
        previousIndex: 0,
        currentIndex: 1,
        item: { data: a },
        container: sameContainer,
        previousContainer: sameContainer,
      }),
      TaskStatus.PENDING,
    );

    expect(emitted?.id).toBe('a');
    expect(emitted?.position).toBe(15);
    expect(emitted?.status).toBe(TaskStatus.PENDING);
  });

  it('computes position and status when moving a task to a different column', async () => {
    const fixture = TestBed.createComponent(TaskBoard);
    const pending = buildTask({ id: 'p1', status: TaskStatus.PENDING, position: 0 });
    const ip1 = buildTask({ id: 'ip1', status: TaskStatus.IN_PROGRESS, position: 10 });
    const ip2 = buildTask({ id: 'ip2', status: TaskStatus.IN_PROGRESS, position: 20 });
    fixture.componentRef.setInput('tasks', [pending, ip1, ip2]);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: { id: string; position: number; status: TaskStatus } | undefined;
    fixture.componentInstance.reorder.subscribe((e) => (emitted = e));

    // Drag "pending" into the in_progress column, dropped between ip1 and ip2.
    fixture.componentInstance.onDrop(
      buildDropEvent({
        previousIndex: 0,
        currentIndex: 1,
        item: { data: pending },
        container: { id: 'col-in_progress' },
        previousContainer: { id: 'col-pending' },
      }),
      TaskStatus.IN_PROGRESS,
    );

    expect(emitted?.id).toBe('p1');
    expect(emitted?.status).toBe(TaskStatus.IN_PROGRESS);
    expect(emitted?.position).toBe(15);
  });

  it('appends to the end of an empty column with a fresh timestamp-based position', async () => {
    const fixture = TestBed.createComponent(TaskBoard);
    const pending = buildTask({ id: 'p1', status: TaskStatus.PENDING, position: 0 });
    fixture.componentRef.setInput('tasks', [pending]);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: { id: string; position: number; status: TaskStatus } | undefined;
    fixture.componentInstance.reorder.subscribe((e) => (emitted = e));

    fixture.componentInstance.onDrop(
      buildDropEvent({
        previousIndex: 0,
        currentIndex: 0,
        item: { data: pending },
        container: { id: 'col-completed' },
        previousContainer: { id: 'col-pending' },
      }),
      TaskStatus.COMPLETED,
    );

    expect(emitted?.status).toBe(TaskStatus.COMPLETED);
    expect(typeof emitted?.position).toBe('number');
  });
});
