import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { getLatestQuizSubmission, QuizResult } from '../../services/quizService';

export const QuizResultPage: React.FC = () => {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt') ?? undefined;
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    void getLatestQuizSubmission(quizId, attemptId)
      .then((loaded) => {
        if (active) setResult(loaded);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Hasil kuis gagal dimuat.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [attemptId, quizId]);

  if (isLoading) return <Card className="mx-auto my-12 max-w-2xl p-10 text-center text-sm text-slate-500">Memuat hasil dari database...</Card>;
  if (error || !result) {
    return (
      <Card className="mx-auto my-12 max-w-2xl space-y-4 p-8 text-center">
        <p role="alert" className="text-sm text-red">{error || 'Belum ada hasil kuis yang dikirim.'}</p>
        <Button variant="navy" onClick={() => navigate('/student/courses')}>Kembali ke kursus</Button>
      </Card>
    );
  }

  const { quiz, submission, review } = result;
  const correctCount = review.filter((question) => question.isCorrect).length;
  const submittedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' })
    .format(new Date(submission.submittedAt));
  const timeTaken = `${String(Math.floor(submission.timeTakenSeconds / 60)).padStart(2, '0')}:${String(submission.timeTakenSeconds % 60).padStart(2, '0')}`;

  return (
    <main className="min-h-screen bg-app px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <Link to="/student/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-blue">
          <ArrowLeft className="h-4 w-4" /> Kursus Saya
        </Link>
        <Card className="p-6 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue">Hasil kuis tersimpan</p>
              <h1 className="mt-2 text-2xl font-extrabold text-text-heading">{quiz.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{quiz.courseTitle} · {quiz.moduleTitle}</p>
            </div>
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 border-blue bg-soft-blue">
              <strong className="text-3xl text-navy">{submission.scorePercent}%</strong>
              <span className="text-xs font-bold text-slate-500">NILAI</span>
            </div>
          </div>
          <div className="mt-7 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
            <p className="text-sm text-slate-600"><strong>{submission.passed ? 'Lulus' : 'Belum lulus'}</strong> · batas {quiz.passingScorePercent}%</p>
            <p className="text-sm text-slate-600">{correctCount}/{quiz.questions.length} soal benar</p>
            <p className="text-sm text-slate-600">Waktu {timeTaken} · {submittedDate}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="navy" onClick={() => navigate(`/quiz/${quiz.id}`)}>Coba lagi (jika masih tersedia)</Button>
            <Button variant="outline" onClick={() => navigate(`/courses/${quiz.courseSlug}`)}>Lihat kursus</Button>
          </div>
        </Card>

        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-text-heading">Tinjauan jawaban</h2>
          {quiz.questions.map((question) => {
            const answer = review.find((item) => item.questionId === question.id);
            return (
              <Card key={question.id} className="space-y-4 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Soal {question.id} · {question.topic}</p>
                    <h3 className="mt-2 whitespace-pre-wrap font-bold text-text-heading">{question.question}</h3>
                  </div>
                  <Badge variant={answer?.isCorrect ? 'active' : 'in-review'}>
                    {answer?.isCorrect ? 'Benar' : 'Salah'}
                  </Badge>
                </div>
                {question.codeSnippet && (
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">{question.codeSnippet.code}</pre>
                )}
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const correct = option.id === answer?.correctOptionId;
                    const selected = option.id === answer?.selectedOptionId;
                    return (
                      <div key={option.id} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-sm ${
                        correct ? 'border-green/30 bg-green-tint text-green-900'
                          : selected ? 'border-red/30 bg-red-tint text-red-900'
                            : 'border-border text-slate-600'
                      }`}>
                        <span><strong>{option.id}.</strong> {option.text}</span>
                        {correct ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
                          : selected ? <XCircle className="h-4 w-4 shrink-0 text-red" /> : null}
                      </div>
                    );
                  })}
                </div>
                {answer?.explanation && <p className="rounded-lg bg-soft-blue p-3 text-sm text-slate-700">Penjelasan: {answer.explanation}</p>}
              </Card>
            );
          })}
        </section>
        <div className="flex items-center gap-2 text-xs text-slate-500"><Award className="h-4 w-4" /> Nilai dan kunci jawaban diambil setelah penilaian server berhasil.</div>
      </div>
    </main>
  );
};
