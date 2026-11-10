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

  useEffect(() => {
    const sub = getLatestQuizSubmission(quizId);
    setSubmission(sub);
  }, [quizId]);

  if (!submission) {
    return <div className="p-12 text-center text-slate-500">Loading evaluation report...</div>;
  }

  // Pre-determined questions status to guarantee exact mock specification:
  // Q1 correct, Q2 incorrect, Q3 correct, Q4 incorrect, Q5-10 correct
  const questionStatuses = [
    { id: 1, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 2, correct: false, userChoice: 'A', correctChoice: 'B' },
    { id: 3, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 4, correct: false, userChoice: 'C', correctChoice: 'B' },
    { id: 5, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 6, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 7, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 8, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 9, correct: true, userChoice: 'A', correctChoice: 'A' },
    { id: 10, correct: true, userChoice: 'A', correctChoice: 'A' },
  ];

  const firstFourQuestions = quiz.questions.slice(0, 4);
  const lastSixQuestions = quiz.questions.slice(4, 10);

  return (
    <div className="min-h-screen bg-app pb-16">
      {/* Header */}
      <header className="bg-white border-b border-border h-16 px-4 sm:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/student"
            className="text-xs font-bold text-navy hover:text-blue flex items-center gap-1.5"
          >
            ← Return to Dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs sm:text-sm font-extrabold text-text-heading truncate">
            Quiz 1: React & Frontend Fundamentals
          </span>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Breadcrumb line */}
        <nav className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
          <Link to="/courses" className="hover:text-navy">Courses</Link>
          <span>/</span>
          <Link to="/courses/web-development-bootcamp-2025" className="hover:text-navy">
            Web Development Bootcamp 2025
          </Link>
          <span>/</span>
          <span>Module 4: React & Frontend Architecture</span>
          <span>/</span>
          <span className="text-navy font-bold">Quiz 1 Result</span>
        </nav>

        {/* 1. SUMMARY CARD */}
        <Card className="p-8 sm:p-10 shadow-soft-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-soft-blue text-blue text-[11px] font-bold uppercase tracking-wider">
                  EVALUATION REPORT
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Attempt #1 of 3</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
                Quiz Evaluation & Performance Summary
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Completed on May 28, 2025 • Standard Assessment Cohort 2025
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                PDF Report
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Share2 className="w-3.5 h-3.5" />}>
                Share Result
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-border mb-8">
            {/* Left: Big Circular Score 80 /100 */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-border">
              <div className="w-32 h-32 rounded-full border-8 border-green flex flex-col items-center justify-center bg-white shadow-soft mb-3">
                <span className="text-3xl font-extrabold text-text-heading leading-none">80</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ 100</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                FINAL SCORE • 80% Accuracy
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-tint text-green text-xs font-bold border border-green/20">
                CRITERIA MET: PASS ≥ 70%
              </span>
            </div>

            {/* Right: Feedback & Breakdown Metrics */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-text-heading mb-1">
                  Great job, Dian!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You have successfully demonstrated a strong command of React 18 hooks, rendering pipelines, and state encapsulation. Grade: <strong className="text-navy">B+ (Good Standing)</strong>.
                </p>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-green-tint border border-green/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green block">
                    Correct
                  </span>
                  <div className="text-lg font-extrabold text-green mt-0.5">8 Questions</div>
                  <span className="text-[11px] text-green-800 font-semibold">+80 pts earned</span>
                </div>

                <div className="p-3.5 rounded-xl bg-red-tint border border-red/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red block">
                    Incorrect
                  </span>
                  <div className="text-lg font-extrabold text-red mt-0.5">2 Questions</div>
                  <span className="text-[11px] text-red-800 font-semibold">0 pts</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Time Taken
                  </span>
                  <div className="text-lg font-extrabold text-navy mt-0.5">12:30 / 20:00</div>
                  <span className="text-[11px] font-bold text-orange">Efficient</span>
                </div>
              </div>

              {/* Cohort average vs passing */}
              <div className="text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2 pt-2">
                <span>Cohort Average: <strong>74.2%</strong> vs Passing: <strong>70%</strong></span>
                <span>Completed On: <strong>28 May, 14:42 WIB</strong></span>
                <span>Allocated: <strong>20 Mins</strong></span>
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
              Retake Quiz (2 left)
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/courses/web-development-bootcamp-2025')}
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                Course Modules
              </Button>
              <Button
                variant="navy"
                size="md"
                onClick={() => navigate('/learn/web-development-bootcamp-2025/les-16')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Lesson 16 (Context API)
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. QUESTION-BY-QUESTION REVIEW */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-text-heading">
                Question-by-Question Review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect your answers alongside instructor explanations and concept clarification notes
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
                All (10)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('correct')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  filterTab === 'correct' ? 'bg-navy text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Correct (8)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('incorrect')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  filterTab === 'incorrect' ? 'bg-navy text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Incorrect (2)
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
                        Question {String(q.id).padStart(2, '0')}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-600">{q.topic}</span>
                    </div>

                    <Badge variant={isCorrect ? 'active' : 'in-review'} size="xs">
                      {isCorrect ? 'Correct (+10 pts)' : 'Incorrect (0 pts)'}
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
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  isCorrect ? 'bg-green/20 text-green' : 'bg-red text-white'
                                }`}
                              >
                                Your Choice ({isCorrect ? 'Correct' : 'Incorrect'})
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
                      <span>INSTRUCTOR NOTE / CONCEPT CLARIFICATION</span>
                    </div>
                    {q.explanation}
                  </div>
                </Card>
              );
            })}

            {/* Questions 5-10 Summary Row (Collapsed into one expandable row) */}
            {filterTab !== 'incorrect' && (
              <Card className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandGroup5to10(!expandGroup5to10)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-tint text-green flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-heading">
                        Questions 5 to 10 (All Correct)
                      </h4>
                      <span className="text-xs text-slate-500">
                        Score: 60/60 pts • 100% Accuracy on Advanced Concepts
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-blue">
                      {expandGroup5to10 ? 'Hide Details' : 'Expand 6 Questions'}
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
                    {lastSixQuestions.map((q) => (
                      <div key={q.id} className="p-4 rounded-xl bg-white border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400">
                            Question {q.id}: {q.topic}
                          </span>
                          <span className="text-xs font-bold text-green">Correct (+10 pts)</span>
                        </div>
                        <p className="text-xs font-semibold text-text-heading mb-2">{q.question}</p>
                        <p className="text-xs text-slate-500 italic">{q.explanation}</p>
                      </div>
                    ))}
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

