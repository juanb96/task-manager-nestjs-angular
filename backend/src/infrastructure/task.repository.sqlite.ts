import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Task, TaskPriority, TaskStatus } from '../domain/task.entity';
import { ITaskRepository } from '../domain/task.repository.interface';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

@Injectable()
export class SqliteTaskRepository implements ITaskRepository, OnModuleDestroy {
  private readonly db: DatabaseSync;

  constructor() {
    const dbPath = process.env.DB_PATH ?? './data/tasks.sqlite';
    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true });
    }
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
  }

  onModuleDestroy(): void {
    this.db.close();
  }

  async findAll(): Promise<Task[]> {
    const rows = this.db.prepare('SELECT * FROM tasks ORDER BY createdAt ASC').all() as unknown as TaskRow[];
    return rows.map((row) => this.toTask(row));
  }

  async findById(id: string): Promise<Task | null> {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as TaskRow | undefined;
    return row ? this.toTask(row) : null;
  }

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: randomUUID(),
      createdAt: new Date(),
    };

    this.db
      .prepare(
        'INSERT INTO tasks (id, title, description, status, priority, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(
        newTask.id,
        newTask.title,
        newTask.description,
        newTask.status,
        newTask.priority,
        newTask.createdAt.toISOString(),
      );

    return newTask;
  }

  async update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Task = { ...existing, ...changes };

    this.db
      .prepare('UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?')
      .run(updated.title, updated.description, updated.status, updated.priority, id);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toTask(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      createdAt: new Date(row.createdAt),
    };
  }
}
