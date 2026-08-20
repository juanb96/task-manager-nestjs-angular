import { Task } from './task.entity';

export const TASK_REPOSITORY = Symbol('ITaskRepository');

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
  update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
