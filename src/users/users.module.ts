import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TimetableModule } from 'src/timetable/timetable.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TimetableModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
