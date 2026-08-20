import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority, TaskStatus } from '../../domain/task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
