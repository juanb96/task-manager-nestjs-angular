import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from '../application/task.service';
import { TASK_REPOSITORY } from '../domain/task.repository.interface';
import { InMemoryTaskRepository } from '../infrastructure/task.repository.memory';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: TASK_REPOSITORY,
      useClass: InMemoryTaskRepository,
    },
  ],
})
export class TaskModule {}
