import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './presentation/task.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TaskModule],
})
export class AppModule {}
