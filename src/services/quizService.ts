import { QuizData, QuizQuestion, QuizSubmission } from '../types';
import { getErrorMessage } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';

export interface QuizSession {
  quiz: QuizData;
  attemptId: string;
  startedAt: string;
  remainingSeconds: number;
  answers: Record<number, string>;
  flagged: Record<number, boolean>;
}

export interface QuizResult {
  quiz: QuizData;
  submission: QuizSubmission;
  review: Array<{
    questionId: number;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

const getQuizData = async (quizId: string): Promise<QuizData> => {
  const client = requireSupabase();
  const { data: quiz, error: quizError } = await client.from('quizzes')
    .select('id, course_id, module_id, title, time_limit_minutes, passing_score, is_published')
    .eq('id', quizId).maybeSingle();
  if (quizError) throw new Error(getErrorMessage(quizError));
  if (!quiz) throw new Error('Kuis tidak ditemukan atau belum diterbitkan.');

  const [courseResult, moduleResult, questionsResult] = await Promise.all([
    client.from('courses').select('slug, title').eq('id', quiz.course_id).maybeSingle(),
    quiz.module_id
      ? client.from('modules').select('title').eq('id', quiz.module_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    client.from('questions').select('id, topic, text, code_snippet, position, points')
      .eq('quiz_id', quiz.id).order('position'),
  ]);
  if (courseResult.error) throw new Error(getErrorMessage(courseResult.error));
  if (moduleResult.error) throw new Error(getErrorMessage(moduleResult.error));
  if (questionsResult.error) throw new Error(getErrorMessage(questionsResult.error));
  if (!courseResult.data) throw new Error('Kursus untuk kuis ini tidak ditemukan.');
  if (!questionsResult.data?.length) throw new Error('Kuis belum memiliki soal.');

  const questionIds = questionsResult.data.map((question) => question.id);
  const { data: options, error: optionsError } = await client.from('question_options')
    .select('id, question_id, label, text').in('question_id', questionIds).order('label');
  if (optionsError) throw new Error(getErrorMessage(optionsError));

  const questions: QuizQuestion[] = questionsResult.data.map((question, index) => {
    const snippet = question.code_snippet;
    let codeSnippet: QuizQuestion['codeSnippet'];
    if (snippet && typeof snippet === 'object' && !Array.isArray(snippet)) {
      const codeData = snippet as Record<string, unknown>;
      if (typeof codeData.code === 'string') {
        codeSnippet = {
          language: typeof codeData.language === 'string' ? codeData.language : 'text',
          title: typeof codeData.title === 'string' ? codeData.title : 'Kode',
          code: codeData.code,
        };
      }
    }
    return {
      id: index + 1,
      databaseId: question.id,
      topic: question.topic,
      points: Number(question.points),
      question: question.text,
      ...(codeSnippet ? { codeSnippet } : {}),
      options: (options ?? [])
        .filter((option) => option.question_id === question.id)
        .map((option) => ({ id: option.label, databaseId: option.id, text: option.text })),
      correctOptionId: '',
      explanation: '',
    };
  });

  return {
    id: quiz.id,
    courseSlug: courseResult.data.slug,
    courseTitle: courseResult.data.title,
    moduleTitle: moduleResult.data?.title ?? 'Kuis',
    title: quiz.title,
    timeLimitMinutes: quiz.time_limit_minutes,
    passingScorePercent: Number(quiz.passing_score),
    questions,
  };
};

export const startQuizSession = async (quizId: string): Promise<QuizSession> => {
  const client = requireSupabase();
  const { data: attempt, error: attemptError } = await client.rpc('start_quiz_attempt', { p_quiz_id: quizId });
  if (attemptError) throw new Error(getErrorMessage(attemptError));
  const quiz = await getQuizData(quizId);
  const { data: savedAnswers, error: answersError } = await client.from('attempt_answers')
    .select('question_id, selected_option_id, flagged').eq('attempt_id', attempt.id);
  if (answersError) throw new Error(getErrorMessage(answersError));

  const answers: Record<number, string> = {};
  const flagged: Record<number, boolean> = {};
  quiz.questions.forEach((question) => {
    const saved = (savedAnswers ?? []).find((answer) => answer.question_id === question.databaseId);
    const option = question.options.find((item) => item.databaseId === saved?.selected_option_id);
    if (option) answers[question.id] = option.id;
    if (saved?.flagged) flagged[question.id] = true;
  });
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000));
  const remainingSeconds = Math.max(0, quiz.timeLimitMinutes * 60 - elapsedSeconds);
  return { quiz, attemptId: attempt.id, startedAt: attempt.started_at, remainingSeconds, answers, flagged };
};

export const saveQuizAnswer = async (
  session: QuizSession,
  questionNumber: number,
  selectedLabel: string | null,
  isFlagged: boolean,
) => {
  const question = session.quiz.questions.find((item) => item.id === questionNumber);
  if (!question?.databaseId) throw new Error('Soal kuis tidak valid.');
  const option = question.options.find((item) => item.id === selectedLabel);
  const { error } = await requireSupabase().rpc('save_quiz_answer', {
    p_attempt_id: session.attemptId,
    p_question_id: question.databaseId,
    p_option_id: option?.databaseId ?? null,
    p_flagged: isFlagged,
  });
  if (error) throw new Error(getErrorMessage(error));
};

export const submitQuizAnswers = async (
  session: QuizSession,
  answers: Record<number, string>,
): Promise<void> => {
  const p_answers = session.quiz.questions.flatMap((question) => {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    return question.databaseId && selected?.databaseId
      ? [{ question_id: question.databaseId, option_id: selected.databaseId }]
      : [];
  });
  const { error } = await requireSupabase().rpc('submit_quiz_attempt', {
    p_attempt_id: session.attemptId,
    p_answers,
  });
  if (error) throw new Error(getErrorMessage(error));
};

export const getLatestQuizSubmission = async (quizId: string, attemptId?: string): Promise<QuizResult | null> => {
  const client = requireSupabase();
  let attemptsQuery = client.from('quiz_attempts')
    .select('id, score, passed, submitted_at, time_taken_seconds')
    .eq('quiz_id', quizId).eq('status', 'submitted');
  if (attemptId) attemptsQuery = attemptsQuery.eq('id', attemptId);
  const { data: attempts, error: attemptsError } = await attemptsQuery
    .order('attempt_no', { ascending: false }).limit(1);
  if (attemptsError) throw new Error(getErrorMessage(attemptsError));
  const attempt = attempts?.[0];
  if (!attempt) return null;

  const [quiz, answerResult, reviewResult] = await Promise.all([
    getQuizData(quizId),
    client.from('attempt_answers').select('question_id, selected_option_id')
      .eq('attempt_id', attempt.id),
    client.rpc('get_attempt_review', { p_attempt_id: attempt.id }),
  ]);
  if (answerResult.error) throw new Error(getErrorMessage(answerResult.error));
  if (reviewResult.error) throw new Error(getErrorMessage(reviewResult.error));

  const answers: Record<number, string> = {};
  quiz.questions.forEach((question) => {
    const answer = (answerResult.data ?? []).find((item) => item.question_id === question.databaseId);
    const option = question.options.find((item) => item.databaseId === answer?.selected_option_id);
    if (option) answers[question.id] = option.id;
  });
  const review = (reviewResult.data ?? []).flatMap((item) => {
    const question = quiz.questions.find((entry) => entry.databaseId === item.question_id);
    const selected = question?.options.find((option) => option.databaseId === item.selected_option_id);
    const correct = question?.options.find((option) => option.databaseId === item.correct_option_id);
    if (!question || !correct) return [];
    return [{
      questionId: question.id,
      selectedOptionId: selected?.id ?? '',
      correctOptionId: correct.id,
      isCorrect: item.is_correct ?? false,
      explanation: item.explanation,
    }];
  });
  const scorePercent = Number(attempt.score ?? 0);

  return {
    quiz,
    submission: {
      quizId,
      answers,
      score: scorePercent,
      totalPoints: 100,
      scorePercent,
      passed: attempt.passed ?? false,
      timeTakenSeconds: attempt.time_taken_seconds ?? 0,
      submittedAt: attempt.submitted_at ?? new Date().toISOString(),
    },
    review,
  };
};
