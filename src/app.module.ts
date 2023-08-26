/**
 * Entities:
 *  - Timetable: CRUD
 *  - Staff: CRUD (id, staffId, name, email, phone, department)
 *  - Courses: CRUD (id,code,year,sem,mode)
 *  - Allocations: CRUD, many to many (time table, staff, course)
 *  - Admin:
 *  - Tickets: CRUD *
 *  - Students: CRUD *
 *
 * System:
 *  - Fetch timetable from sts.ug.edu.gh/timetable done
 *  - Set started for CRON job to fetch timetable done
 *  - Check for changes in timetable and update database done
 *  - Courses CRUD done
 *  - Staff CRUD done
 *  - Allocate staff to courses CRUD done
 *  - Send notification (NNotifier, Email) to staff when timetable is changed, send schedule for the day and 2 days ahead with starter and stopper, send notification when allocation is changed, send manually
 *  - Payment System for SMS, WA subscription
 *  - Tickets for students
 *  - Add authentication with roles
 *  - Allow admin to upload courses, staff and assignments
 *  - Allow admin to upload attendance * (should they upload the attendance list or just the number of students who attended?)
 *  - NNotifier
 *
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimetableModule } from './timetable/timetable.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './courses/courses.module';
import { StaffModule } from './staff/staff.module';
import { AllocationsModule } from './allocations/allocations.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CaslModule } from './casl/casl.module';
import { AdminUserInitializer } from './admin-user-initializer.provider';

@Module({
  imports: [
    TimetableModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.PSQL_DATABASE_URL,
      synchronize: true,
      autoLoadEntities: true,
    }),
    CaslModule,
    CoursesModule,
    StaffModule,
    AllocationsModule,
    TicketsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, AdminUserInitializer],
})
export class AppModule {}
