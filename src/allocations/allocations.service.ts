import {
  BadRequestException,
  ConflictException,
  Injectable,
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

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation)
    private readonly _allocationRepository: Repository<Allocation>,
    private readonly _staffService: StaffService,
    private readonly _coursesService: CoursesService,
    private readonly _timetableService: TimetableService,
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
    });
    return await this._allocationRepository.save(allocation);
  }

  findAll() {
    return this._allocationRepository.find();
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
    //[x]: If exam date is past but user is trying to update noOfStudents, Return BadRequest
    if (updateAllocationDto.noStudents) {
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

  remove(id: string) {
    return this._allocationRepository.delete({ id });
  }
}
