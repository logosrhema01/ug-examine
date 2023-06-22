// This Entity is used to store which staff is allocated to which course.

import { ModeOfExam } from 'src/timetable/entities/timetable.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  course: string;

  @Column()
  staff: string;

  @Column()
  description: string;

  @Column()
  year: number;

  @Column()
  noStudents: number;

  @Column()
  semmester: Semmesters;

  @Column()
  modeofExam: ModeOfExam;
}

export enum Semmesters {
  ONE = 1,
  TWO = 2,
}
