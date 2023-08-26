import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  campus: Campus;
}

export enum Campus {
  LEGON = 'legon',
  ACCRA = 'accra',
  DISTANCE = 'distance',
}
