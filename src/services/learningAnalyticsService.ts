import { getErrorMessage } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';

export interface StudentQuizHistoryItem {
  attemptId: string;
  quizId: string;
  title: string;
  courseTitle: string;
  moduleTitle: string;
  score: number;
  passed: boolean;
  submittedAt: string;
  timeTakenSeconds: number;
}

export interface InstructorStudentRow {
  id: string;
  courseId: string;
  name: string;
  avatarPath: string | null;
  courseTitle: string;
  progress: number;
  score: number | null;
  status: 'Active' | 'Completed';
}

export interface InstructorQuizSubmission {
  studentId: string;
  studentName: string;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface InstructorQuizAnalytics {
  id: string;
  title: string;
  courseTitle: string;
  passingScore: number;
  submissions: InstructorQuizSubmission[];
  averageScore: number;
  passRate: number;
}

export const getStudentQuizHistory = async (studentId: string): Promise<StudentQuizHistoryItem[]> => {
  const client = requireSupabase();
  const { data: attempts, error: attemptsError } = await client.from('quiz_attempts')
    .select('id, quiz_id, score, passed, submitted_at, time_taken_seconds')
    .eq('student_id', studentId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false });
  if (attemptsError) throw new Error(getErrorMessage(attemptsError));
  if (!attempts?.length) return [];

  const quizIds = [...new Set(attempts.map((attempt) => attempt.quiz_id))];
  const { data: quizzes, error: quizzesError } = await client.from('quizzes')
    .select('id, title, course_id, module_id, passing_score')
    .in('id', quizIds);
  if (quizzesError) throw new Error(getErrorMessage(quizzesError));

