import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  Ability,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Allocation } from 'src/allocations/entities/allocation.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TimeTable } from 'src/timetable/entities/timetable.entity';
import { User, UserRole } from 'src/users/entities/user.entity';

type Subjects =
  | InferSubjects<
      | typeof Ticket
      | typeof User
      | typeof Allocation
      | typeof Course
      | typeof TimeTable
      | typeof Staff
    >
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.role === UserRole.ADMIN) {
      can(Action.Manage, 'all'); // read-write access to everything
      return build({
        // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
      });
    }

    // User can create a ticket is role is student
    if (user.role === UserRole.STUDENT) {
      can(Action.Create, Ticket);
    }

    can([Action.Update, Action.Read], Staff, {
      id: user.username,
    });

    can([Action.Read], Allocation, {
      staff: user.username,
    });

    // Ticket Permissions
    can([Action.Read, Action.Update], Ticket, {
      assignee: { username: user.username },
    });
    can([Action.Read, Action.Create], Ticket, {
      reporter: { username: user.username },
    });

    cannot(Action.Delete, Ticket);

    cannot(Action.Update, Allocation);
    cannot(Action.Delete, Allocation);
    cannot(Action.Create, Allocation);

    cannot(Action.Update, Course);
    cannot(Action.Delete, Course);
    cannot(Action.Create, Course);

    cannot(Action.Update, TimeTable);
    cannot(Action.Delete, TimeTable);
    cannot(Action.Create, TimeTable);

    cannot(Action.Delete, Staff);
    cannot(Action.Create, Staff);

    can(Action.Read, TimeTable);

    // User Permissions
    can([Action.Read, Action.Update], User, { username: user.username });

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
