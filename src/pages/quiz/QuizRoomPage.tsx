import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock, Flag, X } from 'lucide-react';
import { Avatar, Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { QuizSession, saveQuizAnswer, startQuizSession, submitQuizAnswers } from '../../services/quizService';

export const QuizRoomPage: React.FC = () => {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    void startQuizSession(quizId)
      .then((started) => {
        if (!active) return;
        setSession(started);
        setAnswers(started.answers);
        setFlagged(started.flagged);
        setTimeLeft(started.remainingSeconds);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Kuis gagal dimuat.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [quizId]);

  const submit = useCallback(async () => {
    if (!session || submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      await submitQuizAnswers(session, answers);
      navigate(`/quiz/${quizId}/result`, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Jawaban gagal dikirim.');
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }, [answers, navigate, quizId, session]);

  useEffect(() => {
    if (!session || isSubmitting) return;
    const timer = window.setInterval(() => {
      setTimeLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          void submit();
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSubmitting, session, submit]);

  const selectedQuestion = session?.quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const changeAnswer = async (label: string | null) => {
    if (!session || !selectedQuestion || isSubmitting) return;
    const nextAnswers = { ...answers };
    if (label === null) delete nextAnswers[selectedQuestion.id];
    else nextAnswers[selectedQuestion.id] = label;
    setAnswers(nextAnswers);
    try {
      await saveQuizAnswer(session, selectedQuestion.id, label, Boolean(flagged[selectedQuestion.id]));
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Jawaban gagal disimpan.');
    }
  };

  const toggleFlag = async () => {
    if (!session || !selectedQuestion || isSubmitting) return;
    const nextFlagged = !flagged[selectedQuestion.id];
    setFlagged((current) => ({ ...current, [selectedQuestion.id]: nextFlagged }));
    try {
      await saveQuizAnswer(session, selectedQuestion.id, answers[selectedQuestion.id] ?? null, nextFlagged);
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Tanda tinjau gagal disimpan.');
    }
  };

  if (isLoading) return <Card className="m-8 p-10 text-center text-sm text-slate-500">Memuat kuis dan percobaan...</Card>;
  if (!session || !selectedQuestion) {
    return (
      <Card className="mx-auto my-12 max-w-xl p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red" />
        <p role="alert" className="mt-3 text-sm text-red">{error || 'Kuis tidak tersedia.'}</p>
        <Button className="mt-5" variant="navy" onClick={() => navigate(-1)}>Kembali</Button>
      </Card>
    );
  }

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <main className="min-h-screen bg-app px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/student')} aria-label="Keluar dari kuis"><X className="h-4 w-4" /></Button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{session.quiz.courseTitle} · {session.quiz.moduleTitle}</p>
              <h1 className="text-lg font-extrabold text-text-heading">{session.quiz.title}</h1>
            </div>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-extrabold ${timeLeft < 60 ? 'text-red' : 'text-orange'}`}>
            <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
          </div>
        </header>

        {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <Card className="p-5 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-blue">Pertanyaan {currentIndex + 1} dari {session.quiz.questions.length}</p>
                <h2 className="mt-1 text-xl font-bold text-text-heading">{selectedQuestion.topic}</h2>
              </div>
              <Button variant={flagged[selectedQuestion.id] ? 'orange' : 'outline'} size="sm" onClick={toggleFlag}>
                <Flag className="mr-2 h-4 w-4" /> {flagged[selectedQuestion.id] ? 'Ditandai' : 'Tandai'}
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-800">{selectedQuestion.question}</p>
            {selectedQuestion.codeSnippet && (
              <pre className="my-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-emerald-300"><code>{selectedQuestion.codeSnippet.code}</code></pre>
            )}
            <div className="mt-6 space-y-3">
              {selectedQuestion.options.map((option) => (
                <button key={option.id} type="button" onClick={() => void changeAnswer(option.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${
                    answers[selectedQuestion.id] === option.id ? 'border-blue bg-soft-blue text-navy' : 'border-border hover:bg-slate-50'
                  }`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold">{option.id}</span>
                  <span className="flex-1">{option.text}</span>
                  {answers[selectedQuestion.id] === option.id && <Check className="h-4 w-4 text-blue" />}
                </button>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>Sebelumnya</Button>
              <Button variant="outline" onClick={() => void changeAnswer(null)}>Hapus pilihan</Button>
              {currentIndex < session.quiz.questions.length - 1
                ? <Button variant="navy" onClick={() => setCurrentIndex((index) => index + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>Berikutnya</Button>
                : <Button variant="orange" disabled={isSubmitting} onClick={() => setConfirmSubmit(true)}>Kumpulkan kuis</Button>}
            </div>
          </Card>

          <Card className="h-fit p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-text-heading">Navigasi soal</h2>
              {user && <Avatar name={user.name} size="xs" />}
            </div>
            <p className="mb-4 text-xs text-slate-500">{answeredCount} dari {session.quiz.questions.length} dijawab</p>
            <div className="grid grid-cols-5 gap-2">
              {session.quiz.questions.map((question, index) => (
                <button key={question.id} type="button" onClick={() => setCurrentIndex(index)}
                  className={`relative h-10 rounded-lg border text-sm font-bold ${
                    currentIndex === index ? 'border-blue bg-blue text-white' :
                    answers[question.id] ? 'border-green/30 bg-green-tint text-green' : 'border-border bg-white text-slate-600'
                  }`}>
                  {index + 1}
                  {flagged[question.id] && <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-orange text-orange" />}
                </button>
              ))}
            </div>
            <Button className="mt-5 w-full" variant="orange" disabled={isSubmitting} onClick={() => setConfirmSubmit(true)}>
              Kumpulkan ({answeredCount}/{session.quiz.questions.length})
            </Button>
          </Card>
        </div>
      </div>

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg">
            <h2 className="text-lg font-bold text-text-heading">Kumpulkan jawaban?</h2>
            <p className="mt-2 text-sm text-slate-600">
              {answeredCount < session.quiz.questions.length
                ? `Masih ada ${session.quiz.questions.length - answeredCount} soal belum dijawab. `
                : ''}Nilai dihitung oleh server dan jawaban tidak dapat diubah setelah dikirim.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmSubmit(false)}>Lanjut mengerjakan</Button>
              <Button variant="orange" disabled={isSubmitting} onClick={() => void submit()}>
                {isSubmitting ? 'Mengirim...' : 'Kirim jawaban'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
