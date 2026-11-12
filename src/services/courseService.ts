import { Course, CourseCategory, CourseLevel, CurriculumSection, Lesson } from '../types';
import type { Database } from '../types/database';
import { getErrorMessage } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';

export interface CourseFilterOptions {
  category?: string;
  level?: string;
  price?: 'all' | 'paid' | 'free';
  minRating?: number;
  search?: string;
  sortBy?: 'newest' | 'highest-rated' | 'most-popular' | 'price-low' | 'price-high';
  page?: number;
  pageSize?: number;
}

export interface CoursePage {
  courses: Course[];
  total: number;
}

type PublicCourseRow = Database['public']['Views']['v_public_courses']['Row'];

const categories: CourseCategory[] = [
  'Technology',
  'Business',
  'Design',
  'Development',
  'Marketing',
  'Personal Growth',
  'Data & AI',
];

const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const toCategory = (value: string | null): CourseCategory =>
  categories.find((category) => category === value) ?? 'Technology';

const toLevel = (value: string): CourseLevel =>
  levels.find((level) => level === value) ?? 'Beginner';

const toDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} menit`;
  return remainingMinutes === 0 ? `${hours} jam` : `${hours} jam ${remainingMinutes} menit`;
};

const getAssetUrl = (bucket: 'course-thumbnails' | 'avatars', path: string | null): string | undefined => {
  if (!path) return undefined;
  return requireSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const mapCourse = (row: PublicCourseRow, sections: CurriculumSection[] = []): Course => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  subtitle: row.subtitle,
  category: toCategory(row.category_name),
  level: toLevel(row.level),
  instructor: {
    id: row.teacher_id,
    name: row.instructor_name,
    title: 'Pengajar',
    photoId: getAssetUrl('avatars', row.instructor_avatar_path) ?? row.teacher_id,
    rating: row.average_rating,
    reviewCount: row.review_count,
    studentsCount: row.instructor_students_count,
    coursesCount: row.instructor_courses_count,
    bio: '',
  },
  price: Number(row.price),
  originalPrice: Number(row.original_price),
  rating: Number(row.average_rating),
  reviewCount: row.review_count,
  enrolledCount: row.enrolled_count,
  maxParticipants: row.max_participants,
  lessonsCount: row.lessons_count,
  totalDuration: toDuration(row.total_duration_minutes),
  isPopular: row.enrolled_count > 0,
  language: row.language,
  lastUpdated: row.published_at ?? row.created_at,
  description: row.description,
  learningOutcomes: row.learning_outcomes,
  requirements: row.requirements,
  sections,
  thumbnailUrl: getAssetUrl('course-thumbnails', row.thumbnail_path),
  bannerUrl: getAssetUrl('course-thumbnails', row.banner_path),
});

const getPublicCourseQuery = () => requireSupabase().from('v_public_courses');

export const getCoursesPage = async (options: CourseFilterOptions = {}): Promise<CoursePage> => {
  const {
    category,
    level,
    price = 'all',
    minRating = 0,
    search,
    sortBy = 'newest',
    page = 1,
    pageSize = 12,
  } = options;
  const from = (Math.max(1, page) - 1) * Math.max(1, pageSize);
  const to = from + Math.max(1, pageSize) - 1;
  let query = getPublicCourseQuery().select('*', { count: 'exact' });

  if (category && category.toLowerCase() !== 'all') query = query.eq('category_name', category);
  if (level && level.toLowerCase() !== 'all') query = query.eq('level', level);
  if (price === 'free') query = query.eq('price', 0);
  if (price === 'paid') query = query.gt('price', 0);
  if (minRating > 0) query = query.gte('average_rating', minRating);

  const searchTerm = search?.trim().replace(/[%_*]/g, ' ').replace(/[\r\n"]/g, ' ');
  if (searchTerm) {
    const term = `"*${searchTerm.replace(/\\/g, '\\\\')}*"`;
    query = query.or(
      `title.ilike.${term},subtitle.ilike.${term},description.ilike.${term},category_name.ilike.${term}`,
    );
  }

  const sortColumn = {
    newest: 'created_at',
    'highest-rated': 'average_rating',
    'most-popular': 'enrolled_count',
    'price-low': 'price',
    'price-high': 'price',
  }[sortBy];
  const ascending = sortBy === 'price-low';
  const { data, error, count } = await query
    .order(sortColumn, { ascending })
    .range(from, to);
  if (error) throw new Error(getErrorMessage(error));
  return { courses: (data ?? []).map((row) => mapCourse(row)), total: count ?? 0 };
};

export const getCourses = async (options?: CourseFilterOptions): Promise<Course[]> =>
  (await getCoursesPage(options)).courses;

export const getCourseBySlug = async (slug: string): Promise<Course | undefined> => {
  const { data, error } = await getPublicCourseQuery().select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(getErrorMessage(error));
  if (!data) return undefined;

  const client = requireSupabase();
  const [modulesResult, lessonsResult] = await Promise.all([
    client.from('modules').select('id, course_id, title, position').eq('course_id', data.id).order('position'),
    client.from('lessons').select('*').eq('course_id', data.id).order('position'),
  ]);
  if (modulesResult.error) throw new Error(getErrorMessage(modulesResult.error));
  if (lessonsResult.error) throw new Error(getErrorMessage(lessonsResult.error));

  const sections = (modulesResult.data ?? []).map((module): CurriculumSection => {
    const lessons: Lesson[] = (lessonsResult.data ?? [])
      .filter((lesson) => lesson.module_id === module.id)
      .map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: toDuration(lesson.duration_minutes),
        type: lesson.type,
        isPreview: lesson.is_preview,
        videoDurationSeconds: lesson.duration_minutes * 60,
      }));
    return { id: module.id, title: module.title, lessons };
  });

  return mapCourse(data, sections);
};

export const getFeaturedCourses = async (): Promise<Course[]> =>
  getCourses({ page: 1, pageSize: 4, sortBy: 'most-popular' });
