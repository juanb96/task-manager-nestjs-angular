import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from '../application/task.service';
import { TASK_REPOSITORY } from '../domain/task.repository.interface';
import { SqliteTaskRepository } from '../infrastructure/task.repository.sqlite';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: TASK_REPOSITORY,
      useClass: SqliteTaskRepository,
    },
  ],
})
export class TaskModule {}
