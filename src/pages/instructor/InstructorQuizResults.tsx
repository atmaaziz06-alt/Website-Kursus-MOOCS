import React, { useState } from 'react';
import { Award, Download, X } from 'lucide-react';
import { Card, Button, Badge, ProgressBar } from '../../components/ui';
import { instructorStudents } from '../../data/instructorStudents';
import { downloadCSV } from '../../utils/download';

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
  const [selectedQuiz, setSelectedQuiz] = useState<(typeof quizAnalytics)[number] | null>(null);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Evaluasi & Penilaian Kuis</h1>
          <p className="text-xs text-slate-500 mt-1">Tinjau statistik kuis, batas kelulusan, dan daftar nilai peserta</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCSV('daftar-nilai-peserta.csv', [
            ['ID', 'Nama Peserta', 'Progres Kursus', 'Nilai Rata-rata'],
            ...instructorStudents.map((student) => [
              student.id,
              student.name,
              `${student.progress}%`,
              `${student.score.toFixed(1)}%`,
            ]),
          ])}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
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

              <Button
                variant="navy"
                size="sm"
                disabled={Boolean(quiz.isDraft)}
                onClick={() => setSelectedQuiz(quiz)}
              >
                Lihat Rincian Jawaban →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedQuiz(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-submissions-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-soft-lg"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="quiz-submissions-title" className="text-lg font-bold text-text-heading">
                  Rincian Jawaban Peserta
                </h2>
                <p className="mt-1 text-sm text-slate-500">{selectedQuiz.title}</p>
              </div>
              <button
                type="button"
                aria-label="Tutup rincian jawaban"
                onClick={() => setSelectedQuiz(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-xs text-slate-500">Pengumpulan</span>
                <strong className="text-lg text-navy">{selectedQuiz.submissions.toLocaleString()}</strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-xs text-slate-500">Rata-rata nilai</span>
                <strong className="text-lg text-navy">{selectedQuiz.avgScore}%</strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-xs text-slate-500">Tingkat kelulusan</span>
                <strong className="text-lg text-green">{selectedQuiz.passRate}%</strong>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-slate-400">
                    <th className="pb-3">Peserta</th>
                    <th className="pb-3">Progres Kursus</th>
                    <th className="pb-3 text-right">Nilai Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {instructorStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="py-3 font-semibold text-text-heading">{student.name}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar progress={student.progress} size="xs" color={student.progress === 100 ? 'green' : 'blue'} />
                          <span className="text-xs text-slate-500">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-navy">{student.score.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedQuiz(null)}>Tutup</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
