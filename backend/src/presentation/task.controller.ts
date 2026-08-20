import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from '../application/task.service';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';
import { Task } from '../domain/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'List all tasks, sorted by position' })
  @ApiResponse({ status: 200, description: 'Tasks returned successfully' })
  findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.taskService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task (partial)' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto): Promise<Task> {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}
