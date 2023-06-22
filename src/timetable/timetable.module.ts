import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTable } from './entities/timetable.entity';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService],
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([TimeTable])],
  exports: [TimetableService],
})
export class TimetableModule {}
