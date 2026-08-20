import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskPriority, TaskStatus } from '../domain/task.entity';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { TASK_REPOSITORY } from '../domain/task.repository.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  // Strictly increasing even if two tasks are created within the same millisecond.
  private lastPosition = 0;

  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: ITaskRepository,
  ) {}

  findAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  create(dto: CreateTaskDto): Promise<Task> {
    this.lastPosition = Math.max(Date.now(), this.lastPosition + 1);

    return this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? TaskStatus.PENDING,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      // New tasks start at the end of the list; drag & drop repositions via update().
      position: this.lastPosition,
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const changes: Partial<Omit<Task, 'id' | 'createdAt'>> = {};
    if (dto.title !== undefined) changes.title = dto.title;
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.status !== undefined) changes.status = dto.status;
    if (dto.priority !== undefined) changes.priority = dto.priority;
    if (dto.position !== undefined) changes.position = dto.position;

    const updated = await this.taskRepository.update(id, changes);
    if (!updated) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
  }
}
