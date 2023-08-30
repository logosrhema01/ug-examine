import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AllocationsService } from 'src/allocations/allocations.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private usersService: UsersService,
    private allocationsService: AllocationsService,
  ) {}

  async create(
    username: string,
    { status, ...createTicketDto }: CreateTicketDto,
  ) {
    // Fetch Ticket reporter from users repository
    const reporter = await this.usersService.findOne(username);

    // Fetch Exam from exams repository
    const allocation = await this.allocationsService.findOne(
      createTicketDto.allocationID,
    );

    let assignee = await this.usersService.findAssignee(allocation.staff);

    if (!assignee) {
      const staff = await this.allocationsService.findOneStaff(
        allocation.staff,
      );
      assignee = await this.usersService.createForAndNotify({
        username: staff.id,
        fullName: `${staff.surname} ${staff.othername}`,
        phoneNumber: staff.phone,
        email: staff.email,
        password: '',
        role: UserRole.STAFF,
      });
    }

    const course = await this.allocationsService.findOneCourse(
      allocation.course,
    );

    // Fetch Ticket assignee from users repository
    // const assignedUser = await this.usersService.findOne(assignee);

    // set Ticket status to 'open' if not provided
    if (!status) {
      status = TicketStatus.OPEN;
    }

    // Combine reporter, course, year and exam type to create a unique ticket ID
    const ticketId = `${reporter.username.toLocaleUpperCase()}-${
      allocation.id
    }-${allocation.year}-${allocation.semmester}`;

    // Check if ticket with same ID already exists
    const ticketExists = await this.ticketsRepository.findOne({
      where: { id: ticketId },
    });

    // If ticket exists, throw error
    if (ticketExists) {
      throw new ConflictException();
    }

    // Create Ticket entity
    const ticket = this.ticketsRepository.create({
      id: ticketId,
      reporter,
      assignee,
      courseId: course.id,
      courseCode: course.code,
      year: allocation.year.toString(),
      semmester: allocation.semmester,
      studentID: username,
      status,
    });

    // Notify assignee
    await this.allocationsService.notifyAssignee(assignee, ticket);

    // Save Ticket entity to repository
    return await this.ticketsRepository.save(ticket);
  }

  async findAll(user: User) {
    const userEntity = await this.usersService.findOne(user.username);
    switch (user.role) {
      case UserRole.STAFF:
        return this.ticketsRepository.find({
          where: { assignee: userEntity },
          loadRelationIds: true,
        });
      case UserRole.STUDENT:
        return this.ticketsRepository.find({
          where: { reporter: userEntity },
          loadRelationIds: true,
        });
      case UserRole.ADMIN:
        return this.ticketsRepository.find({
          loadRelationIds: true,
        });
      default:
        return [];
    }
  }

  findOne(id: string) {
    return this.ticketsRepository.findOne({ where: { id } });
  }

  updateStatus(id: string, { status }: UpdateTicketDto) {
    return this.ticketsRepository.update({ id }, { status });
  }

  remove(id: string) {
    return this.ticketsRepository.delete(id);
  }
}
