import React from 'react';
import { Award, Download, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, Button, Badge, ProgressBar } from '../../components/ui';

export const InstructorQuizResults: React.FC = () => {
  const quizAnalytics = [
    {
      id: 'quiz-1',
      title: 'Kuis 1: Arsitektur React & Frontend',
      course: 'Bootcamp Pengembangan Web 2025',
      submissions: 1420,
      avgScore: 86.5,
      passRate: 92,
      pendingGrading: 0,
    },
    {
      id: 'quiz-2',
      title: 'Kuis 2: JavaScript ES6+ Modern & Asinkron',
      course: 'Bootcamp Pengembangan Web 2025',
      submissions: 1390,
      avgScore: 89.2,
      passRate: 95,
      pendingGrading: 0,
    },
    {
      id: 'quiz-3',
      title: 'Kuis 3: Full-Stack Node.js & Skema',
      course: 'Bootcamp Pengembangan Web 2025',
      submissions: 0,
      avgScore: 0,
      passRate: 0,
      pendingGrading: 0,
      isDraft: true,
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Evaluasi & Penilaian Kuis</h1>
          <p className="text-xs text-slate-500 mt-1">Tinjau statistik kuis, batas kelulusan, dan daftar nilai peserta</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Ekspor Daftar Nilai (.CSV)
        </Button>
      </div>

      <div className="space-y-4">
        {quizAnalytics.map((quiz) => (
          <Card key={quiz.id} className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-text-heading">{quiz.title}</h3>
                  <Badge variant={quiz.isDraft ? 'draft' : 'active'} size="xs">
                    {quiz.isDraft ? 'Silabus Draf' : 'Evaluasi Aktif'}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">{quiz.course}</span>
              </div>

              {!quiz.isDraft && (
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Tingkat Kelulusan</span>
                    <span className="text-green font-extrabold text-sm">{quiz.passRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Rata-rata Angkatan</span>
                    <span className="text-navy font-extrabold text-sm">{quiz.avgScore}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                {quiz.isDraft
                  ? 'Kuis ini belum diterbitkan ke daftar nilai peserta.'
                  : `Total jawaban terverifikasi: ${quiz.submissions.toLocaleString()} peserta`}
              </span>

              <Button variant="navy" size="sm">
                Lihat Rincian Jawaban →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
