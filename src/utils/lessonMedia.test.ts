import { describe, expect, it } from 'vitest';
import { getLessonFileKind, getVideoEmbedUrl, validateLessonFile } from './lessonMedia';

describe('lesson media helpers', () => {
  it('creates safe embeds only for supported YouTube and Vimeo URLs', () => {
    expect(getVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(getVideoEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');
    expect(getVideoEmbedUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(getVideoEmbedUrl('https://example.com/video')).toBeNull();
  });

  it('identifies lesson file types', () => {
    expect(getLessonFileKind('course/lesson/handout.PDF')).toBe('pdf');
    expect(getLessonFileKind('course/lesson/diagram.webp')).toBe('image');
    expect(getLessonFileKind('course/lesson/lecture.webm')).toBe('video');
    expect(getLessonFileKind('course/lesson/file.bin')).toBe('unknown');
  });

  it('validates media by lesson type and size', () => {
    expect(validateLessonFile(new File(['image'], 'diagram.png', { type: 'image/png' }), 'text')).toBeNull();
    expect(validateLessonFile(new File(['pdf'], 'notes.pdf', { type: 'application/pdf' }), 'lab')).toBeNull();
    expect(validateLessonFile(new File(['image'], 'image.png', { type: 'image/png' }), 'pdf')).toContain('PDF');
    expect(validateLessonFile(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' }), 'pdf')).toContain('10 MB');
  });
});
