export type UserRole = 'participant' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarId?: string;
  studentId?: string;
  title?: string;
  bio?: string;
  streakDays?: number;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  photoId: string;
  rating: number;
  reviewCount: number;
  studentsCount: number;
  coursesCount: number;
  bio: string;
}

export type CourseCategory = 
  | 'Technology'
  | 'Business'
  | 'Design'
  | 'Development'
  | 'Marketing'
  | 'Personal Growth'
  | 'Data & AI';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'quiz' | 'lab';
  isPreview?: boolean;
  completed?: boolean;
  videoDurationSeconds?: number;
  description?: string;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: {
    id: string;
    title: string;
    questionsCount: number;
    duration: string;
  };
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: CourseCategory;
  level: CourseLevel;
  instructor: Instructor;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  lessonsCount: number;
  totalDuration: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  badge?: string;
  language: string;
  lastUpdated: string;
  description: string;
  learningOutcomes: string[];
  requirements: string[];
  sections: CurriculumSection[];
}

export interface EnrolledCourseProgress {
  courseId: string;
  courseSlug: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  remainingHours: string;
  currentLessonId: string;
  currentLessonTitle: string;
  lastAccessed: string;
  isCompleted: boolean;
  certificateId?: string;
}

export interface QuizQuestion {
  id: number;
  topic: string;
  points: number;
  question: string;
  codeSnippet?: {
    language: string;
    title: string;
    code: string;
  };
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

export interface QuizData {
  id: string;
  courseSlug: string;
  courseTitle: string;
  moduleTitle: string;
  title: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<number, string>;
  score: number;
  totalPoints: number;
  scorePercent: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
}

