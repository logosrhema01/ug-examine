import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPolicies, PoliciesGuard } from 'src/auth/policies.guard';
import { Staff } from './entities/staff.entity';
import { Action } from 'src/casl/casl-ability.factory/casl-ability.factory';

@ApiTags('staff')
@ApiBearerAuth('Authorization')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Create, Staff))
  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Staff))
  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Staff))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Update, Staff))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }
}
