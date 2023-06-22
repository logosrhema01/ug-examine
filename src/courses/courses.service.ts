import { ConflictException, Injectable } from '@nestjs/common';
import { CourseFilterDto, CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly _courseRepository: Repository<Course>,
  ) {}
  async create(createCourseDto: CreateCourseDto) {
    const courseExists = await this._courseRepository.findOneBy({
      code: createCourseDto.code,
      campus: createCourseDto.campus,
    });
    if (courseExists) {
      throw new ConflictException('Course already exists');
    }
    const course = this._courseRepository.create(createCourseDto);
    return await this._courseRepository.save(course);
  }

  findAll() {
    return this._courseRepository.find();
  }

  async search(query: CourseFilterDto) {
    return await this._courseRepository.findBy({
      code: query.code,
      campus: query.campus,
    });
  }

  async findOneById(id: string) {
    return await this._courseRepository.findOneBy({ id });
  }

  update(id: string, updateCourseDto: UpdateCourseDto) {
    return this._courseRepository.update(id, updateCourseDto);
  }

  remove(id: string) {
    return this._courseRepository.delete(id);
  }
}
