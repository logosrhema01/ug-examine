import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AllocationsModule } from 'src/allocations/allocations.module';
// import { ExamsModule } from 'src/exams/exams.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), UsersModule, AllocationsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
