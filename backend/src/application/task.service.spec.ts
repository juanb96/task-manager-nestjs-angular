import { NotFoundException } from '@nestjs/common';
import { Task, TaskPriority, TaskStatus } from '../domain/task.entity';
import { ITaskRepository } from '../domain/task.repository.interface';
import { TaskService } from './task.service';

function createMockRepository(): jest.Mocked<ITaskRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Sample task',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    position: 0,
    ...overrides,
  };
}

describe('TaskService', () => {
  let repository: jest.Mocked<ITaskRepository>;
  let service: TaskService;

  beforeEach(() => {
    // A plain mock of ITaskRepository — no SQLite, no Nest DI container.
    // This is exactly what the Repository pattern buys us: the service
    // never needs to know it's talking to a fake in a test.
    repository = createMockRepository();
    service = new TaskService(repository);
  });

  describe('findAll', () => {
    it('delegates directly to the repository', async () => {
      const tasks = [buildTask()];
      repository.findAll.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(result).toBe(tasks);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('defaults status to pending and priority to medium when omitted', async () => {
      repository.create.mockImplementation(async (task) => buildTask(task));

      await service.create({ title: 'New task' });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New task',
          description: '',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
        }),
      );
    });

    it('respects an explicit status and priority instead of the defaults', async () => {
      repository.create.mockImplementation(async (task) => buildTask(task));

      await service.create({
        title: 'Urgent task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH }),
      );
    });

    it('assigns each new task a smaller position than the previous one, so it sorts first', async () => {
      repository.create.mockImplementation(async (task) => buildTask(task));

      await service.create({ title: 'First' });
      const firstPosition = repository.create.mock.calls[0][0].position;

      await service.create({ title: 'Second' });
      const secondPosition = repository.create.mock.calls[1][0].position;

      expect(secondPosition).toBeLessThan(firstPosition);
    });
  });

  describe('update', () => {
    it('only forwards fields that were actually provided in the DTO', async () => {
      repository.update.mockResolvedValue(buildTask({ status: TaskStatus.COMPLETED }));

      await service.update('task-1', { status: TaskStatus.COMPLETED });

      expect(repository.update).toHaveBeenCalledWith('task-1', { status: TaskStatus.COMPLETED });
    });

    it('does not forward title/description/priority/position when they are undefined', async () => {
      repository.update.mockResolvedValue(buildTask());

      await service.update('task-1', { status: TaskStatus.PENDING });

      expect(repository.update).toHaveBeenCalledWith('task-1', { status: TaskStatus.PENDING });
    });

    it('throws NotFoundException when the repository reports no match', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('missing-id', { title: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the repository reports no deletion', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('resolves without error when the task is deleted', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.remove('task-1')).resolves.toBeUndefined();
    });
  });
});
