import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { TaskService } from './task.service';

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

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = `${API_BASE_URL}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAll() issues a GET to /tasks', () => {
    const tasks = [buildTask()];
    let result: Task[] | undefined;

    service.getAll().subscribe((res) => (result = res));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(tasks);

    expect(result).toEqual(tasks);
  });

  it('create() issues a POST to /tasks with the given payload', () => {
    const created = buildTask({ title: 'New task' });

    service.create({ title: 'New task' }).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New task' });
    req.flush(created);
  });

  it('update() issues a PUT to /tasks/:id with the given changes', () => {
    const updated = buildTask({ status: TaskStatus.COMPLETED });

    service.update('task-1', { status: TaskStatus.COMPLETED }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/task-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: TaskStatus.COMPLETED });
    req.flush(updated);
  });

  it('delete() issues a DELETE to /tasks/:id', () => {
    service.delete('task-1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/task-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
