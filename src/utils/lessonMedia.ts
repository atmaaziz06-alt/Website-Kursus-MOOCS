export type LessonFileKind = 'pdf' | 'image' | 'video' | 'unknown';
export type LessonType = 'video' | 'pdf' | 'lab' | 'text';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const videoMimeTypes = ['video/mp4', 'video/webm'];

export const validateLessonFile = (file: File, lessonType: LessonType): string | null => {
  if (file.size > 10 * 1024 * 1024) return 'Berkas materi maksimal 10 MB.';
  if (lessonType === 'video' && !videoMimeTypes.includes(file.type)) return 'Materi video harus berupa MP4 atau WebM.';
  if (lessonType === 'pdf' && file.type !== 'application/pdf') return 'Materi PDF harus berupa berkas PDF.';
  if (lessonType !== 'video' && lessonType !== 'pdf'
    && file.type !== 'application/pdf' && !imageMimeTypes.includes(file.type)) {
    return 'Materi tulisan mendukung gambar JPG, PNG, WebP, atau PDF.';
  }
  return null;
};

export const getLessonFileKind = (path: string): LessonFileKind => {
  const extension = path.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension ?? '')) return 'image';
  if (['mp4', 'webm'].includes(extension ?? '')) return 'video';
  return 'unknown';
};

export const getVideoEmbedUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be'].includes(url.hostname)) {
      const videoId = url.hostname === 'youtu.be'
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.pathname === '/watch'
          ? url.searchParams.get('v')
          : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
      return videoId && /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const videoId = url.pathname.match(/(?:^|\/)(\d+)(?:\/|$)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
};
