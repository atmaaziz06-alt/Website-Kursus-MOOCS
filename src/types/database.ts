import type { UserRole } from './index';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json | undefined };

type Table<Row, Required extends keyof Row = never> = {
  Row: Row & Record<string, unknown>;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>> & Record<string, unknown>;
  Update: Partial<Row> & Record<string, unknown>;
  Relationships: [];
};

type CourseStatus = 'draft' | 'pending_review' | 'published' | 'archived';

interface ProfileRow {
  id: string;
  full_name: string;
  role: UserRole;
  instructor_requested: boolean;
  avatar_path: string | null;
  preferences: Json;
  is_active: boolean;
  created_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface CourseRow {
  id: string;
  teacher_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  level: string;
  language: string;
  learning_outcomes: string[];
  requirements: string[];
  thumbnail_path: string | null;
  banner_path: string | null;
  price: number;
  original_price: number;
  max_participants: number | null;
  status: CourseStatus;
  admin_locked: boolean;
  review_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
}

interface LessonRow {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  type: 'video' | 'pdf' | 'lab' | 'text';
  duration_minutes: number;
  is_preview: boolean;
  position: number;
  created_at: string;
}

interface LessonContentRow {
  lesson_id: string;
  content: string | null;
  video_url: string | null;
  file_path: string | null;
  updated_at: string;
}

interface EnrollmentRow {
  id: string;
  course_id: string;
  student_id: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
  completed_at: string | null;
  last_lesson_id: string | null;
  last_accessed_at: string;
}

interface LessonProgressRow {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

interface PaymentRow {
  id: string;
  enrollment_id: string;
  amount: number;
  method: string;
  status: 'pending' | 'confirmed' | 'rejected';
  paid_at: string | null;
}

interface QuizRow {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
  created_at: string;
}

interface QuestionRow {
  id: string;
  quiz_id: string;
  topic: string;
  text: string;
  code_snippet: Json | null;
  position: number;
  points: number;
}

interface QuestionOptionRow {
  id: string;
  question_id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface QuestionKeyRow {
  question_id: string;
  correct_option_id: string;
  explanation: string;
}

interface QuizAttemptRow {
  id: string;
  quiz_id: string;
  student_id: string;
  attempt_no: number;
  status: 'in_progress' | 'submitted';
  score: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;
}

interface AttemptAnswerRow {
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean | null;
  flagged: boolean;
  updated_at: string;
}

interface SavedCourseRow {
  student_id: string;
  course_id: string;
  created_at: string;
}

interface LessonNoteRow {
  student_id: string;
  lesson_id: string;
  note: string;
  is_bookmarked: boolean;
  sandbox_code: string;
  updated_at: string;
}

interface LessonQuestionRow {
  id: string;
  student_id: string;
  lesson_id: string;
  question: string;
  created_at: string;
}

interface NotificationRow {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  sent_at: string;
}

interface CourseReviewRow {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'id' | 'full_name'>;
      categories: Table<CategoryRow, 'name' | 'slug'>;
      courses: Table<CourseRow, 'teacher_id' | 'title' | 'slug'>;
      modules: Table<ModuleRow, 'course_id' | 'title' | 'position'>;
      lessons: Table<LessonRow, 'module_id' | 'course_id' | 'title' | 'type' | 'position'>;
      lesson_contents: Table<LessonContentRow, 'lesson_id'>;
      enrollments: Table<EnrollmentRow, 'course_id' | 'student_id'>;
      lesson_progress: Table<LessonProgressRow, 'student_id' | 'lesson_id' | 'course_id'>;
      payments: Table<PaymentRow, 'enrollment_id' | 'amount'>;
      quizzes: Table<QuizRow, 'course_id' | 'title'>;
      questions: Table<QuestionRow, 'quiz_id' | 'text' | 'position'>;
      question_options: Table<QuestionOptionRow, 'question_id' | 'label' | 'text'>;
      question_keys: Table<QuestionKeyRow, 'question_id' | 'correct_option_id'>;
      quiz_attempts: Table<QuizAttemptRow, 'quiz_id' | 'student_id' | 'attempt_no'>;
      attempt_answers: Table<AttemptAnswerRow, 'attempt_id' | 'question_id'>;
      saved_courses: Table<SavedCourseRow, 'student_id' | 'course_id'>;
      lesson_notes: Table<LessonNoteRow, 'student_id' | 'lesson_id'>;
      lesson_questions: Table<LessonQuestionRow, 'student_id' | 'lesson_id' | 'question'>;
      notifications: Table<NotificationRow, 'user_id' | 'title'>;
      messages: Table<MessageRow, 'sender_id' | 'recipient_id' | 'body'>;
      course_reviews: Table<CourseReviewRow, 'course_id' | 'student_id' | 'rating'>;
    };
    Views: {
      v_public_instructors: {
        Row: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_path'>;
        Relationships: [];
      };
      v_enrollment_progress: {
        Row: {
          enrollment_id: string;
          student_id: string;
          course_id: string;
          status: EnrollmentRow['status'];
          total_lessons: number;
          completed_lessons: number;
          progress_percent: number;
        };
        Relationships: [];
      };
      v_public_course_stats: {
        Row: {
          course_id: string;
          enrolled_count: number;
          average_rating: number | null;
          review_count: number;
        };
        Relationships: [];
      };
      v_public_courses: {
        Row: Pick<
          CourseRow,
          | 'id' | 'teacher_id' | 'category_id' | 'title' | 'slug' | 'subtitle' | 'description'
          | 'level' | 'language' | 'learning_outcomes' | 'requirements' | 'thumbnail_path'
          | 'banner_path' | 'price' | 'original_price' | 'max_participants' | 'published_at' | 'created_at'
        > & {
          category_name: string | null;
          instructor_name: string;
          instructor_avatar_path: string | null;
          enrolled_count: number;
          average_rating: number;
          review_count: number;
          lessons_count: number;
          total_duration_minutes: number;
          instructor_courses_count: number;
          instructor_students_count: number;
        };
        Relationships: [];
      };
      v_teacher_courses: {
        Row: Pick<CourseRow, 'id' | 'teacher_id' | 'title' | 'slug' | 'status' | 'price' | 'created_at'> & {
          enrolled_count: number;
          submitted_attempts: number;
        };
        Relationships: [];
      };
      v_teacher_course_stats: {
        Row: {
          course_id: string;
          teacher_id: string;
          student_count: number;
          quiz_submission_count: number;
          average_quiz_score: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      owns_course: { Args: { p_course_id: string }; Returns: boolean };
      is_enrolled: { Args: { p_course_id: string; p_student_id?: string }; Returns: boolean };
      can_view_student: { Args: { p_student_id: string }; Returns: boolean };
      is_public_instructor: { Args: { p_user_id: string }; Returns: boolean };
      enroll_in_course: { Args: { p_course_id: string; p_method?: string }; Returns: EnrollmentRow };
      mark_lesson_complete: { Args: { p_lesson_id: string }; Returns: LessonProgressRow };
      start_quiz_attempt: { Args: { p_quiz_id: string }; Returns: QuizAttemptRow };
      save_quiz_answer: {
        Args: {
          p_attempt_id: string;
          p_question_id: string;
          p_option_id?: string | null;
          p_flagged?: boolean;
        };
        Returns: undefined;
      };
      submit_quiz_attempt: {
        Args: { p_attempt_id: string; p_answers?: Json };
        Returns: QuizAttemptRow;
      };
      get_attempt_review: {
        Args: { p_attempt_id: string };
        Returns: {
          question_id: string;
          selected_option_id: string | null;
          correct_option_id: string;
          is_correct: boolean | null;
          explanation: string;
        }[];
      };
      submit_course_for_review: { Args: { p_course_id: string }; Returns: CourseRow };
      review_course: {
        Args: { p_course_id: string; p_approve: boolean; p_note?: string | null };
        Returns: CourseRow;
      };
      admin_set_user: {
        Args: { p_user_id: string; p_role: UserRole; p_is_active: boolean };
        Returns: ProfileRow;
      };
      admin_dashboard_summary: { Args: Record<PropertyKey, never>; Returns: Json };
      create_quiz_question: {
        Args: {
          p_quiz_id: string;
          p_topic: string;
          p_text: string;
          p_options: Json;
          p_correct_label: string;
          p_explanation: string;
          p_points?: number;
          p_code_snippet?: Json | null;
        };
        Returns: string;
      };
      update_quiz_question: {
        Args: {
          p_question_id: string;
          p_topic: string;
          p_text: string;
          p_options: Json;
          p_correct_label: string;
          p_explanation: string;
          p_points?: number;
          p_code_snippet?: Json | null;
        };
        Returns: undefined;
      };
      delete_quiz_question: {
        Args: { p_question_id: string };
        Returns: undefined;
      };
      admin_list_users: {
        Args: {
          p_search?: string;
          p_role?: UserRole | null;
          p_active?: boolean | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Array<{
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          instructor_requested: boolean;
          is_active: boolean;
          created_at: string;
          total_count: number;
        }>;
      };
    };
    Enums: {
      user_role: UserRole;
      course_status: CourseStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
