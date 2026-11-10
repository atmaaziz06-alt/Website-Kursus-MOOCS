import { QuizData, QuizSubmission } from '../types';
import { mockQuizReactHooks } from '../data/mockData';

export const getQuizById = async (quizId: string): Promise<QuizData | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (quizId === 'quiz-react-hooks' || quizId === 'quiz-mod-1' || quizId === '1') {
    return mockQuizReactHooks;
  }
  return mockQuizReactHooks;
};

export const submitQuizAnswers = async (
  quizId: string,
  answers: Record<number, string>,
  timeTakenSeconds: number
): Promise<QuizSubmission> => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const quiz = mockQuizReactHooks;
  let correctCount = 0;
  const totalPoints = quiz.questions.length * 10;

  quiz.questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionId) {
      correctCount++;
    }
  });

  const score = correctCount * 10;
  const scorePercent = (score / totalPoints) * 100;
  const passed = scorePercent >= quiz.passingScorePercent;

  const result: QuizSubmission = {
    quizId,
    answers,
    score,
    totalPoints,
    scorePercent,
    passed,
    timeTakenSeconds,
    submittedAt: new Date().toISOString(),
  };

  // Cache in localStorage for persistence
  try {
    localStorage.setItem(`quiz_result_${quizId}`, JSON.stringify(result));
  } catch (e) {
    console.error('Failed to save quiz result', e);
  }

  return result;
};

export const getLatestQuizSubmission = (quizId: string): QuizSubmission | null => {
  try {
    const raw = localStorage.getItem(`quiz_result_${quizId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Return default 80% passing result if not yet taken
  return {
    quizId,
    answers: { 1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'A' },
    score: 80,
    totalPoints: 100,
    scorePercent: 80,
    passed: true,
    timeTakenSeconds: 750, // 12 mins 30 secs
    submittedAt: '2025-05-28T14:42:00.000Z',
  };
};

