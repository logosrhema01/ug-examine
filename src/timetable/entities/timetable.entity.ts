import { Campus } from 'src/courses/entities/course.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class TimeTable {
  @Column({ primary: true })
  id: string;

  @Column()
  courseCode: string;

  @Column()
  courseTitle: string;

  @Column()
  examType: ExamType;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  venue: string;

  @Column()
  campus: Campus;

  @Column()
  mode: ModeOfExam;

  @Column({ nullable: true })
  expectedAttendance: number;
}

enum ModeOfExam {
  WRITTEN = 'WRITTEN',
  ONLINE_ONSITE = 'ONLINE ONSITE',
  ONLINE = 'ONLINE',
}

enum ExamType {
  MAIN = 'main',
  SUPPLEMENTARY = 'supplementary',
}

export { ModeOfExam, ExamType };
