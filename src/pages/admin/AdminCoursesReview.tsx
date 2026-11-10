import React, { useState } from 'react';
import { FileCheck2, Check, X, Eye } from 'lucide-react';
import { Card, Button, Badge, Avatar } from '../../components/ui';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';
import { translateCategory } from '../../config/locale';

export const AdminCoursesReview: React.FC = () => {
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      title: 'Next.js 15 Full-Stack & Agen AI',
      slug: 'full-stack-nextjs-ai',
      instructor: 'John Smith',
      instructorId: 'john-smith',
      category: 'Development',
      submittedDate: '10 Mei 2025',
      lessonsCount: 36,
      duration: '18,5 jam',
      status: 'Pending QA',
    },
    {
      id: 'rev-2',
      title: 'Deep Learning dengan PyTorch: Dari Tensor hingga LLM',
      slug: 'deep-learning-pytorch',
      instructor: 'Dr. Siti Nurhaliza M.Cs.',
      instructorId: 'dr-siti',
      category: 'Technology',
      submittedDate: '8 Mei 2025',
      lessonsCount: 30,
      duration: '28 jam',
      status: 'Pending QA',
    },
    {
      id: 'rev-3',
      title: 'Arsitektur Sistem Desain Figma: Variables & Token',
      slug: 'figma-design-system',
      instructor: 'Sarah Jenkins',
      instructorId: 'sarah-jenkins',
      category: 'Design',
      submittedDate: '5 Mei 2025',
      lessonsCount: 24,
      duration: '16 jam',
      status: 'In Review',
    },
    {
      id: 'rev-4',
      title: 'Cloud DevOps dengan Kubernetes: Alur Kerja GitOps',
      slug: 'cloud-devops-kubernetes',
      instructor: 'Marcus Vance',
      instructorId: 'marcus-vance',
      category: 'Technology',
      submittedDate: '2 Mei 2025',
      lessonsCount: 29,
      duration: '24 jam',
      status: 'In Review',
    },
  ]);
  const [selectedReview, setSelectedReview] = useState<(typeof reviews)[number] | null>(null);
  const [feedback, setFeedback] = useState('');

  const decideReview = (reviewId: string, decision: 'approved' | 'rejected') => {
    const review = reviews.find((item) => item.id === reviewId);
    if (!review) return;
    setReviews((current) => current.filter((item) => item.id !== reviewId));
    setFeedback(decision === 'approved'
      ? `Kursus "${review.title}" disetujui dan diterbitkan.`
      : `Kursus "${review.title}" ditolak dan dikembalikan kepada pengajar.`);
    setSelectedReview(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Kursus Menunggu Pemeriksaan & Akreditasi</h1>
          <p className="text-xs text-slate-500 mt-1">Tinjau silabus, video, dan kuis interaktif sebelum kursus diterbitkan</p>
        </div>
      </div>

      {feedback && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-green/20 bg-green-tint/50 px-4 py-3 text-sm text-green">
          <span>{feedback}</span>
          <button type="button" aria-label="Tutup pemberitahuan" onClick={() => setFeedback('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-500">Tidak ada kursus yang menunggu pemeriksaan.</Card>
        )}
        {reviews.map((r) => {
          const cMedia = getCourseMedia(r.slug);
          const instPhoto = getInstructorPhoto(r.instructorId);

          return (
            <Card key={r.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={cMedia.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="in-review" size="xs">{r.status === 'Pending QA' ? 'Menunggu Pemeriksaan' : 'Sedang Ditinjau'}</Badge>
                    <span className="text-xs text-slate-400">Dikirim {r.submittedDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-heading mb-1">{r.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Avatar src={instPhoto} name={r.instructor} size="xs" />
                      <span>{r.instructor}</span>
                    </div>
                    <span>•</span>
                    <span>{r.lessonsCount} Pelajaran</span>
                    <span>•</span>
                    <span>{r.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end lg:self-center">
                <Button variant="outline" size="sm" onClick={() => setSelectedReview(r)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Periksa Silabus
                </Button>
                <Button variant="orange" size="sm" onClick={() => decideReview(r.id, 'approved')} leftIcon={<Check className="w-3.5 h-3.5" />}>
                  Setujui & Terbitkan
                </Button>
                <Button variant="danger" size="sm" aria-label={`Tolak ${r.title}`} onClick={() => decideReview(r.id, 'rejected')}>
                  Tolak
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedReview(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="review-dialog-title" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-soft-lg">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue">Pemeriksaan kursus</p>
                <h2 id="review-dialog-title" className="mt-1 text-lg font-bold text-text-heading">{selectedReview.title}</h2>
              </div>
              <button type="button" aria-label="Tutup rincian" onClick={() => setSelectedReview(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Pengajar</dt><dd className="font-semibold">{selectedReview.instructor}</dd></div>
              <div><dt className="text-xs text-slate-500">Kategori</dt><dd className="font-semibold">{translateCategory(selectedReview.category)}</dd></div>
              <div><dt className="text-xs text-slate-500">Jumlah pelajaran</dt><dd className="font-semibold">{selectedReview.lessonsCount}</dd></div>
              <div><dt className="text-xs text-slate-500">Durasi</dt><dd className="font-semibold">{selectedReview.duration}</dd></div>
              <div><dt className="text-xs text-slate-500">Tanggal pengajuan</dt><dd className="font-semibold">{selectedReview.submittedDate}</dd></div>
              <div><dt className="text-xs text-slate-500">Status</dt><dd className="font-semibold">{selectedReview.status === 'Pending QA' ? 'Menunggu Pemeriksaan' : 'Sedang Ditinjau'}</dd></div>
            </dl>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedReview(null)}>Tutup</Button>
              <Button variant="orange" onClick={() => decideReview(selectedReview.id, 'approved')} leftIcon={<Check className="h-4 w-4" />}>Setujui & Terbitkan</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
