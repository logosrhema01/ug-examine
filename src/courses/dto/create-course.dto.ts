import { Campus } from '../entities/course.entity';

export class CreateCourseDto {
  code: string;
  campus: Campus;
}

export interface CourseFilterDto {
  code?: string;
  campus?: Campus;
}
