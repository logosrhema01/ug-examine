import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Options,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FetchTimeTableFilter } from './dto/create-timetable.dto';
import { CheckPolicies, PoliciesGuard } from 'src/auth/policies.guard';
import { Action } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { TimeTable } from './entities/timetable.entity';

@ApiTags('timetable')
@ApiBearerAuth('Authorization')
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  findAll(@Query() query: FetchTimeTableFilter) {
    return this.timetableService.fetchTimeTable(query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.timetableService.findOne(id);
  // }

  // This endpoint would be used to enable/disable the CRON job
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Create, TimeTable))
  @Options('cron/:start')
  start(@Param('start') start: string, @Query() query?: FetchTimeTableFilter) {
    if (start === 'true') {
      return this.timetableService.start(true, query);
    } else if (start === 'false') {
      return this.timetableService.start(false, query);
    } else {
      throw new BadRequestException(
        'Invalid value for start parameter. Only true or false is allowed',
      );
    }
  }
}
