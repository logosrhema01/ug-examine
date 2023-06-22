export class CreateTimetableDto {}

export class FetchTimeTableFilter {
  dates?: (number | string | Date)[];
  level?: string;
  courseCode?: string[];
  title?: string;
}
