import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPolicies, PoliciesGuard } from 'src/auth/policies.guard';
import { Action } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Allocation } from './entities/allocation.entity';

@ApiTags('allocations')
@ApiBearerAuth('Authorization')
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Create, Allocation))
  @Post()
  create(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.create(createAllocationDto);
  }

  // Filter search by filter for staff
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Allocation))
  @Get()
  findAll() {
    return this.allocationsService.findAll();
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Allocation))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allocationsService.findOne(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Allocation))
  @Get('/staff/:id')
  findByStaff(@Param('id') id: string) {
    return this.allocationsService.findByStaffId(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Allocation))
  @Get('/course/:id')
  findByCourse(@Param('id') id: string) {
    return this.allocationsService.findByCourseId(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Update, Allocation))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAllocationDto: UpdateAllocationDto,
  ) {
    return this.allocationsService.update(id, updateAllocationDto);
  }
}
