import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('allocations')
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  create(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.create(createAllocationDto);
  }

  // Filter search by filter for staff

  @Get()
  findAll() {
    return this.allocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allocationsService.findOne(id);
  }

  @Get('/staff/:id')
  findByStaff(@Param('id') id: string) {
    return this.allocationsService.findByStaffId(id);
  }

  @Get('/course/:id')
  findByCourse(@Param('id') id: string) {
    return this.allocationsService.findByCourseId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAllocationDto: UpdateAllocationDto,
  ) {
    return this.allocationsService.update(id, updateAllocationDto);
  }
}
