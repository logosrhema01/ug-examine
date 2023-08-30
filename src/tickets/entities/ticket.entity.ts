import { Semmesters } from 'src/allocations/entities/allocation.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  studentID: string;

  @Column()
  status: TicketStatus;

  @Column()
  courseId: string;

  @Column()
  courseCode: string;

  @Column()
  year: string;

  @Column()
  semmester: Semmesters;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  reporter: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'staff_id' })
  assignee: User;
}

export enum TicketStatus {
  CREATED = 'created',
  OPEN = 'open',
  IN_PROGRESS = 'investigating',
  CLOSED = 'closed',
}
