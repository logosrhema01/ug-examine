import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Options,
  Query,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { ApiTags } from '@nestjs/swagger';
import { FetchTimeTableFilter } from './dto/create-timetable.dto';

@ApiTags('timetable')
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
