import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Download, Play, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';
import { getLessonFileKind, getVideoEmbedUrl } from '../../utils/lessonMedia';

type LessonView = {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'lab' | 'text';
  duration_minutes: number;
  module_id: string;
  module_title: string;
  position: number;
  module_position: number;
};
type LessonContent = { content: string | null; video_url: string | null; file_path: string | null };
type LessonNote = { note: string; is_bookmarked: boolean; sandbox_code: string };
type QuizLink = { id: string; title: string; module_id: string | null };

export const LessonLearnPage: React.FC = () => {
  const { courseSlug = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markLessonCompleted, getCourseProgress } = useCourses();
  const [course, setCourse] = useState<{ id: string; title: string } | null>(null);
  const [lessons, setLessons] = useState<LessonView[]>([]);
  const [quizzes, setQuizzes] = useState<QuizLink[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonView | null>(null);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [signedFileUrl, setSignedFileUrl] = useState('');
  const [note, setNote] = useState<LessonNote>({ note: '', is_bookmarked: false, sandbox_code: '' });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadLesson = useCallback(async () => {
    if (!user) throw new Error('Silakan masuk dengan akun peserta untuk mengakses materi.');
    const client = requireSupabase();
    const { data: courseData, error: courseError } = await client.from('courses')
      .select('id, title').eq('slug', courseSlug).maybeSingle();
    if (courseError) throw new Error(getErrorMessage(courseError));
    if (!courseData) throw new Error('Kursus tidak ditemukan.');
    const [modulesResult, lessonsResult, contentResult, notesResult, progressResult, quizzesResult] = await Promise.all([
      client.from('modules').select('id, title, position').eq('course_id', courseData.id).order('position'),
      client.from('lessons').select('id, module_id, title, type, duration_minutes, position')
        .eq('course_id', courseData.id).order('position'),
      client.from('lesson_contents').select('content, video_url, file_path').eq('lesson_id', lessonId).maybeSingle(),
      client.from('lesson_notes').select('note, is_bookmarked, sandbox_code').eq('lesson_id', lessonId)
        .eq('student_id', user.id).maybeSingle(),
      client.from('lesson_progress').select('id').eq('lesson_id', lessonId).eq('student_id', user.id).maybeSingle(),
      client.from('quizzes').select('id, title, module_id').eq('course_id', courseData.id).eq('is_published', true),
    ]);
    if (modulesResult.error) throw new Error(getErrorMessage(modulesResult.error));
    if (lessonsResult.error) throw new Error(getErrorMessage(lessonsResult.error));
    if (contentResult.error) throw new Error(getErrorMessage(contentResult.error));
    if (notesResult.error) throw new Error(getErrorMessage(notesResult.error));
    if (progressResult.error) throw new Error(getErrorMessage(progressResult.error));
    if (quizzesResult.error) throw new Error(getErrorMessage(quizzesResult.error));

    const modulesById = new Map((modulesResult.data ?? []).map((module) => [module.id, module]));
    const orderedLessons = (lessonsResult.data ?? []).flatMap((lesson) => {
      const module = modulesById.get(lesson.module_id);
      if (!module) return [];
      return [{
        ...lesson,
        type: lesson.type as LessonView['type'],
        module_title: module.title,
        module_position: module.position,
      }];
    }).sort((a, b) => a.module_position - b.module_position || a.position - b.position);
    const currentLesson = orderedLessons.find((lesson) => lesson.id === lessonId);
    if (!currentLesson) throw new Error('Materi tidak ditemukan dalam kursus ini.');

    let fileUrl = '';
    if (contentResult.data?.file_path) {
      const { data: signedUrl, error: signedUrlError } = await client.storage.from('lesson-files')
        .createSignedUrl(contentResult.data.file_path, 15 * 60);
      if (signedUrlError) throw new Error(getErrorMessage(signedUrlError));
      fileUrl = signedUrl.signedUrl;
    }

    setCourse(courseData);
    setLessons(orderedLessons);
    setQuizzes(quizzesResult.data ?? []);
    setActiveLesson(currentLesson);
    setContent(contentResult.data);
    setSignedFileUrl(fileUrl);
    setNote({
      note: notesResult.data?.note ?? '',
      is_bookmarked: notesResult.data?.is_bookmarked ?? false,
      sandbox_code: notesResult.data?.sandbox_code ?? '',
    });
    setIsCompleted(Boolean(progressResult.data));
  }, [courseSlug, lessonId, user]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    void loadLesson().catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [loadLesson]);

  const currentIndex = useMemo(() => lessons.findIndex((lesson) => lesson.id === lessonId), [lessonId, lessons]);
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const progress = getCourseProgress(courseSlug);
  const fileKind = content?.file_path ? getLessonFileKind(content.file_path) : 'unknown';
  const videoEmbedUrl = content?.video_url ? getVideoEmbedUrl(content.video_url) : null;
  const hasMedia = Boolean(
    (activeLesson?.type === 'video' && videoEmbedUrl)
    || (activeLesson?.type === 'video' && fileKind === 'video' && signedFileUrl)
    || ((fileKind === 'pdf' || fileKind === 'image') && signedFileUrl),
  );

  const saveNote = async () => {
    if (!user) return;
    setIsSaving(true);
    setError('');
    setNotice('');
    const { error: saveError } = await requireSupabase().from('lesson_notes').upsert({
      student_id: user.id,
      lesson_id: lessonId,
      note: note.note,
      is_bookmarked: note.is_bookmarked,
      sandbox_code: note.sandbox_code,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' });
    if (saveError) setError(getErrorMessage(saveError));
    else setNotice('Catatan dan status simpan tersimpan.');
    setIsSaving(false);
  };

  const markCompleted = async () => {
    if (isCompleted) return;
    setIsSaving(true);
    setError('');
    try {
      await markLessonCompleted(courseSlug, lessonId);
      setIsCompleted(true);
      setNotice('Progres materi tersimpan.');
    } catch (progressError) {
      setError(progressError instanceof Error ? progressError.message : 'Progres gagal disimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Card className="mx-auto my-10 max-w-3xl p-10 text-center text-sm text-slate-500">Memuat materi...</Card>;
  if (!course || !activeLesson) {
    return (
      <Card className="mx-auto my-10 max-w-3xl p-8">
        <p role="alert" className="text-sm text-red">{error || 'Materi tidak tersedia.'}</p>
        <Button className="mt-4" variant="navy" onClick={() => navigate('/student/courses')}>Kembali ke kursus</Button>
      </Card>
    );
  }

  return (
    <main className="min-h-screen bg-app px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1050px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4">
          <div>
            <Link to="/student/courses" className="inline-flex items-center gap-2 text-xs font-bold text-blue"><ArrowLeft className="h-4 w-4" /> Kursus Saya</Link>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">{course.title} · {activeLesson.module_title}</p>
            <h1 className="mt-1 text-xl font-extrabold text-text-heading">{activeLesson.title}</h1>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>{progress?.progressPercent ?? 0}% progres kursus</p>
            <p>{activeLesson.duration_minutes} menit</p>
          </div>
        </header>

        {(error || notice) && (
          <p role={error ? 'alert' : 'status'} className={`rounded-xl border p-3 text-sm ${error ? 'border-red/20 bg-red/5 text-red' : 'border-green/20 bg-green-tint text-green'}`}>
            {error || notice}
          </p>
        )}

        <Card className="min-h-[280px] p-5 sm:p-8">
          <div className="space-y-5">
            {activeLesson.type === 'video' && videoEmbedUrl && (
              <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
                <iframe title={activeLesson.title} src={videoEmbedUrl} className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            )}
            {activeLesson.type === 'video' && fileKind === 'video' && signedFileUrl && (
              <video className="aspect-video w-full rounded-xl bg-slate-900" src={signedFileUrl} controls />
            )}
            {activeLesson.type === 'video' && content?.video_url && !videoEmbedUrl && (
              <p role="alert" className="rounded-lg bg-orange-tint p-3 text-sm text-orange-dark">
                Tautan video tidak didukung. Pengajar perlu memperbaruinya dengan tautan YouTube atau Vimeo.
              </p>
            )}
            {fileKind === 'pdf' && signedFileUrl && (
              <div className="space-y-3">
                <iframe title={`PDF ${activeLesson.title}`} src={signedFileUrl} className="h-[70vh] min-h-[420px] w-full rounded-xl border border-border" />
                <a href={signedFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue">
                  <Download className="h-4 w-4" /> Buka atau unduh PDF
                </a>
              </div>
            )}
            {fileKind === 'image' && signedFileUrl && (
              <img src={signedFileUrl} alt={`Materi ${activeLesson.title}`} className="max-h-[70vh] w-full rounded-xl object-contain" />
            )}
            {content?.content && (
              <article className="space-y-3 text-sm leading-7 text-slate-700 [&_a]:font-semibold [&_a]:text-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-blue [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-emerald-300 [&_ul]:list-disc">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content.content}</ReactMarkdown>
              </article>
            )}
            {activeLesson.type === 'lab' && (
              <div className="space-y-3 border-t border-border pt-4">
                <h2 className="font-bold text-text-heading">Lab / ruang praktik</h2>
                <textarea aria-label="Kode praktik" rows={10} value={note.sandbox_code} onChange={(event) => setNote((current) => ({ ...current, sandbox_code: event.target.value }))}
                  className="w-full rounded-xl border border-border p-3 font-mono text-sm focus:border-blue focus:outline-none" placeholder="Tulis kode latihan di sini..." />
              </div>
            )}
            {!content?.content && !hasMedia && !(activeLesson.type === 'video' && content?.video_url) && (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-slate-500">
                <Play className="h-9 w-9 text-blue" />
                <p className="mt-3 text-sm">Materi belum memiliki isi.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          {quizzes.length > 0 && (
            <section className="space-y-3 border-b border-border pb-4">
              <h2 className="font-bold text-text-heading">Kuis tersedia</h2>
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-soft-blue/50 p-3">
                  <span className="text-sm font-semibold text-slate-700">{quiz.title}</span>
                  <Button variant="navy" size="sm" onClick={() => navigate(`/quiz/${quiz.id}`)}>Mulai kuis</Button>
                </div>
              ))}
            </section>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-text-heading">Catatan pribadi</h2>
            <Button variant={note.is_bookmarked ? 'orange' : 'outline'} size="sm"
              onClick={() => setNote((current) => ({ ...current, is_bookmarked: !current.is_bookmarked }))}>
              <Bookmark className="mr-2 h-4 w-4" /> {note.is_bookmarked ? 'Disimpan' : 'Simpan materi'}
            </Button>
          </div>
          <textarea aria-label="Catatan materi" rows={4} value={note.note}
            onChange={(event) => setNote((current) => ({ ...current, note: event.target.value }))}
            className="w-full rounded-xl border border-border p-3 text-sm focus:border-blue focus:outline-none" placeholder="Catatan ini hanya dapat dilihat olehmu." />
          <Button variant="outline" disabled={isSaving} onClick={() => void saveNote()}><Save className="mr-2 h-4 w-4" />Simpan catatan</Button>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          {previous ? <Button variant="outline" onClick={() => navigate(`/learn/${courseSlug}/${previous.id}`)}>← {previous.title}</Button> : <span />}
          <Button variant={isCompleted ? 'outline' : 'orange'} disabled={isSaving || isCompleted}
            onClick={() => void markCompleted()} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            {isCompleted ? 'Materi selesai' : 'Tandai selesai'}
          </Button>
          {next ? <Button variant="navy" onClick={() => navigate(`/learn/${courseSlug}/${next.id}`)} rightIcon={<ArrowRight className="h-4 w-4" />}>Berikutnya</Button> : <span />}
        </Card>
      </div>
    </main>
  );
};
