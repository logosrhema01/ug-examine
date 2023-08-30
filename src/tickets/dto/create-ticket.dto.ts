import { TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
  description?: string;

  studentID: string;

  status: TicketStatus;

  allocationID: string;
}
