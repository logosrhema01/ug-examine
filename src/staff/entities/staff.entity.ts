//Staff: CRUD (id, staffId, name, email, phone, department)

import { Entity, Column } from 'typeorm';

@Entity()
export class Staff {
  @Column({ primary: true })
  id: string;

  @Column()
  surname: string;

  @Column()
  othername: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  department: string;
}
