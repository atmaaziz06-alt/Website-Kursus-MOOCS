import React, { useEffect, useState } from 'react';
import { Award, Download, X } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { downloadCSV } from '../../utils/download';
import {
  getInstructorQuizAnalytics,
  InstructorQuizAnalytics,
} from '../../services/learningAnalyticsService';

export const InstructorQuizResults: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<InstructorQuizAnalytics[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<InstructorQuizAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) return;
    setIsLoading(true);
    setError('');
    void getInstructorQuizAnalytics(user.id)
      .then((analytics) => { if (active) setQuizzes(analytics); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Analitik kuis gagal dimuat.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [user]);

  const exportSubmissions = () => {
    if (!selectedQuiz) return;
    downloadCSV(`nilai-${selectedQuiz.id}.csv`, [
      ['Nama Peserta', 'Nilai', 'Status', 'Waktu Pengumpulan'],
      ...selectedQuiz.submissions.map((submission) => [
        submission.studentName,
        `${submission.score.toFixed(1)}%`,
        submission.passed ? 'Lulus' : 'Belum lulus',
        new Date(submission.submittedAt).toLocaleString('id-ID'),
      ]),
    ]);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Evaluasi & Penilaian Kuis</h1>
          <p className="mt-1 text-xs text-slate-500">Statistik dan hasil percobaan peserta dari kursus yang kamu kelola.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedQuiz?.submissions.length}
          onClick={exportSubmissions}
          leftIcon={<Download className="h-3.5 w-3.5" />}
        >
          Ekspor rincian (.CSV)
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500">Memuat analitik kuis...</Card>
      ) : quizzes.length ? (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-6">
              <div className="mb-4 flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-text-heading">{quiz.title}</h2>
                    <Badge variant={quiz.submissions.length ? 'active' : 'draft'} size="xs">
                      {quiz.submissions.length ? 'Ada hasil' : 'Belum ada hasil'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{quiz.courseTitle}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Pengumpulan</span>
                    <span className="text-sm font-extrabold text-navy">{quiz.submissions.length}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Rata-rata</span>
                    <span className="text-sm font-extrabold text-navy">{quiz.averageScore.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Kelulusan</span>
                    <span className="text-sm font-extrabold text-green">{quiz.passRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <span className="text-xs text-slate-500">Batas nilai lulus: {quiz.passingScore}%</span>
                <Button variant="navy" size="sm" onClick={() => setSelectedQuiz(quiz)} disabled={!quiz.submissions.length}>
                  Lihat Rincian Jawaban →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Award className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-text-heading">Belum ada kuis</p>
          <p className="mt-1 text-sm text-slate-500">Kuis yang kamu buat akan muncul di halaman ini.</p>
        </Card>
      )}

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
                <h2 id="quiz-submissions-title" className="text-lg font-bold text-text-heading">Rincian Jawaban Peserta</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedQuiz.title} · {selectedQuiz.courseTitle}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-slate-400">
                    <th className="pb-3">Peserta</th>
                    <th className="pb-3 text-right">Nilai</th>
                    <th className="pb-3 text-right">Status</th>
                    <th className="pb-3 text-right">Dikirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {selectedQuiz.submissions.map((submission, index) => (
                    <tr key={`${submission.studentId}:${submission.submittedAt}:${index}`}>
                      <td className="py-3 font-semibold text-text-heading">{submission.studentName}</td>
                      <td className="py-3 text-right font-bold text-navy">{submission.score.toFixed(1)}%</td>
                      <td className="py-3 text-right">
                        <Badge variant={submission.passed ? 'active' : 'in-review'} size="xs">
                          {submission.passed ? 'Lulus' : 'Belum lulus'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-xs text-slate-500">
                        {new Date(submission.submittedAt).toLocaleString('id-ID')}
                      </td>
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
