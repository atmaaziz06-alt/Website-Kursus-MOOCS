import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Course, CourseCategory, CourseLevel, EnrolledCourseProgress } from '../types';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  price: number;
  status: 'Draft' | 'Pending review' | 'Published' | 'Archived';
  createdAt: string;
}

interface CourseContextType {
  enrolledCourses: EnrolledCourseProgress[];
  instructorCourses: InstructorCourse[];
  savedCourseSlugs: string[];
  isLoading: boolean;
  error: string | null;
  createInstructorCourse: (
    course: Omit<InstructorCourse, 'id' | 'createdAt' | 'status'>,
  ) => Promise<InstructorCourse>;
  enrollInCourse: (course: Course) => Promise<void>;
  markLessonCompleted: (courseSlug: string, lessonId: string) => Promise<void>;
  toggleSavedCourse: (courseSlug: string) => Promise<void>;
  getCourseProgress: (courseSlug: string) => EnrolledCourseProgress | undefined;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const categoryNames: CourseCategory[] = [
  'Technology', 'Business', 'Design', 'Development', 'Marketing', 'Personal Growth', 'Data & AI',
];
const courseLevels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const displayStatus: Record<string, InstructorCourse['status']> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  published: 'Published',
  archived: 'Archived',
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours} jam` : `${hours} jam ${remainingMinutes} menit`;
};

const formatLastAccessed = (value: string): string => {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (elapsedMinutes < 60) return `${elapsedMinutes} menit lalu`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
};

const loadStudentCourses = async (studentId: string): Promise<EnrolledCourseProgress[]> => {
  const client = requireSupabase();
  const { data: enrollments, error: enrollmentError } = await client
    .from('enrollments')
    .select('course_id, status, last_lesson_id, last_accessed_at')
    .eq('student_id', studentId)
    .neq('status', 'cancelled')
    .order('last_accessed_at', { ascending: false });
  if (enrollmentError) throw new Error(getErrorMessage(enrollmentError));
  if (!enrollments?.length) return [];

  const courseIds = enrollments.map((enrollment) => enrollment.course_id);
  const [coursesResult, progressResult, lessonsResult, completedResult] = await Promise.all([
    client.from('courses').select('id, slug, title, teacher_id, category_id, thumbnail_path').in('id', courseIds),
    client.from('v_enrollment_progress').select('course_id, total_lessons, completed_lessons, progress_percent')
      .eq('student_id', studentId).in('course_id', courseIds),
    client.from('lessons').select('id, course_id, title, duration_minutes, position')
      .in('course_id', courseIds).order('position'),
    client.from('lesson_progress').select('lesson_id').eq('student_id', studentId),
  ]);
  if (coursesResult.error) throw new Error(getErrorMessage(coursesResult.error));
  if (progressResult.error) throw new Error(getErrorMessage(progressResult.error));
  if (lessonsResult.error) throw new Error(getErrorMessage(lessonsResult.error));
  if (completedResult.error) throw new Error(getErrorMessage(completedResult.error));

  const categoryIds = [...new Set((coursesResult.data ?? [])
    .map((course) => course.category_id)
    .filter((id): id is string => id !== null))];
  const teacherIds = [...new Set((coursesResult.data ?? []).map((course) => course.teacher_id))];
  const [categoriesResult, instructorsResult] = await Promise.all([
    categoryIds.length
      ? client.from('categories').select('id, name').in('id', categoryIds)
      : Promise.resolve({ data: [], error: null }),
    teacherIds.length
      ? client.from('v_public_instructors').select('id, full_name, avatar_path').in('id', teacherIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (categoriesResult.error) throw new Error(getErrorMessage(categoriesResult.error));
  if (instructorsResult.error) throw new Error(getErrorMessage(instructorsResult.error));

  const coursesById = new Map((coursesResult.data ?? []).map((course) => [course.id, course]));
  const progressByCourse = new Map((progressResult.data ?? []).map((progress) => [progress.course_id, progress]));
  const completedLessons = new Set((completedResult.data ?? []).map((progress) => progress.lesson_id));
  const categoriesById = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
  const instructorsById = new Map((instructorsResult.data ?? []).map((instructor) => [instructor.id, instructor]));

  return enrollments.flatMap((enrollment) => {
    const course = coursesById.get(enrollment.course_id);
    if (!course) return [];
    const lessons = (lessonsResult.data ?? []).filter((lesson) => lesson.course_id === course.id);
    const progress = progressByCourse.get(course.id);
    const nextLesson = lessons.find((lesson) => !completedLessons.has(lesson.id));
    const currentLesson = nextLesson
      ?? lessons.find((lesson) => lesson.id === enrollment.last_lesson_id)
      ?? lessons[0];
    const instructor = instructorsById.get(course.teacher_id);
    const thumbnailUrl = course.thumbnail_path
      ? client.storage.from('course-thumbnails').getPublicUrl(course.thumbnail_path).data.publicUrl
      : undefined;
    const instructorAvatarUrl = instructor?.avatar_path
      ? client.storage.from('avatars').getPublicUrl(instructor.avatar_path).data.publicUrl
      : undefined;
    const remainingMinutes = lessons
      .filter((lesson) => !completedLessons.has(lesson.id))
      .reduce((total, lesson) => total + lesson.duration_minutes, 0);

    return [{
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      category: categoryNames.find((name) => name === categoriesById.get(course.category_id ?? '')) ?? 'Technology',
      instructorName: instructor?.full_name ?? 'Pengajar',
      instructorAvatarUrl,
      thumbnailUrl,
      progressPercent: Number(progress?.progress_percent ?? 0),
      completedLessons: progress?.completed_lessons ?? 0,
      totalLessons: progress?.total_lessons ?? lessons.length,
      remainingHours: formatDuration(remainingMinutes),
      currentLessonId: currentLesson?.id ?? '',
      currentLessonTitle: currentLesson?.title ?? 'Belum ada materi',
      lastAccessed: formatLastAccessed(enrollment.last_accessed_at),
      isCompleted: enrollment.status === 'completed',
    }];
  });
};

const loadInstructorCourses = async (teacherId: string): Promise<InstructorCourse[]> => {
  const client = requireSupabase();
  const { data: courses, error } = await client
    .from('courses')
    .select('id, title, description, category_id, level, price, status, created_at')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(getErrorMessage(error));
  if (!courses?.length) return [];

  const categoryIds = [...new Set(courses.map((course) => course.category_id).filter((id): id is string => id !== null))];
  const [categoriesResult, lessonsResult] = await Promise.all([
    categoryIds.length
      ? client.from('categories').select('id, name').in('id', categoryIds)
      : Promise.resolve({ data: [], error: null }),
    client.from('lessons').select('course_id, duration_minutes').in('course_id', courses.map((course) => course.id)),
  ]);
  if (categoriesResult.error) throw new Error(getErrorMessage(categoriesResult.error));
  if (lessonsResult.error) throw new Error(getErrorMessage(lessonsResult.error));

  const categoriesById = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
  const durationByCourse = new Map<string, number>();
  (lessonsResult.data ?? []).forEach((lesson) => {
    durationByCourse.set(lesson.course_id, (durationByCourse.get(lesson.course_id) ?? 0) + lesson.duration_minutes);
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: categoryNames.find((name) => name === categoriesById.get(course.category_id ?? '')) ?? 'Technology',
    level: courseLevels.find((level) => level === course.level) ?? 'Beginner',
    duration: formatDuration(durationByCourse.get(course.id) ?? 0),
    price: Number(course.price),
    status: displayStatus[course.status] ?? 'Draft',
    createdAt: course.created_at,
  }));
};

const loadSavedCourses = async (studentId: string): Promise<string[]> => {
  const client = requireSupabase();
  const { data: saved, error: savedError } = await client.from('saved_courses')
    .select('course_id').eq('student_id', studentId);
  if (savedError) throw new Error(getErrorMessage(savedError));
  if (!saved?.length) return [];
  const { data: courses, error: coursesError } = await client.from('courses')
    .select('slug').in('id', saved.map((item) => item.course_id));
  if (coursesError) throw new Error(getErrorMessage(coursesError));
  return (courses ?? []).map((course) => course.slug);
};

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseProgress[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
  const [savedCourseSlugs, setSavedCourseSlugs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadRequestId = useRef(0);
  const userId = user?.id;

  const refreshCourses = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    if (!isAuthenticated || !userId) {
      setEnrolledCourses([]);
      setInstructorCourses([]);
      setSavedCourseSlugs([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [studentData, instructorData, savedCourses] = await Promise.all([
        role === 'participant' ? loadStudentCourses(userId) : Promise.resolve([]),
        role === 'instructor' ? loadInstructorCourses(userId) : Promise.resolve([]),
        role === 'participant' ? loadSavedCourses(userId) : Promise.resolve([]),
      ]);
      if (requestId !== loadRequestId.current) return;
      setEnrolledCourses(studentData);
      setInstructorCourses(instructorData);
      setSavedCourseSlugs(savedCourses);
    } catch (loadError) {
      if (requestId === loadRequestId.current) setError(getErrorMessage(loadError));
      throw loadError;
    } finally {
      if (requestId === loadRequestId.current) setIsLoading(false);
    }
  }, [isAuthenticated, role, userId]);

  useEffect(() => {
    void refreshCourses().catch(() => undefined);
    return () => {
      loadRequestId.current += 1;
    };
  }, [refreshCourses]);

  const createInstructorCourse = async (
    course: Omit<InstructorCourse, 'id' | 'createdAt' | 'status'>,
  ): Promise<InstructorCourse> => {
    if (!user || role !== 'instructor') throw new Error('Hanya pengajar yang dapat membuat kursus.');
    const client = requireSupabase();
    const { data: category, error: categoryError } = await client
      .from('categories')
      .select('id')
      .eq('name', course.category)
      .maybeSingle();
    if (categoryError) throw new Error(getErrorMessage(categoryError));
    if (!category) throw new Error('Kategori kursus tidak ditemukan.');

    const slugBase = course.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const { data: created, error } = await client.from('courses').insert({
      teacher_id: user.id,
      category_id: category.id,
      title: course.title,
      slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`,
      description: course.description,
      level: course.level,
      price: course.price,
      original_price: course.price,
      status: 'draft',
    }).select('id, created_at').single();
    if (error) throw new Error(getErrorMessage(error));

    const createdCourse: InstructorCourse = { ...course, id: created.id, createdAt: created.created_at, status: 'Draft' };
    setInstructorCourses((current) => [createdCourse, ...current]);
    return createdCourse;
  };

  const enrollInCourse = async (course: Course) => {
    const { error: enrollmentError } = await requireSupabase().rpc('enroll_in_course', {
      p_course_id: course.id,
      p_method: 'simulasi',
    });
    if (enrollmentError) throw new Error(getErrorMessage(enrollmentError));
    await refreshCourses();
  };

  const markLessonCompleted = async (courseSlug: string, lessonId: string) => {
    const { data: course, error: courseError } = await requireSupabase()
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .maybeSingle();
    if (courseError) throw new Error(getErrorMessage(courseError));
    if (!course) throw new Error('Kursus tidak ditemukan.');
    const { data: lesson, error: lessonError } = await requireSupabase()
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .eq('course_id', course.id)
      .maybeSingle();
    if (lessonError) throw new Error(getErrorMessage(lessonError));
    if (!lesson) throw new Error('Materi ini bukan bagian dari kursus yang sedang dibuka.');

    const { error: progressError } = await requireSupabase().rpc('mark_lesson_complete', {
      p_lesson_id: lessonId,
    });
    if (progressError) throw new Error(getErrorMessage(progressError));
    await refreshCourses();
  };

  const toggleSavedCourse = async (courseSlug: string) => {
    if (!user || role !== 'participant') throw new Error('Masuk sebagai peserta untuk menyimpan kursus.');
    const client = requireSupabase();
    const { data: course, error: courseError } = await client.from('courses')
      .select('id').eq('slug', courseSlug).maybeSingle();
    if (courseError) throw new Error(getErrorMessage(courseError));
    if (!course) throw new Error('Kursus tidak ditemukan atau tidak tersedia.');
    const isSaved = savedCourseSlugs.includes(courseSlug);
    const result = isSaved
      ? await client.from('saved_courses').delete().eq('student_id', user.id).eq('course_id', course.id)
      : await client.from('saved_courses').insert({ student_id: user.id, course_id: course.id });
    if (result.error) throw new Error(getErrorMessage(result.error));
    setSavedCourseSlugs((current) => isSaved
      ? current.filter((slug) => slug !== courseSlug)
      : [...current, courseSlug]);
  };

  return (
    <CourseContext.Provider
      value={{
        enrolledCourses,
        instructorCourses,
        savedCourseSlugs,
        isLoading,
        error,
        createInstructorCourse,
        enrollInCourse,
        markLessonCompleted,
        toggleSavedCourse,
        getCourseProgress: (courseSlug) => enrolledCourses.find((course) => course.courseSlug === courseSlug),
        refreshCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
