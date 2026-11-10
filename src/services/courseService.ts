import { Course, CourseCategory, CourseLevel } from '../types';
import { mockCourses, primaryWebDevCourse } from '../data/mockData';

export interface CourseFilterOptions {
  category?: string;
  level?: string;
  price?: 'all' | 'paid' | 'free';
  minRating?: number;
  search?: string;
  sortBy?: 'newest' | 'highest-rated' | 'most-popular' | 'price-low' | 'price-high';
}

export const getCourses = async (options?: CourseFilterOptions): Promise<Course[]> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 60));

  let results = [...mockCourses];

  if (!options) return results;

  const { category, level, price, minRating, search, sortBy } = options;

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'all') {
    results = results.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (level && level !== 'all') {
    results = results.filter(
      (c) => c.level.toLowerCase() === level.toLowerCase()
    );
  }

  if (price && price !== 'all') {
    if (price === 'free') {
      results = results.filter((c) => c.price === 0);
    } else if (price === 'paid') {
      results = results.filter((c) => c.price > 0);
    }
  }

  if (minRating && minRating > 0) {
    results = results.filter((c) => c.rating >= minRating);
  }

  if (sortBy) {
    switch (sortBy) {
      case 'highest-rated':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'most-popular':
        results.sort((a, b) => b.enrolledCount - a.enrolledCount);
        break;
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        // Default order
        break;
    }
  }

  return results;
};

export const getCourseBySlug = async (slug: string): Promise<Course | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (slug === primaryWebDevCourse.slug) {
    return primaryWebDevCourse;
  }
  return mockCourses.find((c) => c.slug === slug);
};

export const getFeaturedCourses = async (): Promise<Course[]> => {
  await new Promise((resolve) => setTimeout(resolve, 40));
  return mockCourses.slice(0, 4);
};

