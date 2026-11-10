import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Share2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge, ProgressBar } from '../../components/ui';
import { mockQuizReactHooks } from '../../data/mockData';
import { getLatestQuizSubmission } from '../../services/quizService';
import { QuizSubmission } from '../../types';

export const QuizResultPage: React.FC = () => {
  const { quizId = 'quiz-react-hooks' } = useParams();
  const navigate = useNavigate();

  const quiz = mockQuizReactHooks;
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandGroup5to10, setExpandGroup5to10] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const sub = getLatestQuizSubmission(quizId);
    setSubmission(sub);
  }, [quizId]);

  if (!submission) {
    return <div className="p-12 text-center text-slate-500">Memuat laporan evaluasi...</div>;
  }

  const questionStatuses = quiz.questions.map((question) => ({
    id: question.id,
    userChoice: submission.answers[question.id] ?? '',
    correctChoice: question.correctOptionId,
    correct: submission.answers[question.id] === question.correctOptionId,
  }));
  const correctCount = questionStatuses.filter((status) => status.correct).length;
  const incorrectCount = questionStatuses.length - correctCount;
  const firstFourQuestions = quiz.questions.slice(0, 4);
  const lastSixQuestions = quiz.questions.slice(4, 10);
  const filteredLastSix = lastSixQuestions.filter((question) => {
    const status = questionStatuses.find((item) => item.id === question.id);
    return filterTab === 'all' || (filterTab === 'correct' ? status?.correct : !status?.correct);
  });
  const correctLastSix = lastSixQuestions.filter((question) => questionStatuses.find((status) => status.id === question.id)?.correct).length;
  const timeTaken = `${String(Math.floor(submission.timeTakenSeconds / 60)).padStart(2, '0')}:${String(submission.timeTakenSeconds % 60).padStart(2, '0')}`;
  const submittedDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(submission.submittedAt));

  return (
    <div className="min-h-screen bg-app pb-16">
      {/* Header */}
      <header className="bg-white border-b border-border h-16 px-4 sm:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/student"
            className="text-xs font-bold text-navy hover:text-blue flex items-center gap-1.5"
          >
            ← Kembali ke Dasbor
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs sm:text-sm font-extrabold text-text-heading truncate">
            Kuis 1: Dasar React & Frontend
          </span>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Breadcrumb line */}
        <nav className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
          <Link to="/courses" className="hover:text-navy">Kursus</Link>
          <span>/</span>
          <Link to="/courses/web-development-bootcamp-2025" className="hover:text-navy">
            Bootcamp Pengembangan Web 2025
          </Link>
          <span>/</span>
          <span>Modul 4: Arsitektur React & Frontend</span>
          <span>/</span>
          <span className="text-navy font-bold">Hasil Kuis 1</span>
        </nav>

        {/* 1. SUMMARY CARD */}
        <Card className="p-8 sm:p-10 shadow-soft-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-soft-blue text-blue text-[11px] font-bold uppercase tracking-wider">
                  LAPORAN EVALUASI
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Hasil percobaan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
                Evaluasi Kuis & Ringkasan Performa
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Diselesaikan pada {submittedDate} • {quiz.title}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Laporan PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setActionMessage('Tautan hasil kuis berhasil disalin.');
                  } catch (error) {
                    console.error('Gagal menyalin tautan hasil kuis', error);
                    setActionMessage('Tautan tidak dapat disalin. Salin alamat halaman dari bilah alamat browser.');
                  }
                }}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Bagikan Hasil
              </Button>
            </div>
          </div>
          {actionMessage && <p role="status" className="mb-4 text-xs font-semibold text-blue">{actionMessage}</p>}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-border mb-8">
            {/* Left: Big Circular Score 80 /100 */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-border">
              <div className="w-32 h-32 rounded-full border-8 border-green flex flex-col items-center justify-center bg-white shadow-soft mb-3">
                <span className="text-3xl font-extrabold text-text-heading leading-none">{submission.scorePercent}</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ 100</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                NILAI AKHIR • Akurasi {submission.scorePercent}%
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-tint text-green text-xs font-bold border border-green/20">
                {submission.passed ? 'KRITERIA TERPENUHI: LULUS' : 'BELUM LULUS'} • Batas {quiz.passingScorePercent}%
              </span>
            </div>

            {/* Right: Feedback & Breakdown Metrics */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-text-heading mb-1">
                  Kerja bagus, Dian!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Hasil evaluasi React 18 Hooks berdasarkan jawaban yang kamu kirim. Nilai: <strong className="text-navy">{submission.passed ? 'Lulus' : 'Perlu Mengulang'}</strong>.
                </p>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-green-tint border border-green/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green block">
                    Benar
                  </span>
                  <div className="text-lg font-extrabold text-green mt-0.5">{correctCount} Pertanyaan</div>
                  <span className="text-[11px] text-green-800 font-semibold">+{submission.score} poin diperoleh</span>
                </div>

                <div className="p-3.5 rounded-xl bg-red-tint border border-red/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red block">
                    Salah
                  </span>
                  <div className="text-lg font-extrabold text-red mt-0.5">{incorrectCount} Pertanyaan</div>
                  <span className="text-[11px] text-red-800 font-semibold">{Math.max(0, submission.totalPoints - submission.score)} poin belum diperoleh</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Waktu Pengerjaan
                  </span>
                  <div className="text-lg font-extrabold text-navy mt-0.5">{timeTaken} / {quiz.timeLimitMinutes}:00</div>
                  <span className="text-[11px] font-bold text-orange">Waktu pengerjaan</span>
                </div>
              </div>

              {/* Cohort average vs passing */}
              <div className="text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2 pt-2">
                <span>Batas Lulus: <strong>{quiz.passingScorePercent}%</strong></span>
                <span>Diselesaikan: <strong>{submittedDate}</strong></span>
                <span>Waktu Maksimal: <strong>{quiz.timeLimitMinutes} Menit</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/quiz/quiz-react-hooks')}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Ulangi Kuis (tersisa 2 kali)
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/courses/web-development-bootcamp-2025')}
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                Modul Kursus
              </Button>
              <Button
                variant="navy"
                size="md"
                onClick={() => navigate('/learn/web-development-bootcamp-2025/les-16')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Berikutnya: Pelajaran 16 (Context API)
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. QUESTION-BY-QUESTION REVIEW */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-text-heading">
                Tinjauan Setiap Pertanyaan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tinjau jawabanmu beserta penjelasan pengajar dan klarifikasi konsep
              </p>
            </div>

            {/* Filter Tabs: All (10) / Correct (8) / Incorrect (2) */}
            <div className="flex items-center p-1 bg-white rounded-xl border border-border shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  filterTab === 'all' ? 'bg-navy text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Semua (10)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('correct')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  filterTab === 'correct' ? 'bg-navy text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Benar (8)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('incorrect')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  filterTab === 'incorrect' ? 'bg-navy text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Salah (2)
              </button>
            </div>
          </div>

          {/* Questions 1-4 List */}
          <div className="space-y-6">
            {firstFourQuestions.map((q) => {
              const status = questionStatuses.find((s) => s.id === q.id)!;
              const isCorrect = status.correct;

              if (filterTab === 'correct' && !isCorrect) return null;
              if (filterTab === 'incorrect' && isCorrect) return null;

              return (
                <Card key={q.id} className="p-6 sm:p-8">
                  {/* Top line: Number, topic, status pill */}
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-extrabold text-slate-400 uppercase">
                        Pertanyaan {String(q.id).padStart(2, '0')}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-600">{q.topic}</span>
                    </div>

                    <Badge variant={isCorrect ? 'active' : 'in-review'} size="xs">
                      {isCorrect ? 'Benar (+10 poin)' : 'Salah (0 poin)'}
                    </Badge>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-base font-bold text-text-heading mb-4 leading-snug">
                    {q.question}
                  </h3>

                  {/* Code snippet if present */}
                  {q.codeSnippet && (
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-200 mb-4 p-3 text-xs font-mono text-emerald-400">
                      <code>{q.codeSnippet.code}</code>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2 mb-6">
                    {q.options.map((opt) => {
                      const isUserChoice = opt.id === status.userChoice;
                      const isTargetCorrect = opt.id === status.correctChoice;

                      let borderBg = 'border-border bg-slate-50/50 text-slate-700';
                      if (isTargetCorrect) {
                        borderBg = 'border-green bg-green-tint text-green-900 font-semibold';
                      } else if (isUserChoice && !isCorrect) {
                        borderBg = 'border-red bg-red-tint text-red-900 line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${borderBg}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold w-6">{opt.id}.</span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isTargetCorrect && (
                              <span className="px-2 py-0.5 rounded-full bg-green text-white text-[10px] font-extrabold uppercase">
                                Jawaban Benar
                              </span>
                            )}
                            {isUserChoice && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  isCorrect ? 'bg-green/20 text-green' : 'bg-red text-white'
                                }`}
                              >
                                Pilihanmu ({isCorrect ? 'Benar' : 'Salah'})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tinted note box: INSTRUCTOR NOTE / CONCEPT CLARIFICATION */}
                  <div className="p-4 rounded-xl bg-soft-blue/40 border border-blue/20 text-xs text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-navy mb-1 uppercase tracking-wider text-[10px]">
                      <AlertCircle className="w-3.5 h-3.5 text-blue" />
                      <span>CATATAN PENGAJAR / KLARIFIKASI KONSEP</span>
                    </div>
                    {q.explanation}
                  </div>
                </Card>
              );
            })}

            {/* Questions 5-10 Summary Row (Collapsed into one expandable row) */}
            {filteredLastSix.length > 0 && (
              <Card className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandGroup5to10(!expandGroup5to10)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-tint text-green flex items-center justify-center font-bold text-xs">
                      {correctLastSix}/{lastSixQuestions.length}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-heading">
                        Pertanyaan 5-10
                      </h4>
                      <span className="text-xs text-slate-500">
                        Nilai: {correctLastSix * 10}/{lastSixQuestions.length * 10} poin • Benar {correctLastSix}, salah {lastSixQuestions.length - correctLastSix}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-blue">
                      {expandGroup5to10 ? 'Sembunyikan Rincian' : `Tampilkan ${filteredLastSix.length} Pertanyaan`}
                    </span>
                    {expandGroup5to10 ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {expandGroup5to10 && (
                  <div className="border-t border-border p-6 space-y-6 bg-slate-50/50">
                    {filteredLastSix.map((q) => {
                      const status = questionStatuses.find((item) => item.id === q.id)!;
                      const selectedAnswer = q.options.find((option) => option.id === status.userChoice);
                      const correctAnswer = q.options.find((option) => option.id === status.correctChoice);
                      return (
                        <div key={q.id} className="p-4 rounded-xl bg-white border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400">
                              Pertanyaan {q.id}: {q.topic}
                            </span>
                            <span className={`text-xs font-bold ${status.correct ? 'text-green' : 'text-red'}`}>
                              {status.correct ? 'Benar (+10 poin)' : 'Salah (0 poin)'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-text-heading mb-2">{q.question}</p>
                          <p className="text-xs text-slate-600 mb-2">Jawabanmu: {selectedAnswer?.text ?? 'Tidak dijawab'}</p>
                          {!status.correct && <p className="text-xs text-green mb-2">Jawaban benar: {correctAnswer?.text}</p>}
                          <p className="text-xs text-slate-500 italic">{q.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
