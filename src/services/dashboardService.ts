import { getErrorMessage } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';
import { calculateAverageScore, calculateRetentionRate, getCurrentStreak } from './dashboardMetrics';

export interface StudentStudyCategory {
  name: string;
  hours: number;
  color: string;
}

export interface StudentDashboardAnalytics {
  averageQuizScore: number | null;
  totalStudyHours: number;
  weeklyStudyHours: number;
  streakDays: number;
  studyByCategory: StudentStudyCategory[];
}

export interface AdminGrowthPoint {
  month: string;
  participants: number;
  instructors: number;
  activeParticipants: number;
  retentionMonth1Percent: number | null;
  retentionMonth2Percent: number | null;
}

export interface InstructorEnrollmentPoint {
  date: string;
  courseId: string;
}

export interface InstructorDashboardAnalytics {
  totalEnrollments: number;
  quizSubmissionCount: number;
  averageQuizScore: number | null;
  enrollmentHistory: InstructorEnrollmentPoint[];
}

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(getErrorMessage(error));
};

const readAllPages = async <T>(
  request: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> => {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await request(offset, offset + 999);
    throwIfError(result.error);
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
};

export const getStudentDashboardAnalytics = async (
  studentId: string,
): Promise<StudentDashboardAnalytics> => {
  const client = requireSupabase();
  const weekStart = new Date();
  weekStart.setUTCHours(0, 0, 0, 0);
  const mondayOffset = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);

  const [progress, attempts] = await Promise.all([
    readAllPages((from, to) => client.from('lesson_progress')
      .select('lesson_id, course_id, completed_at')
      .eq('student_id', studentId)
      .range(from, to)),
    readAllPages((from, to) => client.from('quiz_attempts')
      .select('score')
      .eq('student_id', studentId)
      .eq('status', 'submitted')
      .range(from, to)),
  ]);

  const quizScores = attempts
    .map((attempt) => attempt.score)
    .filter((score): score is number => score !== null)
    .map(Number);
  const lessonIds = [...new Set(progress.map((item) => item.lesson_id))];
  const progressCourseIds = [...new Set(progress.map((item) => item.course_id))];
  const [lessonsResult, coursesResult] = await Promise.all([
    lessonIds.length
      ? client.from('lessons').select('id, course_id, duration_minutes').in('id', lessonIds)
      : Promise.resolve({ data: [], error: null }),
    progressCourseIds.length
      ? client.from('courses').select('id, category_id').in('id', progressCourseIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  throwIfError(lessonsResult.error);
  throwIfError(coursesResult.error);

  const categoryIds = [...new Set((coursesResult.data ?? [])
    .map((course) => course.category_id)
    .filter((id): id is string => id !== null))];
  const categoriesResult = categoryIds.length
    ? await client.from('categories').select('id, name').in('id', categoryIds)
    : { data: [], error: null };
  throwIfError(categoriesResult.error);

  const coursesById = new Map((coursesResult.data ?? []).map((course) => [course.id, course]));
  const categoriesById = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
  const completedAtByLesson = new Map(progress.map((item) => [item.lesson_id, item.completed_at]));
  const categoryMinutes = new Map<string, number>();
  let totalMinutes = 0;
  let weeklyMinutes = 0;

  for (const lesson of lessonsResult.data ?? []) {
    const completedAt = completedAtByLesson.get(lesson.id);
    if (!completedAt) continue;
    const minutes = Number(lesson.duration_minutes);
    totalMinutes += minutes;
    if (new Date(completedAt) < weekStart) continue;
    weeklyMinutes += minutes;
    const categoryId = coursesById.get(lesson.course_id)?.category_id;
    const categoryName = categoryId ? categoriesById.get(categoryId) : undefined;
    const label = categoryName ?? 'Tanpa kategori';
    categoryMinutes.set(label, (categoryMinutes.get(label) ?? 0) + minutes);
  }

  const colors = ['#2F4BDB', '#E08A00', '#16A34A', '#0B1F8F', '#A855F7'];
  const studyByCategory = [...categoryMinutes.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([name, minutes], index) => ({
      name,
      hours: Math.round((minutes / 60) * 10) / 10,
      color: colors[index % colors.length],
    }));

  return {
    averageQuizScore: calculateAverageScore(quizScores),
    totalStudyHours: Math.round((totalMinutes / 60) * 10) / 10,
    weeklyStudyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
    streakDays: getCurrentStreak(progress.map((item) => item.completed_at)),
    studyByCategory,
  };
};

const getMonthKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const shiftMonthKey = (key: string, offset: number) => {
  const [year, month] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return getMonthKey(shifted);
};

export const getAdminGrowthHistory = async (): Promise<AdminGrowthPoint[]> => {
  const client = requireSupabase();
  const firstMonth = new Date();
  firstMonth.setUTCDate(1);
  firstMonth.setUTCHours(0, 0, 0, 0);
  firstMonth.setUTCMonth(firstMonth.getUTCMonth() - 11);
  const start = firstMonth.toISOString();

  const [profiles, progress, attempts] = await Promise.all([
    readAllPages((from, to) => client.from('profiles')
      .select('id, role, created_at').gte('created_at', start).range(from, to)),
    readAllPages((from, to) => client.from('lesson_progress')
      .select('student_id, completed_at').gte('completed_at', start).range(from, to)),
    readAllPages((from, to) => client.from('quiz_attempts')
      .select('student_id, submitted_at').eq('status', 'submitted')
      .gte('submitted_at', start).range(from, to)),
  ]);

  const points = new Map<string, AdminGrowthPoint>();
  const activeByMonth = new Map<string, Set<string>>();
  for (let index = 0; index < 12; index += 1) {
    const month = new Date(firstMonth);
    month.setUTCMonth(firstMonth.getUTCMonth() + index);
    const key = getMonthKey(month);
    points.set(key, {
      month: month.toLocaleDateString('id-ID', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
      participants: 0,
      instructors: 0,
      activeParticipants: 0,
      retentionMonth1Percent: null,
      retentionMonth2Percent: null,
    });
  }

  const cohortMembers = new Map<string, string[]>();
  for (const profile of profiles) {
    const point = points.get(getMonthKey(new Date(profile.created_at)));
    if (!point) continue;
    if (profile.role === 'participant') {
      point.participants += 1;
      const cohort = cohortMembers.get(getMonthKey(new Date(profile.created_at))) ?? [];
      cohort.push(profile.id);
      cohortMembers.set(getMonthKey(new Date(profile.created_at)), cohort);
    }
    if (profile.role === 'instructor') point.instructors += 1;
  }

  for (const activity of progress) {
    const month = getMonthKey(new Date(activity.completed_at));
    const active = activeByMonth.get(month) ?? new Set<string>();
    active.add(activity.student_id);
    activeByMonth.set(month, active);
  }
  for (const attempt of attempts) {
    if (!attempt.submitted_at) continue;
    const month = getMonthKey(new Date(attempt.submitted_at));
    const active = activeByMonth.get(month) ?? new Set<string>();
    active.add(attempt.student_id);
    activeByMonth.set(month, active);
  }
  for (const [month, users] of activeByMonth) {
    const point = points.get(month);
    if (point) point.activeParticipants = users.size;
  }
  const currentMonthKey = getMonthKey(new Date());
  for (const month of points.keys()) {
    const point = points.get(month);
    const members = cohortMembers.get(month) ?? [];
    if (!point || !members.length) continue;
    const nextMonth = shiftMonthKey(month, 1);
    const secondMonth = shiftMonthKey(month, 2);
    if (nextMonth < currentMonthKey) {
      point.retentionMonth1Percent = calculateRetentionRate(members, activeByMonth.get(nextMonth) ?? new Set<string>());
    }
    if (secondMonth < currentMonthKey) {
      point.retentionMonth2Percent = calculateRetentionRate(members, activeByMonth.get(secondMonth) ?? new Set<string>());
    }
  }
  return [...points.values()];
};

export const getInstructorDashboardAnalytics = async (
  teacherId: string,
  courseIds: string[],
): Promise<InstructorDashboardAnalytics> => {
  const client = requireSupabase();
  if (!courseIds.length) {
    return { totalEnrollments: 0, quizSubmissionCount: 0, averageQuizScore: null, enrollmentHistory: [] };
  }

  const firstDate = new Date();
  firstDate.setUTCDate(1);
  firstDate.setUTCHours(0, 0, 0, 0);
  firstDate.setUTCMonth(firstDate.getUTCMonth() - 11);
  const [courseStatsResult, enrollmentHistory] = await Promise.all([
    client.from('v_teacher_course_stats')
      .select('course_id, teacher_id, student_count, quiz_submission_count, average_quiz_score')
      .eq('teacher_id', teacherId),
    readAllPages((from, to) => client.from('enrollments')
      .select('course_id, enrolled_at')
      .in('course_id', courseIds)
      .neq('status', 'cancelled')
      .gte('enrolled_at', firstDate.toISOString())
      .range(from, to)),
  ]);
  throwIfError(courseStatsResult.error);

  const stats = courseStatsResult.data ?? [];
  const quizSubmissionCount = stats.reduce((total, course) => total + course.quiz_submission_count, 0);
  const weightedScore = stats.reduce((total, course) => (
    total + (Number(course.average_quiz_score ?? 0) * course.quiz_submission_count)
  ), 0);
  return {
    totalEnrollments: stats.reduce((total, course) => total + course.student_count, 0),
    quizSubmissionCount,
    averageQuizScore: quizSubmissionCount ? calculateAverageScore([weightedScore / quizSubmissionCount]) : null,
    enrollmentHistory: enrollmentHistory.map((enrollment) => ({
      date: enrollment.enrolled_at,
      courseId: enrollment.course_id,
    })),
  };
};
