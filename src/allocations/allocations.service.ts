import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { StaffService } from 'src/staff/staff.service';
import { Repository } from 'typeorm';
import { Allocation } from './entities/allocation.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Course } from 'src/courses/entities/course.entity';
import { TimetableService } from 'src/timetable/timetable.service';
import { ExamType } from 'src/timetable/entities/timetable.entity';
import { ParsedScrapedExamData } from 'src/timetable/dto/scraper.dto';
import { NotifyService } from 'src/timetable/notify.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation)
    private readonly _allocationRepository: Repository<Allocation>,
    private readonly _staffService: StaffService,
    private readonly _coursesService: CoursesService,
    @Inject(forwardRef(() => TimetableService))
    private readonly _timetableService: TimetableService,
    @Inject(forwardRef(() => NotifyService))
    private readonly _notifyService: NotifyService,
  ) {}
  async create(createAllocationDto: CreateAllocationDto) {
    const staffExists = await this._staffService.findOne(
      createAllocationDto.staffId,
    );
    const courseExists = await this._coursesService.findOneById(
      createAllocationDto.courseId,
    );
    if (!staffExists) {
      throw new BadRequestException('Staff does not exist');
    }
    if (!courseExists) {
      throw new BadRequestException('Course does not exist');
    }
    const allocationExists = await this._allocationRepository.findOneBy({
      staff: staffExists.id,
      course: courseExists.id,
    });
    if (allocationExists) {
      throw new ConflictException('Allocation already exists');
    }
    const allocation = this._allocationRepository.create({
      staff: staffExists.id,
      course: courseExists.id,
      description: createAllocationDto.description,
      year: createAllocationDto.year,
      semmester: createAllocationDto.semmester,
    });
    return await this._allocationRepository.save(allocation);
  }

  async findOneCourse(courseId: string) {
    return await this._coursesService.findOneById(courseId);
  }

  async findOneStaff(staffId: string) {
    return await this._staffService.findOne(staffId);
  }

  findAll() {
    return this._allocationRepository.find().then((allocations) => {
      return Promise.all(
        allocations.map(async (allocation) => {
          const staff = await this._staffService.findOne(allocation.staff);
          const course = await this._coursesService.findOneById(
            allocation.course,
          );
          return {
            ...allocation,
            course: course.code,
            staffId: staff.id,
            staffSurname: staff.surname,
            staffOthername: staff.othername,
          };
        }),
      );
    });
  }

  findOne(id: string) {
    return this._allocationRepository.findOneBy({ id });
  }

  findByStaffId(staffId: string) {
    return this._allocationRepository.find({
      where: { staff: staffId },
    });
  }

  findByCourseId(courseId: string) {
    return this._allocationRepository.find({
      where: { course: courseId },
    });
  }

  findOneByStaffIdAndCourseId(staffId: string, courseId: string) {
    return this._allocationRepository.findOneBy({
      staff: staffId,
      course: courseId,
    });
  }

  async courseStaffAllocationData(exam: ParsedScrapedExamData): Promise<
    {
      staff: Staff;
      course: string;
      mode: string;
      venue: string;
      date: string;
      time: string;
      examType: ExamType;
    }[]
  > {
    const course = await this._coursesService.search({
      code: exam.courseCode,
      campus: exam.campus,
    });

    if (!course) {
      return [];
    }

    const allocations = [];

    const allocation = await this._allocationRepository.find({
      where: {
        course: course[0].id,
        year: this.getYear(exam.date),
      },
    });
    if (!allocation) throw new BadRequestException('Course has no allocation');
    allocations.push(...allocation);

    const result = [];

    for (const allocation of allocations) {
      const staff: Omit<Staff, 'id'> = await this._staffService.findOne(
        allocation.staff,
      );
      result.push({
        staff,
        course: course[0].code,
        mode: exam.mode,
        venue: exam.venue,
        date: exam.date,
        time: exam.time,
        examType: exam.examType,
      });
    }

    return result;
  }

  async update(id: string, updateAllocationDto: UpdateAllocationDto) {
    let staffExists: Staff;
    let courseExists: Course;
    if (updateAllocationDto.staffId) {
      staffExists = await this._staffService.findOne(
        updateAllocationDto.staffId,
      );
      if (!staffExists) {
        throw new BadRequestException('Staff does not exist');
      }
    }
    if (updateAllocationDto.courseId) {
      courseExists = await this._coursesService.findOneById(
        updateAllocationDto.courseId,
      );
      if (!courseExists) {
        throw new BadRequestException('Course does not exist');
      }
    }
    if (updateAllocationDto.noStudents) {
      //TODO: NoOf Students can be changed once, will be update after exam
      const exam = await this._timetableService.findOne({
        courseCode: courseExists.code,
        examType: ExamType.MAIN,
        campus: courseExists.campus,
      });

      if (new Date().getTime() > new Date(exam.date).getTime())
        throw new BadRequestException(
          'You can not edit no of students for past exams',
        );
    }
    // Check which fields are to be updated
    const updateFields = {};
    if (updateAllocationDto.staffId) {
      updateFields['staff'] = staffExists;
    }
    if (updateAllocationDto.courseId) {
      updateFields['course'] = courseExists;
    }
    return this._allocationRepository.update({ id }, updateFields);
  }

  async notifyAssignee(assignee: User, ticket: Ticket) {
    await this._notifyService.notifyAssignee(assignee, ticket);
  }

  remove(id: string) {
    return this._allocationRepository.delete({ id });
  }

  private getYear(date: string | Date): number {
    date = new Date(date);
    return date.getFullYear();
  }
}
