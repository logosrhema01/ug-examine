import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { AllocationsService } from 'src/allocations/allocations.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { ParsedScrapedExamData } from 'src/timetable/dto/scraper.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotifyService {
  private readonly messengerMicroservice = 'http://localhost:8081';
  private readonly logger: Logger = new Logger(NotifyService.name);
  constructor(
    @Inject(forwardRef(() => AllocationsService))
    private readonly _allocationsService: AllocationsService,
    private readonly httpService: HttpService,
  ) {}

  async notifyStaff(exam: ParsedScrapedExamData) {
    const allocations =
      await this._allocationsService.courseStaffAllocationData(exam);

    if (!allocations) return;

    allocations.forEach(async (allocation) => {
      // Send Http request to messenger service restAPI to Notify staff
      try {
        this.httpService
          .post(this.messengerMicroservice + '/notify', {
            payload: {
              to: [
                `mail:${allocation.staff.email}`,
                `sms:${allocation.staff.phone}`,
              ],
              subject: `${allocation.course} Exam Update Notification`,
              context: {
                message: `Dear Mr./Mrs. ${allocation.staff.surname},\n\nThis is to notify you that the ${allocation.course} exam has been updated to ${allocation.mode} on ${allocation.date} ${allocation.time} at ${allocation.venue}.\n\nRegards,\nExams Office`,
              },
            },
          })
          .subscribe(() => {
            this.logger.log(
              `Notified ${allocation.staff.surname} - ${allocation.staff.email} - ${allocation.staff.id}`,
            );
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async accountCreatedFor(user: User, password: string) {
    try {
      this.httpService
        .post(this.messengerMicroservice + '/notify', {
          payload: {
            to: [`mail:${user.email}`],
            subject: `New UG Examine Account Created for you`,
            context: {
              message: `Dear Mr./Mrs. ${user.fullName},\n\nThis is to notify you that an account with username: ${user.username} and password: ${password} please log on and wview you updates.\n\nRegards,\nExams Office`,
            },
          },
        })
        .subscribe(() => {
          this.logger.log(
            `Notified ${user.username} - ${user.email} - ${user.fullName}`,
          );
        });
    } catch (error) {
      console.log(error);
    }
  }

  async notifyAssignee(assignee: User, ticket: Ticket) {
    try {
      this.httpService
        .post(this.messengerMicroservice + '/notify', {
          payload: {
            to: [`mail:${assignee.email}`],
            subject: `New Ticket Assigned to you on UG Examine`,
            context: {
              message: `Dear Mr./Mrs. ${assignee.fullName},\n\nThis is to notify you that a new ticket with ID: ${ticket.id} has been assigned to you.\n\nRegards,\nExams Office`,
            },
          },
        })
        .subscribe(() => {
          this.logger.log(
            `Notified ${assignee.username} - ${assignee.email} - ${assignee.fullName}`,
          );
        });
    } catch (error) {
      console.log(error);
    }
  }
}
