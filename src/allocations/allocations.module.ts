import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from './entities/allocation.entity';
import { StaffModule } from 'src/staff/staff.module';
import { CoursesModule } from 'src/courses/courses.module';
import { TimetableModule } from 'src/timetable/timetable.module';

@Module({
  controllers: [AllocationsController],
  providers: [AllocationsService],
  imports: [
    TypeOrmModule.forFeature([Allocation]),
    StaffModule,
    CoursesModule,
    forwardRef(() => TimetableModule),
  ],
  exports: [AllocationsService],
})
export class AllocationsModule {}
