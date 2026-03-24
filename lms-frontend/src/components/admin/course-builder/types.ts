// Shared types for the course builder components
import { Quiz } from './QuizBuilder';

export type LessonType = 'video' | 'pdf';
export type ContentStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  status: ContentStatus;
  orderIndex: number;
  providerFileId?: string;
  videoUrl?: string;
  resourceUrl?: string;
  description?: string;
  learningOutcome?: string;
  thumbnail?: string;
}

export interface Module {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
  quiz?: Quiz;
}
