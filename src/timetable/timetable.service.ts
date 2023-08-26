import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ParsedScrapedExamData, RawScrapedData } from './dto/scraper.dto';
import { ExamType, ModeOfExam, TimeTable } from './entities/timetable.entity';
import axios from 'axios';
import { load } from 'cheerio';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campus } from 'src/courses/entities/course.entity';
import { FetchTimeTableFilter } from './dto/create-timetable.dto';
import { NotifyService } from 'src/timetable/notify.service';

@Injectable()
export class TimetableService {
  private readonly _logger = new Logger(TimetableService.name);
  private readonly CRON_NAME = 'fetch-time-table';
  private readonly DEFAULT_TIME_TABLE_URL =
    'https://sts.ug.edu.gh/timetable/generateschedule';
  private readonly DEFAULT_TIME_TABLE_COURSES = [];
  private readonly CRON_LIVE = process.env.CRON_LIVE === 'true' ? true : false;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(TimeTable)
    private readonly _timetableRepostiry: Repository<TimeTable>,
    private _notifyService: NotifyService,
  ) {}

  async findOne({
    courseCode,
    examType,
    campus,
  }: {
    courseCode: string;
    examType: ExamType;
    campus: Campus;
  }) {
    return await this._timetableRepostiry.findOneBy({
      courseCode,
      examType,
      campus,
    });
  }

  async findAll() {
    return await this._timetableRepostiry.find();
  }

  async fetchTimeTable(
    query?: FetchTimeTableFilter,
    url = this.DEFAULT_TIME_TABLE_URL,
  ) {
    const courses = query.courseCode || this.DEFAULT_TIME_TABLE_COURSES;
    const results: ParsedScrapedExamData[] = [];
    let exams = [];

    if (courses.length === 0) {
      exams = [
        this._fetchTimeTable(
          `${url}?level=${query.level}&title=${query.title}`,
          !!query.dates ? this._getDates(query.dates) : undefined,
        ),
      ];
    } else {
      exams = courses.map((course) => {
        return this._fetchTimeTable(
          `${url}?course_code=${course}&level=${query.level}&title=${query.title}`,
          !!query.dates ? this._getDates(query.dates) : undefined,
        );
      });
    }
    try {
      const settled = await Promise.all(exams);
      results.push(...settled.flat());
      this._logger.verbose('Exams fetched');
      return results;
    } catch (error) {
      this._logger.error('Error fetching exams');
      this._logger.error(error);
    }
  }

  // For testing notifictions only
  // @Cron(CronExpression.EVERY_MINUTE)
  // async notifyStaff() {
  //   console.log('Notifying staff');
  //   // Get all exams for today
  //   const exams = await this._timetableRepostiry.find({});
  //   // Notify staff
  //   await this._notifyService.notifyStaff(exams[30]);
  // }

  start(start: boolean, query?: FetchTimeTableFilter) {
    // This would set the CRON job to run or stop
    if (start) {
      try {
        this._logger.verbose('Starting CRON job');
        const job = new CronJob(
          CronExpression.EVERY_30_SECONDS,
          () => {
            this._logger.verbose('Running CRON job');
            this.updateExams({
              url: `${this.DEFAULT_TIME_TABLE_URL}?level=${query.level}&title=${query.title}`,
              courses: query.courseCode || this.DEFAULT_TIME_TABLE_COURSES,
            });
          },
          null,
          this.CRON_LIVE,
          'Africa/Accra',
        );
        this.schedulerRegistry.addCronJob(this.CRON_NAME, job);
        job.start();
        this._logger.verbose('CRON job started');
      } catch (error) {
        this._logger.error('Error starting CRON job, already started');
      }
    } else {
      try {
        this._logger.verbose('Stopping CRON job');
        const job = this.schedulerRegistry.getCronJob(this.CRON_NAME);
        job.stop();
        this.schedulerRegistry.deleteCronJob(this.CRON_NAME);
        this._logger.verbose(`CRON job stopped, last job at ${job.lastDate()}`);
      } catch (error) {
        // If the CRON job is not found, it means it has not been started
        this._logger.verbose('CRON job not found');
      }
    }
  }

  async updateExams(filter: { url: string; courses: string[] }) {
    this._logger.verbose('Updating exams');
    let exams = [];
    if (filter.courses.length === 0) {
      exams = [
        this._fetchTimeTable(`${filter.url}`, this._getTodayAndTomorrow()),
      ];
    } else {
      exams = filter.courses.map((course) => {
        return this._fetchTimeTable(
          `${filter.url}&course_code=${course}`,
          this._getTodayAndTomorrow(),
        );
      });
    }
    const results: ParsedScrapedExamData[] = [];
    try {
      const settled = await Promise.all(exams);
      results.push(...settled.flat());
      this._logger.verbose('Exams fetched');

      // Remove duplicates, id = [exam.courseCode, exam.examType, exam.campus].join('')
      results.filter(async (exam, index, self) => {
        // Remove duplicates from array
        const id = [exam.courseCode, exam.examType, exam.campus].join('-');
        return (
          index ===
          self.findIndex(
            (e) => [e.courseCode, e.examType, e.campus].join('-') === id,
          )
        );
      });

      // Check if exams exist in database and update
      // If not, create new exams
      for (const exam of results) {
        const examExists = await this._timetableRepostiry.findOneBy({
          courseCode: exam.courseCode,
          examType: exam.examType,
          campus: exam.campus,
        });
        // Check if exam data has changed
        // Update exam
        if (
          examExists &&
          (examExists.date !== exam.date ||
            examExists.time !== exam.time ||
            examExists.venue !== exam.venue ||
            examExists.mode !== exam.mode)
        ) {
          await this._timetableRepostiry.update(examExists.id, exam);
          this._notifyService.notifyStaff(exam);
        } else if (!examExists) {
          // Create new exam
          const timetable = new TimeTable();
          timetable.id = [exam.courseCode, exam.examType, exam.campus].join(
            '-',
          );
          timetable.courseCode = exam.courseCode;
          timetable.examType = exam.examType;
          timetable.date = exam.date;
          timetable.campus = exam.campus;
          timetable.time = exam.time;
          timetable.venue = exam.venue;
          timetable.mode = exam.mode;
          timetable.courseTitle = exam.courseTitle;

          await this._timetableRepostiry.save(timetable);
          this._notifyService.notifyStaff(exam);
        }
      }
      return results;
    } catch (error) {
      this._logger.error('Error fetching exams');
      this._logger.error(error);
    }
  }

  private async _fetchTimeTable(url: string, dates: Date[]) {
    let data: RawScrapedData[] = [];
    if (!!dates) {
      //TODO: Use range of days
      for (const date of dates) {
        const fetchDay = await this._scrapeSite(
          `${url}&exam_date=${date.toLocaleDateString('en-US')}`,
        );
        data.push(...fetchDay);
      }
    } else {
      this._logger.verbose(`Fetching time table from ${url}`);
      data = await this._scrapeSite(url);
    }
    const exams = this._parseData(data);

    this._logger.verbose('Time table fetched');
    return exams;
  }

  private _parseData(data: RawScrapedData[]) {
    const parsedData: ParsedScrapedExamData[] = [];
    data.forEach(({ title, description }) => {
      if (!title && description.length !== 3) {
        return;
      }
      try {
        /**
       * Example of itemDescription
       * {
          title: 'DCIT101-INTRODUCTION TO COMPUTER SCIENCE',
          description: [
            ' Date: April 15, 2023 | Time: 7:30 am',
            'Campus: MAIN CAMPUS',
            "Venue (s): N'BLOCK/K. FOLSON BUILDING, NEW N'BLOCK, "
          ]
        },
       */
        // Retreive Course Code with regex patterns eg: `DCIT101` | `DCIT 101` | `DCI1101` | `DCIT-101`
        const course = title.match(/([A-Z]{2,4}[- ]?[0-9]{3,4})/g)[0].trim();

        // Trim course code to remove spaces and hyphens
        const courseCode = course.replace(/[- ]/g, '');

        // Retreive exam type (main/supplementary) if SUPPLEMENTARY is found in the titl
        // else if main is or is not found in the title it is a main exam
        const examType = title.match(/SUPPLEMENTARY/g)
          ? ExamType.SUPPLEMENTARY
          : ExamType.MAIN;

        // Retreive exam date eg: `April 15, 2023` with regex
        const date = description[0].match(
          /([A-Z][a-z]+ [0-9]{1,2}, [0-9]{4})/g,
        )[0];

        // Retreive exam venue eg: `Venue (s): N'BLOCK/K. FOLSON BUILDING, NEW N'BLOCK,` with regex
        const venue = description[2].split(':')[1].trim();

        // Retreive exam time eg: `7:30 am` with regex
        const time = description[0].match(/([0-9]{1,2}:[0-9]{2} [ap]m)/g)[0];

        // Retrive mode of exams from Campus
        // If campus is MAIN CAMPUS then mode is written
        // else if campus is ONLINE ONSITE then mode is online onsite
        // else if campus is ONLINE then mode is online
        const mode = description[1].match(/(MAIN CAMPUS)/g)
          ? ModeOfExam.WRITTEN
          : description[1].match(/(ONLINE ONSITE)/g)
          ? ModeOfExam.ONLINE_ONSITE
          : ModeOfExam.ONLINE;

        // Retreive campus after campus string eg: `Campus: string` with regex
        const campus: Campus =
          description[1].split(':')[1].trim() === 'DISTANCE EDUCATION'
            ? Campus.DISTANCE
            : description[1].split(':')[1].trim() === 'MAIN CAMPUS'
            ? Campus.LEGON
            : Campus.ACCRA;

        // Create a new object with the extracted data
        // Push the new object into the parsedData array
        parsedData.push({
          courseCode,
          courseTitle: title.trim(),
          examType,
          date,
          time,
          mode,
          venue,
          campus,
        });
      } catch (error) {
        this._logger.error('Error parsing data');
        this._logger.error(title);
        this._logger.error(error);
      }
    });
    return parsedData;
  }

  private async _scrapeSite(url: string): Promise<RawScrapedData[]> {
    // remove all undefined variables from url
    url = url.replace(/undefined/g, '');
    const response = await axios.get(url);
    const pagination = load(response.data);

    // Get the total number of pages in element ul.pagination
    // each li element has an anchor tag with the page number or next/previous
    // Fetch, trim and get highest number
    let pages = pagination('ul.pagination li a')
      .map((index, element) => pagination(element).text().trim())
      .get()
      .reduce((acc, curr) => {
        if (curr === '«' || curr === '»') return acc;
        return Math.max(acc, Number(curr));
      }, 0);

    if (pages === 0) pages = 1;

    const items: { title: string; description: string[] }[] = [];
    // Pagination starts from 1, go through each page and scrape the data
    for (const page of Array.from({ length: pages }, (_, i) => i + 1)) {
      const response = await axios.get(`${url}&page=${page}`);
      const $ = load(response.data);
      // Extract the desired data using Cheerio selectors
      $('.push').each((index, element) => {
        // Skip element if it doesn't have child with class .content
        if ($(element).find('.content').length === 0) return true;
        // Select class .header and get the text in anchor tag element
        const itemTitle = $(element).find('.header a').text();
        // Select class .content and get array of text in paragraph tag elements
        const itemDescription = $(element)
          .find('.content p')
          .map((index, element) => $(element).text())
          .get();

        // Push the data in the items array
        items.push({
          title: itemTitle,
          description: itemDescription,
        });
      });
    }

    return items;
  }

  private _getTodayAndTomorrow() {
    const current_date = new Date();
    const tomorrow = new Date(current_date.setDate(current_date.getDate() + 1));
    const dates = [current_date, tomorrow];
    return dates;
  }

  private _getDates(dates: (number | string | Date)[]) {
    return dates.map((date) => new Date(date));
  }
}
