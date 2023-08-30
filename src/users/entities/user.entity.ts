import { Entity, Column } from 'typeorm';

@Entity()
export class User {
  @Column({ primary: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  role: UserRole;
}

@Entity()
export class TempPassword {
  @Column({ primary: true })
  username: string;

  @Column()
  password: string;
}

export enum UserRole {
  STUDENT = 'student',
  STAFF = 'staff',
  ADMIN = 'admin',
}
