import React, { useCallback, useEffect, useState } from 'react';
import { Check, Eye, LockKeyhole, UnlockKeyhole, X } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '../../components/ui';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';

type ReviewCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  admin_locked: boolean;
  thumbnail_path: string | null;
  created_at: string;
  teacher_id: string;
  teacher_name: string;
  category_name: string;
  lesson_count: number;
  duration_minutes: number;
};

export const AdminCoursesReview: React.FC = () => {
  const [courses, setCourses] = useState<ReviewCourse[]>([]);
  const [view, setView] = useState<'pending_review' | 'published'>('pending_review');
  const [selected, setSelected] = useState<ReviewCourse | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    const client = requireSupabase();
    const { data: courseRows, error: coursesError } = await client.from('courses')
      .select('id, title, slug, description, status, admin_locked, thumbnail_path, created_at, teacher_id, category_id')
      .eq('status', view).order('updated_at', { ascending: false });
    if (coursesError) throw new Error(getErrorMessage(coursesError));
    const rows = courseRows ?? [];
    if (!rows.length) {
      setCourses([]);
      return;
    }

    const [profilesResult, categoriesResult, lessonsResult] = await Promise.all([
      client.from('profiles').select('id, full_name').in('id', rows.map((row) => row.teacher_id)),
      client.from('categories').select('id, name').in('id', rows.map((row) => row.category_id).filter((value): value is string => value !== null)),
      client.from('lessons').select('course_id, duration_minutes').in('course_id', rows.map((row) => row.id)),
    ]);
    if (profilesResult.error) throw new Error(getErrorMessage(profilesResult.error));
    if (categoriesResult.error) throw new Error(getErrorMessage(categoriesResult.error));
    if (lessonsResult.error) throw new Error(getErrorMessage(lessonsResult.error));
    const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name]));
    const categories = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
    const lessonCounts = new Map<string, { count: number; duration: number }>();
    (lessonsResult.data ?? []).forEach((lesson) => {
      const current = lessonCounts.get(lesson.course_id) ?? { count: 0, duration: 0 };
      lessonCounts.set(lesson.course_id, {
        count: current.count + 1,
        duration: current.duration + lesson.duration_minutes,
      });
    });
    setCourses(rows.map((row) => {
      const lessonData = lessonCounts.get(row.id) ?? { count: 0, duration: 0 };
      return {
        ...row,
        teacher_name: profiles.get(row.teacher_id) ?? 'Pengajar',
        category_name: categories.get(row.category_id ?? '') ?? 'Tanpa kategori',
        lesson_count: lessonData.count,
        duration_minutes: lessonData.duration,
      };
    }));
  }, [view]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    void reload().catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [reload]);

  const decide = async (course: ReviewCourse, approve: boolean) => {
    if (!approve && !rejectionNote.trim()) {
      setError('Catatan penolakan wajib diisi.');
      return;
    }
    setIsSaving(true);
    setError('');
    const { error: decisionError } = await requireSupabase().rpc('review_course', {
      p_course_id: course.id,
      p_approve: approve,
      p_note: approve ? null : rejectionNote.trim(),
    });
    if (decisionError) setError(getErrorMessage(decisionError));
    else {
      setNotice(approve ? `Kursus "${course.title}" telah diterbitkan.` : `Kursus "${course.title}" dikembalikan ke draf.`);
      setSelected(null);
      setRejectionNote('');
      try {
        await reload();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }
    setIsSaving(false);
  };

  const updateLock = async (course: ReviewCourse) => {
    setIsSaving(true);
    setError('');
    const { error: lockError } = await requireSupabase().from('courses')
      .update({ admin_locked: !course.admin_locked }).eq('id', course.id);
    if (lockError) setError(getErrorMessage(lockError));
    else {
      setNotice(course.admin_locked ? 'Kursus dibuka kembali.' : 'Kursus dikunci dan disembunyikan dari katalog.');
      try {
        await reload();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }
    setIsSaving(false);
  };

  const withdraw = async (course: ReviewCourse) => {
    if (!window.confirm(`Tarik kursus "${course.title}" dari publikasi?`)) return;
    setIsSaving(true);
    setError('');
    const { error: withdrawError } = await requireSupabase().from('courses')
      .update({ status: 'archived' }).eq('id', course.id);
    if (withdrawError) setError(getErrorMessage(withdrawError));
    else {
      setNotice(`Kursus "${course.title}" ditarik dari publikasi.`);
      try {
        await reload();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }
    setIsSaving(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} jam ${rest} menit` : `${hours} jam`;
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-text-heading">Publikasi Kursus</h1>
        <p className="mt-1 text-sm text-slate-500">Tinjau pengajuan, terbitkan, tarik, atau kunci kursus langsung melalui Supabase.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green/20 bg-green-tint p-3 text-sm text-green">{notice}</p>}
      <div className="flex gap-2">
        <Button variant={view === 'pending_review' ? 'navy' : 'outline'} onClick={() => setView('pending_review')}>Menunggu tinjauan</Button>
        <Button variant={view === 'published' ? 'navy' : 'outline'} onClick={() => setView('published')}>Kursus terbit</Button>
      </div>
      <div className="space-y-4">
        {isLoading && <Card className="p-8 text-center text-sm text-slate-500">Memuat kursus...</Card>}
        {!isLoading && !courses.length && <Card className="p-8 text-center text-sm text-slate-500">{view === 'pending_review' ? 'Tidak ada kursus menunggu tinjauan.' : 'Belum ada kursus terbit.'}</Card>}
        {!isLoading && courses.map((course) => {
          const thumbnail = course.thumbnail_path
            ? requireSupabase().storage.from('course-thumbnails').getPublicUrl(course.thumbnail_path).data.publicUrl
            : '';
          return (
            <Card key={course.id} className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                {thumbnail && <img src={thumbnail} alt="" className="h-20 w-28 rounded-xl object-cover" />}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={course.admin_locked ? 'in-review' : view === 'published' ? 'active' : 'in-review'}>
                      {course.admin_locked ? 'Dikunci' : view === 'published' ? 'Terbit' : 'Menunggu tinjauan'}
                    </Badge>
                    <span className="text-xs text-slate-400">{new Date(course.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h2 className="mt-2 font-bold text-text-heading">{course.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{course.teacher_name} · {course.category_name} · {course.lesson_count} materi · {formatDuration(course.duration_minutes)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(course)} leftIcon={<Eye className="h-4 w-4" />}>Tinjau</Button>
                {view === 'pending_review' ? (
                  <>
                    <Button variant="orange" size="sm" disabled={isSaving} onClick={() => void decide(course, true)} leftIcon={<Check className="h-4 w-4" />}>Terbitkan</Button>
                    <Button variant="danger" size="sm" disabled={isSaving} onClick={() => { setSelected(course); setRejectionNote(''); }}>Tolak</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" disabled={isSaving} onClick={() => void updateLock(course)}>
                      {course.admin_locked ? <UnlockKeyhole className="mr-2 h-4 w-4" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                      {course.admin_locked ? 'Buka kunci' : 'Kunci'}
                    </Button>
                    <Button variant="danger" size="sm" disabled={isSaving} onClick={() => void withdraw(course)}>Tarik kursus</Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="course-review-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-blue">Tinjauan kursus</p>
                <h2 id="course-review-title" className="mt-1 text-xl font-bold text-text-heading">{selected.title}</h2>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 flex items-center gap-3"><Avatar name={selected.teacher_name} size="sm" /><span className="text-sm font-semibold">{selected.teacher_name}</span></div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.description}</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-400">Kategori</dt><dd>{selected.category_name}</dd></div>
              <div><dt className="text-xs text-slate-400">Materi</dt><dd>{selected.lesson_count} · {formatDuration(selected.duration_minutes)}</dd></div>
              <div><dt className="text-xs text-slate-400">Slug</dt><dd className="font-mono text-xs">{selected.slug}</dd></div>
              <div><dt className="text-xs text-slate-400">Status</dt><dd>{selected.status}</dd></div>
            </dl>
            {view === 'pending_review' && (
              <label className="mt-5 block text-xs font-semibold">Catatan penolakan (wajib bila menolak)
                <textarea value={rejectionNote} onChange={(event) => setRejectionNote(event.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-border p-3 text-sm" />
              </label>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-red">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
              {view === 'pending_review' && <Button variant="danger" disabled={isSaving} onClick={() => void decide(selected, false)}>Tolak</Button>}
              {view === 'pending_review' && <Button variant="orange" disabled={isSaving} onClick={() => void decide(selected, true)}>Setujui & terbitkan</Button>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
