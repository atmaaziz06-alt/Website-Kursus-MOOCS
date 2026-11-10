import React, { createContext, useContext, useState } from 'react';
import { Course, CourseCategory, CourseLevel, EnrolledCourseProgress } from '../types';

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  price: number;
  status: 'Draft' | 'Published';
  createdAt: string;
}

interface CourseContextType {
  enrolledCourses: EnrolledCourseProgress[];
  instructorCourses: InstructorCourse[];
  createInstructorCourse: (course: Omit<InstructorCourse, 'id' | 'createdAt'>) => InstructorCourse;
  enrollInCourse: (course: Course) => void;
  isDevEmptyState: boolean;
  toggleDevEmptyState: () => void;
  markLessonCompleted: (courseSlug: string, lessonId: string) => void;
  getCourseProgress: (courseSlug: string) => EnrolledCourseProgress | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const isInstructorCourse = (value: unknown): value is InstructorCourse => {
  if (typeof value !== 'object' || value === null) return false;
  const course = value as Record<string, unknown>;
  return (
    typeof course.id === 'string' &&
    typeof course.title === 'string' &&
    typeof course.description === 'string' &&
    ['Technology', 'Business', 'Design', 'Development', 'Marketing', 'Personal Growth', 'Data & AI'].includes(String(course.category)) &&
    ['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(String(course.level)) &&
    typeof course.duration === 'string' &&
    typeof course.price === 'number' &&
    (course.status === 'Draft' || course.status === 'Published') &&
    typeof course.createdAt === 'string'
  );
};

const loadInstructorCourses = (): InstructorCourse[] => {
  const saved = localStorage.getItem('eduspace_instructor_courses');
  if (!saved) return [];

  try {
    const courses: unknown = JSON.parse(saved);
    if (!Array.isArray(courses)) {
      throw new Error('Saved instructor courses must be an array.');
    }
    const validCourses = courses.filter(isInstructorCourse);
    const hasLegacyPrices = validCourses.some((course) => course.price > 0 && course.price < 1000);
    const migratedCourses = validCourses.map((course) => {
      if (course.price > 0 && course.price < 1000) {
        return { ...course, price: course.price * 10000 };
      }
      return course;
    });
    if (validCourses.length !== courses.length) {
      console.error('Some saved instructor courses are invalid and were ignored.');
    }
    if (hasLegacyPrices) {
      localStorage.setItem('eduspace_instructor_courses', JSON.stringify(migratedCourses));
    }
    return migratedCourses;
  } catch (error) {
    console.error('Unable to load saved instructor courses.', error);
    return [];
  }
};

const initialEnrolledCourses: EnrolledCourseProgress[] = [
  {
    courseId: 'course-web-dev-2025',
    courseSlug: 'web-development-bootcamp-2025',
    progressPercent: 65,
    completedLessons: 24,
    totalLessons: 38,
    remainingHours: '4,5 jam',
    currentLessonId: 'les-15',
    currentLessonTitle: '15. Mendalami useState, useEffect & Custom Hooks',
    lastAccessed: '2 jam lalu',
    isCompleted: false,
  },
  {
    courseId: 'course-ui-ux-design',
    courseSlug: 'ui-ux-design-fundamentals',
    progressPercent: 42,
    completedLessons: 14,
    totalLessons: 34,
    remainingHours: '7 jam',
    currentLessonId: 'les-ux-14',
    currentLessonTitle: 'Modul 3: Token Desain & Microinteraksi',
    lastAccessed: 'Kemarin',
    isCompleted: false,
  },
  {
    courseId: 'course-digital-marketing',
    courseSlug: 'digital-marketing-masterclass',
    progressPercent: 28,
    completedLessons: 8,
    totalLessons: 28,
    remainingHours: '9,2 jam',
    currentLessonId: 'les-mkt-8',
    currentLessonTitle: 'Modul 2: Corong Akuisisi Pelanggan',
    lastAccessed: '3 hari lalu',
    isCompleted: false,
  },
  {
    courseId: 'course-python-scratch',
    courseSlug: 'python-programming-scratch',
    progressPercent: 100,
    completedLessons: 32,
    totalLessons: 32,
    remainingHours: '0 jam',
    currentLessonId: 'les-py-32',
    currentLessonTitle: 'Proyek Akhir: Alat CLI Siap Produksi',
    lastAccessed: '2 minggu lalu',
    isCompleted: true,
    certificateId: 'CERT-PY-84920',
  },
  {
    courseId: 'course-ml-ai',
    courseSlug: 'machine-learning-ai',
    progressPercent: 100,
    completedLessons: 42,
    totalLessons: 42,
    remainingHours: '0 jam',
    currentLessonId: 'les-ml-42',
    currentLessonTitle: 'Arsitektur Transformer',
    lastAccessed: '1 bulan lalu',
    isCompleted: true,
    certificateId: 'CERT-ML-84920',
  },
  {
    courseId: 'course-cloud-devops',
    courseSlug: 'cloud-architecture-devops',
    progressPercent: 100,
    completedLessons: 36,
    totalLessons: 36,
    remainingHours: '0 jam',
    currentLessonId: 'les-cloud-36',
    currentLessonTitle: 'Kubernetes Multi-Region',
    lastAccessed: '2 bulan lalu',
    isCompleted: true,
    certificateId: 'CERT-CLOUD-84920',
  },
];

const loadEnrolledCourses = (): EnrolledCourseProgress[] => {
  const saved = localStorage.getItem('eduspace_enrolled_courses');
  if (!saved) return initialEnrolledCourses;

  try {
    const courses: unknown = JSON.parse(saved);
    if (!Array.isArray(courses)) {
      throw new Error('Saved enrolled courses must be an array.');
    }

    const savedCourses = courses as EnrolledCourseProgress[];
    const savedSlugs = new Set(savedCourses.map((course) => course.courseSlug));
    return [...savedCourses, ...initialEnrolledCourses.filter((course) => !savedSlugs.has(course.courseSlug))];
  } catch (error) {
    console.error('Unable to load saved enrolled courses.', error);
    return initialEnrolledCourses;
  }
};

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseProgress[]>(loadEnrolledCourses);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>(loadInstructorCourses);
  const [isDevEmptyState, setIsDevEmptyState] = useState(false);

  const createInstructorCourse = (course: Omit<InstructorCourse, 'id' | 'createdAt'>) => {
    const newCourse: InstructorCourse = {
      ...course,
      id: `course-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    const updatedCourses = [newCourse, ...instructorCourses];
    localStorage.setItem('eduspace_instructor_courses', JSON.stringify(updatedCourses));
    setInstructorCourses(updatedCourses);
    return newCourse;
  };

  const enrollInCourse = (course: Course) => {
    setEnrolledCourses((current) => {
      if (current.some((enrollment) => enrollment.courseSlug === course.slug)) {
        return current;
      }

      const firstLesson = course.sections.flatMap((section) => section.lessons)[0];
      const enrollment: EnrolledCourseProgress = {
        courseId: course.id,
        courseSlug: course.slug,
        progressPercent: 0,
        completedLessons: 0,
        totalLessons: course.lessonsCount,
        remainingHours: course.totalDuration,
        currentLessonId: firstLesson?.id || 'les-1',
        currentLessonTitle: firstLesson?.title || 'Start your first lesson',
        lastAccessed: 'Just now',
        isCompleted: false,
      };
      const updated = [enrollment, ...current];
      localStorage.setItem('eduspace_enrolled_courses', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleDevEmptyState = () => {
    setIsDevEmptyState((prev) => !prev);
  };

  const markLessonCompleted = (courseSlug: string, lessonId: string) => {
    setEnrolledCourses((prev) =>
      prev.map((c) => {
        if (c.courseSlug === courseSlug) {
          const nextCompleted = Math.min(c.totalLessons, c.completedLessons + 1);
          const nextPercent = Math.round((nextCompleted / c.totalLessons) * 100);
          return {
            ...c,
            completedLessons: nextCompleted,
            progressPercent: nextPercent,
            isCompleted: nextPercent === 100,
          };
        }
        return c;
      })
    );
  };

  const getCourseProgress = (courseSlug: string) => {
    return enrolledCourses.find((c) => c.courseSlug === courseSlug);
  };

  return (
    <CourseContext.Provider
      value={{
        enrolledCourses,
        instructorCourses,
        createInstructorCourse,
        enrollInCourse,
        isDevEmptyState,
        toggleDevEmptyState,
        markLessonCompleted,
        getCourseProgress,
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