  const courseIds = [...new Set((quizzes ?? []).map((quiz) => quiz.course_id))];
  const moduleIds = [...new Set((quizzes ?? []).flatMap((quiz) => quiz.module_id ? [quiz.module_id] : []))];
  const [coursesResult, modulesResult] = await Promise.all([
    courseIds.length
      ? client.from('courses').select('id, title').in('id', courseIds)
      : Promise.resolve({ data: [], error: null }),
    moduleIds.length
      ? client.from('modules').select('id, title').in('id', moduleIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (coursesResult.error) throw new Error(getErrorMessage(coursesResult.error));
  if (modulesResult.error) throw new Error(getErrorMessage(modulesResult.error));

  return attempts.flatMap((attempt) => {
    const quiz = quizzes?.find((item) => item.id === attempt.quiz_id);
    if (!quiz || !attempt.submitted_at || attempt.score === null || attempt.passed === null) return [];
    return [{
      attemptId: attempt.id,
      quizId: quiz.id,
      title: quiz.title,
      courseTitle: coursesResult.data?.find((item) => item.id === quiz.course_id)?.title ?? 'Kursus',
      moduleTitle: modulesResult.data?.find((item) => item.id === quiz.module_id)?.title ?? 'Kuis',
      score: Number(attempt.score),
      passed: attempt.passed,
      submittedAt: attempt.submitted_at,
      timeTakenSeconds: attempt.time_taken_seconds ?? 0,
    }];
  });
};

export const getInstructorStudents = async (instructorId: string): Promise<InstructorStudentRow[]> => {
  const client = requireSupabase();
  const { data: courses, error: coursesError } = await client.from('courses')
    .select('id, title').eq('teacher_id', instructorId);
  if (coursesError) throw new Error(getErrorMessage(coursesError));
  if (!courses?.length) return [];

  const courseIds = courses.map((course) => course.id);
  const [enrollmentsResult, progressResult, quizzesResult] = await Promise.all([
    client.from('enrollments').select('id, student_id, course_id, status')
      .in('course_id', courseIds).in('status', ['active', 'completed']),
    client.from('v_enrollment_progress')
      .select('student_id, course_id, status, total_lessons, completed_lessons, progress_percent')
      .in('course_id', courseIds),
    client.from('quizzes').select('id, course_id').in('course_id', courseIds),
  ]);
  if (enrollmentsResult.error) throw new Error(getErrorMessage(enrollmentsResult.error));
  if (progressResult.error) throw new Error(getErrorMessage(progressResult.error));
  if (quizzesResult.error) throw new Error(getErrorMessage(quizzesResult.error));

  const studentIds = [...new Set((enrollmentsResult.data ?? []).map((item) => item.student_id))];
  const quizIds = (quizzesResult.data ?? []).map((quiz) => quiz.id);
  const [profilesResult, attemptsResult] = await Promise.all([
    studentIds.length
      ? client.from('profiles').select('id, full_name, avatar_path').in('id', studentIds)
      : Promise.resolve({ data: [], error: null }),
    quizIds.length
      ? client.from('quiz_attempts').select('quiz_id, student_id, score')
        .in('quiz_id', quizIds).eq('status', 'submitted')
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (profilesResult.error) throw new Error(getErrorMessage(profilesResult.error));
  if (attemptsResult.error) throw new Error(getErrorMessage(attemptsResult.error));

  return (enrollmentsResult.data ?? []).flatMap((enrollment) => {
    const profile = profilesResult.data?.find((item) => item.id === enrollment.student_id);
    if (!profile) return [];
    const scores = (attemptsResult.data ?? []).filter((attempt) =>
      attempt.student_id === enrollment.student_id &&
      quizzesResult.data?.some((quiz) => quiz.id === attempt.quiz_id && quiz.course_id === enrollment.course_id) &&
      attempt.score !== null,
    );
    const progress = progressResult.data?.find((item) =>
      item.student_id === enrollment.student_id && item.course_id === enrollment.course_id,
    );
    return [{
      id: profile.id,
      courseId: enrollment.course_id,
      name: profile.full_name,
      avatarPath: profile.avatar_path,
      courseTitle: courses.find((course) => course.id === enrollment.course_id)?.title ?? 'Kursus',
      progress: Number(progress?.progress_percent ?? 0),
      score: scores.length
        ? scores.reduce((total, attempt) => total + Number(attempt.score), 0) / scores.length
        : null,
      status: enrollment.status === 'completed' ? 'Completed' : 'Active',
    }];
  });
};

export const getInstructorQuizAnalytics = async (instructorId: string): Promise<InstructorQuizAnalytics[]> => {
  const client = requireSupabase();
  const { data: courses, error: coursesError } = await client.from('courses')
    .select('id, title').eq('teacher_id', instructorId);
  if (coursesError) throw new Error(getErrorMessage(coursesError));
  if (!courses?.length) return [];

  const courseIds = courses.map((course) => course.id);
  const { data: quizzes, error: quizzesError } = await client.from('quizzes')
    .select('id, course_id, title, passing_score').in('course_id', courseIds).order('created_at', { ascending: false });
  if (quizzesError) throw new Error(getErrorMessage(quizzesError));
  if (!quizzes?.length) return [];

  const { data: attempts, error: attemptsError } = await client.from('quiz_attempts')
    .select('quiz_id, student_id, score, passed, submitted_at')
    .in('quiz_id', quizzes.map((quiz) => quiz.id))
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false });
  if (attemptsError) throw new Error(getErrorMessage(attemptsError));

  const studentIds = [...new Set((attempts ?? []).map((attempt) => attempt.student_id))];
  const { data: profiles, error: profilesError } = studentIds.length
    ? await client.from('profiles').select('id, full_name').in('id', studentIds)
    : { data: [], error: null };
  if (profilesError) throw new Error(getErrorMessage(profilesError));

  return quizzes.map((quiz) => {
    const submissions = (attempts ?? []).flatMap((attempt) => {
      if (attempt.quiz_id !== quiz.id || attempt.score === null || attempt.passed === null || !attempt.submitted_at) return [];
      const profile = profiles?.find((item) => item.id === attempt.student_id);
      if (!profile) return [];
      return [{
        studentId: profile.id,
        studentName: profile.full_name,
        score: Number(attempt.score),
        passed: attempt.passed,
        submittedAt: attempt.submitted_at,
      }];
    });
    const averageScore = submissions.length
      ? submissions.reduce((total, submission) => total + submission.score, 0) / submissions.length
      : 0;
    return {
      id: quiz.id,
      title: quiz.title,
      courseTitle: courses.find((course) => course.id === quiz.course_id)?.title ?? 'Kursus',
      passingScore: Number(quiz.passing_score),
      submissions,
      averageScore,
      passRate: submissions.length
        ? (submissions.filter((submission) => submission.passed).length / submissions.length) * 100
        : 0,
    };
  });
};
