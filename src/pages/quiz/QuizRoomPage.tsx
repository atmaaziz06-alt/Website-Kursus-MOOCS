import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Card, Button, ProgressBar, Avatar } from '../../components/ui';
import { mockQuizReactHooks } from '../../data/mockData';
import { getUserAvatar } from '../../config/media';
import { submitQuizAnswers } from '../../services/quizService';

export const QuizRoomPage: React.FC = () => {
  const { quizId = 'quiz-react-hooks' } = useParams();
  const navigate = useNavigate();

  const quiz = mockQuizReactHooks;
  const totalQuestions = quiz.questions.length; // 10

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(2); // Question 03 of 10 initially as per spec
  const [answers, setAnswers] = useState<Record<number, string>>({
    1: 'A',
    2: 'A', // Q2 will intentionally be wrong (correct is B)
  });
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(870); // 14:30 left initially as per spec
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewMode, setViewMode] = useState<'questions' | 'grid'>('questions');

  const currentQ = quiz.questions[currentIdx];
  const userAvatar = getUserAvatar('dian-paramitha');

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }));
  };

  const handleClearSelection = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }
    const timeTaken = 1200 - timeLeft;
    await submitQuizAnswers(quizId, answers, timeTaken);
    navigate(`/quiz/${quizId}/result`);
  };

  return (
    <div className="min-h-screen bg-app flex flex-col justify-between">
      {/* 1. LOCKED-DOWN HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-border h-16 px-4 sm:px-8 flex items-center justify-between shadow-sm">
        {/* Left: Exit button + course & quiz titles */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/student')}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors"
            title="Keluar dari Ujian"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
              BOOTCAMP PENGEMBANGAN WEB 2025
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-text-heading block leading-tight">
              Kuis 1: Dasar React & Frontend
            </span>
          </div>
        </div>

        {/* Center: Tabs Questions (active) / Review Grid */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold border border-border">
          <button
            type="button"
            onClick={() => setViewMode('questions')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              viewMode === 'questions' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
            }`}
          >
            Pertanyaan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
            }`}
          >
            Ringkasan Soal
          </button>
        </div>

        {/* Right: User name + Student ID + Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-text-heading block leading-tight">
              Dian Paramitha
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">
              ID Peserta #84920
            </span>
          </div>
          <Avatar src={userAvatar} name="Dian Paramitha" size="sm" />
        </div>
      </header>

      {/* 2. BODY CONTAINER */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-8">
        {/* Breadcrumb line & Big Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Bootcamp Pengembangan Web 2025 • Evaluasi Komprehensif Modul 4
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              Kuis Pengembangan Web 1: Arsitektur React & Frontend
            </h1>
          </div>

          {/* Right: Timer card & Flag for review button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white rounded-2xl border border-border shadow-soft px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-tint flex items-center justify-center text-orange shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                  SISA WAKTU
                </span>
                <span className="text-lg font-extrabold text-orange font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <Button
              variant={flagged[currentQ.id] ? 'orange' : 'outline'}
              size="md"
              onClick={handleToggleFlag}
              leftIcon={<Flag className={`w-4 h-4 ${flagged[currentQ.id] ? 'fill-white' : ''}`} />}
            >
              {flagged[currentQ.id] ? 'Ditandai' : 'Tandai untuk Ditinjau'}
            </Button>
          </div>
        </div>

        {/* Main Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Question Card */}
          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-8">
              {/* Question Header & Chips */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-soft-blue text-blue text-xs font-bold uppercase">
                    Pertanyaan {String(currentQ.id).padStart(2, '0')} dari 10
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    {currentQ.topic}
                  </span>
                </div>
                <span className="text-xs font-bold text-navy px-2.5 py-1 rounded-lg bg-navy/10">
                  {currentQ.points} Poin
                </span>
              </div>

              {/* Segmented Progress Bar (10 segments) */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1.5">
                  <span>Progres: {Math.round((answeredCount / totalQuestions) * 100)}% terjawab</span>
                  <span className="text-navy font-bold">Target nilai kelulusan: 80%</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5 h-2">
                  {quiz.questions.map((q) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = q.id === currentQ.id;
                    return (
                      <div
                        key={q.id}
                        className={`rounded-full transition-all ${
                          isAnswered
                            ? 'bg-blue'
                            : isCurrent
                            ? 'bg-orange'
                            : 'bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-bold text-text-heading mb-4 leading-snug">
                {currentQ.question}
              </h2>

              {/* Dark Code Block if present */}
              {currentQ.codeSnippet && (
                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-200 mb-6 shadow-inner">
                  <div className="px-4 py-2 bg-slate-950 flex items-center justify-between text-xs border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 text-slate-400 font-mono text-[11px]">
                        {currentQ.codeSnippet.title}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {currentQ.codeSnippet.language} (ES6+)
                    </span>
                  </div>
                  <pre className="p-4 text-xs sm:text-sm font-mono text-emerald-400 overflow-x-auto">
                    <code>{currentQ.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* Four Option Cards A-D */}
              <div className="space-y-3 mb-8">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                        isSelected
                          ? 'border-blue bg-soft-blue/40 ring-1 ring-blue text-navy shadow-sm'
                          : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 pr-4 flex-1">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-blue text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className={`text-xs sm:text-sm ${isSelected ? 'font-bold text-navy' : 'text-slate-700'}`}>
                          {opt.text}
                        </span>
                      </div>

                      {/* Blue check circle on the right if selected */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-blue text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer navigation buttons */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Pertanyaan Sebelumnya
                  </Button>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs font-semibold text-slate-500 hover:text-red px-3 py-2 transition-colors"
                  >
                    Hapus Pilihan
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {currentIdx < totalQuestions - 1 ? (
                    <Button
                      variant="navy"
                      size="md"
                      onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Pertanyaan Berikutnya
                    </Button>
                  ) : null}

                  <Button
                    variant="orange"
                    size="md"
                    onClick={handleSubmit}
                  >
                    Kumpulkan Kuis
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Exam Matrix / Question Navigator */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="text-sm font-bold text-text-heading">
                  NAVIGATOR UJIAN
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-soft-blue text-blue text-xs font-bold">
                  Total 10
                </span>
              </div>

              {/* Legend: Answered, Current Active, Unanswered, Flagged */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue flex items-center justify-center text-white text-[8px]">
                    ✓
                  </div>
                  <span>Terjawab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border-2 border-orange bg-white" />
                  <span>Sedang Dibuka</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200" />
                  <span>Belum Dijawab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200 relative flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange absolute" />
                  </div>
                  <span>Ditandai</span>
                </div>
              </div>

              {/* 5x2 Grid of Number Buttons */}
              <div className="grid grid-cols-5 gap-2.5 mb-6">
                {quiz.questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = idx === currentIdx;
                  const isFlagged = !!flagged[q.id];

                  let style = 'bg-slate-100 text-slate-600 border border-slate-200';
                  if (isAnswered) {
                    style = 'bg-blue text-white shadow-sm font-bold';
                  }
                  if (isCurrent) {
                    style = `${style} ring-2 ring-orange border-orange`;
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-11 rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition-all ${style}`}
                    >
                      <span>{q.id}</span>
                      {isAnswered && <span className="text-[9px] leading-none mt-0.5">✓</span>}
                      {isFlagged && (
                        <span className="w-2 h-2 rounded-full bg-orange absolute -top-1 -right-1 ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Session Progress bar */}
              <div className="space-y-1.5 mb-6 pb-4 border-b border-border">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Progres Sesi {Math.round((answeredCount / totalQuestions) * 100)}% Selesai</span>
                </div>
                <ProgressBar progress={(answeredCount / totalQuestions) * 100} color="blue" size="xs" />
                <div className="text-[11px] text-slate-400">
                  {answeredCount} Terjawab / {totalQuestions - answeredCount} Tersisa
                </div>
              </div>

              {/* Orange Full-Width Button */}
              <Button
                variant="orange"
                size="md"
                fullWidth
                onClick={handleSubmit}
                className="shadow-md"
              >
                Akhiri & Selesaikan Ujian
              </Button>
            </Card>

            {/* Bottom info notice */}
            <div className="p-4 rounded-xl bg-soft-blue/40 border border-blue/20 flex items-start gap-2.5 text-xs text-slate-600">
              <Info className="w-4 h-4 text-blue shrink-0 mt-0.5" />
              <span>
                Jawabanmu disimpan otomatis setiap kali pilihan berubah. Kamu dapat kembali dan mengubah jawaban sebelum mengumpulkan kuis.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. CONFIRMATION MODAL IF UNANSWERED */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-soft-lg animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-heading mb-2">
              Masih Ada Pertanyaan yang Belum Dijawab
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Masih ada <strong>{totalQuestions - answeredCount} pertanyaan yang belum dijawab</strong>. Yakin ingin mengakhiri dan mengumpulkan ujian sekarang?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Kembali ke Ujian
              </Button>
              <Button
                variant="orange"
                size="sm"
                onClick={async () => {
                  setShowConfirmModal(false);
                  const timeTaken = 1200 - timeLeft;
                  await submitQuizAnswers(quizId, answers, timeTaken);
                  navigate(`/quiz/${quizId}/result`);
                }}
              >
                Ya, Kumpulkan Sekarang
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className="py-4 border-t border-border bg-white text-center text-xs text-slate-400">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Lingkungan Ujian Aman LMS EduSpace</span>
          <span>© 2025 EduSpace. Semua aktivitas tercatat.</span>
        </div>
      </footer>
    </div>
  );
};
