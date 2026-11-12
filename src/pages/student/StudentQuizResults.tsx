import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Clock } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getStudentQuizHistory, StudentQuizHistoryItem } from '../../services/learningAnalyticsService';

const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const StudentQuizResults: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<StudentQuizHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) return;
    setIsLoading(true);
    setError('');
    void getStudentQuizHistory(user.id)
      .then((history) => { if (active) setResults(history); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Riwayat kuis gagal dimuat.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [user]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-text-heading">Evaluasi & Riwayat Kuis</h1>
        <p className="mt-1 text-xs text-slate-500">Nilai dan waktu pengerjaan dari percobaan kuis yang tersimpan.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500">Memuat riwayat kuis...</Card>
      ) : results.length ? (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.attemptId} className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-green/20 bg-green-tint text-green">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant={result.passed ? 'active' : 'in-review'} size="xs">
                      {result.passed ? 'Lulus' : 'Belum lulus'} · {result.score.toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.submittedAt))}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-text-heading">{result.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{result.courseTitle} · {result.moduleTitle}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Waktu: {formatDuration(result.timeTakenSeconds)}
                  </span>
                </div>
              </div>
              <Button
                variant="navy"
                size="sm"
                onClick={() => navigate(`/quiz/${result.quizId}/result?attempt=${encodeURIComponent(result.attemptId)}`)}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Lihat Rincian Nilai
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Award className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-text-heading">Belum ada hasil kuis</p>
          <p className="mt-1 text-sm text-slate-500">Hasil kuis yang sudah dikirim akan muncul di halaman ini.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/student/courses')}>Lihat kursus saya</Button>
        </Card>
      )}
    </div>
  );
};
