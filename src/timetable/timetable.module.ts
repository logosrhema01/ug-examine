import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTable } from './entities/timetable.entity';
import { AllocationsModule } from 'src/allocations/allocations.module';
import { NotifyService } from './notify.service';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService, NotifyService],
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([TimeTable]),
    forwardRef(() => AllocationsModule),
    HttpModule,
  ],
  exports: [TimetableService, NotifyService],
})
export class TimetableModule {}
