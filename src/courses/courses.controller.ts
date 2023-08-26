import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseFilterDto, CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPolicies, PoliciesGuard } from 'src/auth/policies.guard';
import { Action } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Course } from './entities/course.entity';

@ApiTags('courses')
@ApiBearerAuth('Authorization')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Create, Course))
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Course))
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Course))
  @Get('single/:id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOneById(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Read, Course))
  @Get('search')
  search(@Query() query: CourseFilterDto) {
    return this.coursesService.search(query);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: any) => ability.can(Action.Update, Course))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }
}
