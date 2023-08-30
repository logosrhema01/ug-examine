import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto {
  description?: string;

  status?: TicketStatus;

  assignee?: string;
}
