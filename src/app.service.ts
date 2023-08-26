import { Injectable } from '@nestjs/common';
import { CoursesService } from './courses/courses.service';
import { StaffService } from './staff/staff.service';
import { TimetableService } from './timetable/timetable.service';
import { AllocationsService } from './allocations/allocations.service';

@Injectable()
export class AppService {
  constructor(
    private readonly allocationService: AllocationsService,
    private readonly coursesService: CoursesService,
    private readonly staffService: StaffService,
    private readonly timetableService: TimetableService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  // GetAllfunction to return all the data in all the tables for chatbot training
  async getAll() {
    const allocations = await this.allocationService.findAll();
    const courses = await this.coursesService.findAll();
    const staff = await this.staffService.findAll();
    const timetable = await this.timetableService.findAll();
    return { allocations, courses, staff, timetable };
  }
}
