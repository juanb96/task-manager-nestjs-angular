import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Task } from '../domain/task.entity';
import { ITaskRepository } from '../domain/task.repository.interface';

@Injectable()
export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = [];

  async findAll(): Promise<Task[]> {
    return [...this.tasks].sort((a, b) => a.position - b.position);
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    const updatedTask = { ...this.tasks[index], ...changes };
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    return true;
  }
}
