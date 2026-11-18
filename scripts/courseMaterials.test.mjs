import { describe, expect, it } from 'vitest';
import { courseMaterials, validateCourseMaterials } from './courseMaterials.mjs';

const demoCourses = Object.keys(courseMaterials).map((slug) => ({
  slug,
  status: slug === 'cloud-deployment-basics' ? 'pending_review' : 'published',
}));

describe('demo course materials', () => {
  it('provides complete lessons, previews, worksheets, and practical tasks', () => {
    expect(() => validateCourseMaterials(demoCourses)).not.toThrow();

    for (const course of demoCourses) {
      const material = courseMaterials[course.slug];
      expect(material.lessons).toHaveLength(4);
      expect(material.questions).toHaveLength(5);
      expect(material.lessons.some((lesson) => lesson.type === 'lab')).toBe(true);
      expect(material.lessons.find((lesson) => lesson.type === 'lab').content)
        .toContain('**Hasil yang dikumpulkan:**');
    }
  });

  it('rejects missing course content and invalid quiz answer keys', () => {
    expect(() => validateCourseMaterials([{ slug: 'missing-course', status: 'published' }]))
      .toThrow('Materi kursus tidak tersedia');

    const invalidCourse = {
      slug: demoCourses[0].slug,
      status: 'published',
    };
    const original = courseMaterials[invalidCourse.slug];
    const invalidMaterials = {
      ...courseMaterials,
      [invalidCourse.slug]: {
        ...original,
        questions: original.questions.map((item, index) => (
          index === 0 ? { ...item, correctIndex: item.options.length } : item
        )),
      },
    };
    expect(() => validateCourseMaterials([invalidCourse], invalidMaterials)).toThrow('Kuis belum lengkap');
  });
});
