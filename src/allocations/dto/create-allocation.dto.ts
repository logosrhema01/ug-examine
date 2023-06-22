import { ModeOfExam } from 'src/timetable/entities/timetable.entity';
import { Semmesters } from '../entities/allocation.entity';

export class CreateAllocationDto {
  staffId: string;
  courseId: string;
  description: string;
  year: number;
  noStudents?: number;
  modeOfExams?: ModeOfExam;
  semmester: Semmesters;
}
