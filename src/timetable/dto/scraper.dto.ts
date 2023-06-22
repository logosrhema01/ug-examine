import { Campus } from 'src/courses/entities/course.entity';
import { ModeOfExam, ExamType } from '../entities/timetable.entity';

interface RawScrapedData {
  title: string;
  description: string[];
}

interface ParsedScrapedExamData {
  courseCode: string;
  courseTitle?: string;
  examType: ExamType;
  date: string; // Can change
  time: string; // Can change
  mode: ModeOfExam; // Can change
  venue: string; // Can change
  campus: Campus;
}

interface ParsedAssignmentData {
  courseCode: string;
  staffId: string;
  phoneNumber: string;
  email: string;
  year: number;
}

export { RawScrapedData, ParsedScrapedExamData, ParsedAssignmentData };
