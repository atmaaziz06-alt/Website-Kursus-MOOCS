import React from 'react';
import { FileCheck2, Check, X, Eye, Download } from 'lucide-react';
import { Card, Button, Badge, Avatar } from '../../components/ui';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';

export const AdminCoursesReview: React.FC = () => {
  const reviews = [
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
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Kursus Menunggu Pemeriksaan & Akreditasi</h1>
          <p className="text-xs text-slate-500 mt-1">Tinjau silabus, video, dan kuis interaktif sebelum kursus diterbitkan</p>
        </div>
      </div>

      <div className="space-y-4">
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
                <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Periksa Silabus
                </Button>
                <Button variant="orange" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>
                  Setujui & Terbitkan
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
