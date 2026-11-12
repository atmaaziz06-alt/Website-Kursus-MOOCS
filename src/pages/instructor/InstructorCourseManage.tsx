import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, FileText, Pencil, Plus, Send, Trash2, Upload } from 'lucide-react';
import { Badge, Button, Card, Input, Select } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';
import { getVideoEmbedUrl, validateLessonFile } from '../../utils/lessonMedia';

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string | null;
  level: string;
  price: number;
  status: string;
  review_note: string | null;
  thumbnail_path: string | null;
};
type ModuleRow = { id: string; course_id: string; title: string; position: number };
type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'pdf' | 'lab' | 'text';
  duration_minutes: number;
  position: number;
};
type LessonContentRow = {
  lesson_id: string;
  content: string | null;
  video_url: string | null;
  file_path: string | null;
};
type QuizRow = {
  id: string;
  module_id: string | null;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
};
type QuestionRow = {
  id: string;
  quiz_id: string;
  topic: string;
  text: string;
  code_snippet: unknown;
  position: number;
  points: number;
};
type QuestionOptionRow = { id: string; question_id: string; label: 'A' | 'B' | 'C' | 'D'; text: string };
type QuestionKeyRow = { question_id: string; correct_option_id: string; explanation: string };
type CategoryRow = { id: string; name: string };
type EditorState = {
  course: CourseRow;
  modules: ModuleRow[];
  lessons: LessonRow[];
  lessonContents: LessonContentRow[];
  quizzes: QuizRow[];
  questions: QuestionRow[];
  questionOptions: QuestionOptionRow[];
  questionKeys: QuestionKeyRow[];
  categories: CategoryRow[];
};

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : getErrorMessage(error);

export const InstructorCourseManage: React.FC = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const navigationError = (location.state as { error?: unknown } | null)?.error;
  const [data, setData] = useState<EditorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(typeof navigationError === 'string' ? navigationError : '');
  const [notice, setNotice] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonModuleId, setLessonModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonRow['type']>('text');
  const [lessonDuration, setLessonDuration] = useState('10');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [editingLessonId, setEditingLessonId] = useState('');
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  const [editingLessonDuration, setEditingLessonDuration] = useState('10');
  const [editingLessonContent, setEditingLessonContent] = useState('');
  const [editingLessonVideoUrl, setEditingLessonVideoUrl] = useState('');
  const [editingLessonFile, setEditingLessonFile] = useState<File | null>(null);
  const [quizModuleId, setQuizModuleId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState('20');
  const [quizPassingScore, setQuizPassingScore] = useState('80');
  const [questionQuizId, setQuestionQuizId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionTopic, setQuestionTopic] = useState('');
  const [questionOptions, setQuestionOptions] = useState({ A: '', B: '', C: '', D: '' });
  const [correctLabel, setCorrectLabel] = useState('A');
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [questionPoints, setQuestionPoints] = useState('10');
  const [questionCode, setQuestionCode] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState('');

  const reload = useCallback(async () => {
    const client = requireSupabase();
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('id, title, slug, description, category_id, level, price, status, review_note, thumbnail_path')
      .eq('id', id)
      .maybeSingle();
    if (courseError) throw new Error(getErrorMessage(courseError));
    if (!course) throw new Error('Kursus tidak ditemukan atau kamu tidak memiliki akses.');

    const [modulesResult, lessonsResult, quizzesResult, categoriesResult] = await Promise.all([
      client.from('modules').select('id, course_id, title, position').eq('course_id', id).order('position'),
      client.from('lessons').select('id, module_id, title, type, duration_minutes, position').eq('course_id', id).order('position'),
      client.from('quizzes').select('id, module_id, title, time_limit_minutes, passing_score, max_attempts, is_published')
        .eq('course_id', id).order('created_at'),
      client.from('categories').select('id, name').order('name'),
    ]);
    if (modulesResult.error) throw new Error(getErrorMessage(modulesResult.error));
    if (lessonsResult.error) throw new Error(getErrorMessage(lessonsResult.error));
    if (quizzesResult.error) throw new Error(getErrorMessage(quizzesResult.error));
    if (categoriesResult.error) throw new Error(getErrorMessage(categoriesResult.error));
    const lessonIds = (lessonsResult.data ?? []).map((lesson) => lesson.id);
    const contentsResult = lessonIds.length
      ? await client.from('lesson_contents').select('lesson_id, content, video_url, file_path').in('lesson_id', lessonIds)
      : { data: [], error: null };
    if (contentsResult.error) throw new Error(getErrorMessage(contentsResult.error));
    const quizIds = (quizzesResult.data ?? []).map((quiz) => quiz.id);
    const questionsResult = quizIds.length
      ? await client.from('questions').select('id, quiz_id, topic, text, code_snippet, position, points')
        .in('quiz_id', quizIds).order('position')
      : { data: [], error: null };
    if (questionsResult.error) throw new Error(getErrorMessage(questionsResult.error));
    const questionIds = (questionsResult.data ?? []).map((question) => question.id);
    const [optionsResult, keysResult] = questionIds.length
      ? await Promise.all([
        client.from('question_options').select('id, question_id, label, text').in('question_id', questionIds),
        client.from('question_keys').select('question_id, correct_option_id, explanation').in('question_id', questionIds),
      ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (optionsResult.error) throw new Error(getErrorMessage(optionsResult.error));
    if (keysResult.error) throw new Error(getErrorMessage(keysResult.error));
    setData({
      course,
      modules: modulesResult.data ?? [],
      lessons: lessonsResult.data ?? [],
      lessonContents: contentsResult.data ?? [],
      quizzes: quizzesResult.data ?? [],
      questions: questionsResult.data ?? [],
      questionOptions: optionsResult.data ?? [],
      questionKeys: keysResult.data ?? [],
      categories: categoriesResult.data ?? [],
    });
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    if (typeof navigationError !== 'string') setError('');
    void reload()
      .catch((loadError: unknown) => setError(errorText(loadError)))
      .finally(() => setIsLoading(false));
  }, [navigationError, reload]);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      await action();
      await reload();
      setNotice(successMessage);
    } catch (actionError) {
      setError(errorText(actionError));
    } finally {
      setIsSaving(false);
    }
  };

  const saveCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data) return;
    const fields = new FormData(event.currentTarget);
    void runAction(async () => {
      const { error: saveError } = await requireSupabase().from('courses').update({
        title: String(fields.get('title')).trim(),
        description: String(fields.get('description')).trim(),
        category_id: String(fields.get('category_id')) || null,
        level: String(fields.get('level')),
        price: Number(fields.get('price')),
        original_price: Number(fields.get('price')),
      }).eq('id', id);
      if (saveError) throw new Error(getErrorMessage(saveError));
    }, 'Informasi kursus tersimpan.');
  };

  const uploadThumbnail = (file: File | null) => {
    if (!file || !data || !user) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Thumbnail harus berupa JPG, PNG, atau WebP dan maksimal 2 MB.');
      return;
    }
    void runAction(async () => {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${user.id}/${id}/${crypto.randomUUID()}-${safeName}`;
      const client = requireSupabase();
      const { error: uploadError } = await client.storage.from('course-thumbnails').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw new Error(getErrorMessage(uploadError));
      const { error: updateError } = await client.from('courses').update({ thumbnail_path: path }).eq('id', id);
      if (updateError) {
        const { error: removeError } = await client.storage.from('course-thumbnails').remove([path]);
        if (removeError) console.error('Thumbnail terunggah namun gagal dibersihkan setelah metadata gagal disimpan.', removeError);
        throw new Error(getErrorMessage(updateError));
      }
      if (data.course.thumbnail_path) {
        const { error: removeError } = await client.storage.from('course-thumbnails').remove([data.course.thumbnail_path]);
        if (removeError) throw new Error(`Thumbnail baru tersimpan, tetapi thumbnail lama gagal dihapus: ${getErrorMessage(removeError)}`);
      }
    }, 'Thumbnail tersimpan.');
  };

  const addModule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !moduleTitle.trim()) return;
    void runAction(async () => {
      const { error: insertError } = await requireSupabase().from('modules').insert({
        course_id: id,
        title: moduleTitle.trim(),
        position: data.modules.length,
      });
      if (insertError) throw new Error(getErrorMessage(insertError));
      setModuleTitle('');
    }, 'Modul ditambahkan.');
  };

  const deleteModule = (moduleId: string) => {
    if (!window.confirm('Hapus modul beserta materi dan kuis di dalamnya?')) return;
    void runAction(async () => {
      const { error: deleteError } = await requireSupabase().from('modules').delete().eq('id', moduleId);
      if (deleteError) throw new Error(getErrorMessage(deleteError));
    }, 'Modul dihapus.');
  };

  const renameModule = (module: ModuleRow) => {
    const title = window.prompt('Nama modul', module.title)?.trim();
    if (!title || title === module.title) return;
    void runAction(async () => {
      const { error: updateError } = await requireSupabase().from('modules')
        .update({ title }).eq('id', module.id);
      if (updateError) throw new Error(getErrorMessage(updateError));
    }, 'Nama modul diperbarui.');
  };

  const renameLesson = (lesson: LessonRow) => {
    const title = window.prompt('Judul materi', lesson.title)?.trim();
    if (!title || title === lesson.title) return;
    void runAction(async () => {
      const { error: updateError } = await requireSupabase().from('lessons')
        .update({ title }).eq('id', lesson.id);
      if (updateError) throw new Error(getErrorMessage(updateError));
    }, 'Judul materi diperbarui.');
  };

  const editLesson = (lesson: LessonRow) => {
    const content = data?.lessonContents.find((item) => item.lesson_id === lesson.id);
    setEditingLessonId(lesson.id);
    setEditingLessonTitle(lesson.title);
    setEditingLessonDuration(String(lesson.duration_minutes));
    setEditingLessonContent(content?.content ?? '');
    setEditingLessonVideoUrl(content?.video_url ?? '');
    setEditingLessonFile(null);
  };

  const saveLesson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !editingLessonId || !editingLessonTitle.trim()) return;
    const lesson = data.lessons.find((item) => item.id === editingLessonId);
    if (!lesson) return;
    if (lesson.type === 'pdf' && !data.lessonContents.find((item) => item.lesson_id === lesson.id)?.file_path && !editingLessonFile) {
      setError('Pilih berkas PDF untuk materi bertipe PDF.');
      return;
    }
    if (lesson.type === 'video' && !editingLessonVideoUrl.trim() &&
      !data.lessonContents.find((item) => item.lesson_id === lesson.id)?.file_path && !editingLessonFile) {
      setError('Isi URL video atau pilih berkas video.');
      return;
    }
    if (lesson.type === 'video' && editingLessonVideoUrl.trim() && !getVideoEmbedUrl(editingLessonVideoUrl.trim())) {
      setError('Gunakan tautan YouTube atau Vimeo yang valid, atau unggah video MP4/WebM.');
      return;
    }
    if (lesson.type === 'video' && editingLessonVideoUrl.trim() && editingLessonFile) {
      setError('Pilih tautan video atau berkas video, jangan keduanya sekaligus.');
      return;
    }
    if (editingLessonFile) {
      const fileError = validateLessonFile(editingLessonFile, lesson.type);
      if (fileError) {
        setError(fileError);
        return;
      }
    }
    if (lesson.type === 'pdf' && editingLessonFile && editingLessonFile.type !== 'application/pdf') {
      setError('Materi bertipe PDF hanya menerima berkas PDF.');
      return;
    }

    void runAction(async () => {
      const client = requireSupabase();
      const currentContent = data.lessonContents.find((item) => item.lesson_id === lesson.id);
      let newFilePath: string | null = null;
      if (editingLessonFile) {
        const safeName = editingLessonFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        newFilePath = `${id}/${lesson.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await client.storage.from('lesson-files').upload(newFilePath, editingLessonFile, {
          contentType: editingLessonFile.type,
          upsert: false,
        });
        if (uploadError) throw new Error(getErrorMessage(uploadError));
      }

      const { error: lessonError } = await client.from('lessons').update({
        title: editingLessonTitle.trim(),
        duration_minutes: Math.max(0, Number(editingLessonDuration) || 0),
      }).eq('id', lesson.id);
      if (lessonError) {
        if (newFilePath) {
          const { error: cleanupError } = await client.storage.from('lesson-files').remove([newFilePath]);
          if (cleanupError) console.error('Berkas materi baru tertinggal setelah perubahan materi gagal.', cleanupError);
        }
        throw new Error(getErrorMessage(lessonError));
      }

      const { error: contentError } = await client.from('lesson_contents').upsert({
        lesson_id: lesson.id,
        content: editingLessonContent.trim() || null,
        video_url: editingLessonVideoUrl.trim() || null,
        file_path: newFilePath ?? (lesson.type === 'video' && editingLessonVideoUrl.trim() ? null : currentContent?.file_path ?? null),
      }, { onConflict: 'lesson_id' });
      if (contentError) {
        const { error: rollbackError } = await client.from('lessons').update({
          title: lesson.title,
          duration_minutes: lesson.duration_minutes,
        }).eq('id', lesson.id);
        if (rollbackError) console.error('Metadata materi perlu dipulihkan setelah isi materi gagal disimpan.', rollbackError);
        if (newFilePath) {
          const { error: cleanupError } = await client.storage.from('lesson-files').remove([newFilePath]);
          if (cleanupError) console.error('Berkas materi baru tertinggal setelah isi materi gagal disimpan.', cleanupError);
        }
        throw new Error(getErrorMessage(contentError));
      }

      if (currentContent?.file_path && (newFilePath || (lesson.type === 'video' && editingLessonVideoUrl.trim()))) {
        const { error: cleanupError } = await client.storage.from('lesson-files').remove([currentContent.file_path]);
        if (cleanupError) throw new Error(`Materi tersimpan, tetapi berkas lama gagal dihapus: ${getErrorMessage(cleanupError)}`);
      }
      setEditingLessonId('');
      setEditingLessonFile(null);
    }, 'Materi diperbarui.');
  };

  const moveLesson = (lesson: LessonRow, direction: -1 | 1) => {
    if (!data) return;
    const moduleLessons = data.lessons.filter((item) => item.module_id === lesson.module_id);
    const currentIndex = moduleLessons.findIndex((item) => item.id === lesson.id);
    const swap = moduleLessons[currentIndex + direction];
    if (!swap) return;
    void runAction(async () => {
      const client = requireSupabase();
      const temporaryPosition = moduleLessons.length + 1;
      const first = await client.from('lessons').update({ position: temporaryPosition }).eq('id', lesson.id);
      if (first.error) throw new Error(getErrorMessage(first.error));
      const second = await client.from('lessons').update({ position: lesson.position }).eq('id', swap.id);
      if (second.error) throw new Error(getErrorMessage(second.error));
      const third = await client.from('lessons').update({ position: swap.position }).eq('id', lesson.id);
      if (third.error) throw new Error(getErrorMessage(third.error));
    }, 'Urutan materi diperbarui.');
  };

  const addLesson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !lessonModuleId || !lessonTitle.trim()) return;
    if (lessonType === 'pdf' && !lessonFile) {
      setError('Pilih berkas PDF untuk materi bertipe PDF.');
      return;
    }
    if (lessonType === 'video' && !lessonVideoUrl.trim() && !lessonFile) {
      setError('Isi URL video atau pilih berkas video.');
      return;
    }
    if (lessonType === 'video' && lessonVideoUrl.trim() && !getVideoEmbedUrl(lessonVideoUrl.trim())) {
      setError('Gunakan tautan YouTube atau Vimeo yang valid, atau unggah video MP4/WebM.');
      return;
    }
    if (lessonType === 'video' && lessonVideoUrl.trim() && lessonFile) {
      setError('Pilih tautan video atau berkas video, jangan keduanya sekaligus.');
      return;
    }
    if (lessonFile) {
      const fileError = validateLessonFile(lessonFile, lessonType);
      if (fileError) {
        setError(fileError);
        return;
      }
    }
    void runAction(async () => {
      const client = requireSupabase();
      const moduleLessons = data.lessons.filter((lesson) => lesson.module_id === lessonModuleId);
      const { data: lesson, error: insertError } = await client.from('lessons').insert({
        module_id: lessonModuleId,
        course_id: id,
        title: lessonTitle.trim(),
        type: lessonType,
        duration_minutes: Math.max(0, Number(lessonDuration) || 0),
        position: moduleLessons.length,
      }).select('id').single();
      if (insertError) throw new Error(getErrorMessage(insertError));

      let filePath: string | null = null;
      if (lessonFile) {
        const safeName = lessonFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        filePath = `${id}/${lesson.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await client.storage.from('lesson-files').upload(filePath, lessonFile, {
          contentType: lessonFile.type,
          upsert: false,
        });
        if (uploadError) {
          await client.from('lessons').delete().eq('id', lesson.id);
          throw new Error(getErrorMessage(uploadError));
        }
      }
      const { error: contentError } = await client.from('lesson_contents').insert({
        lesson_id: lesson.id,
        content: lessonContent.trim() || null,
        video_url: lessonVideoUrl.trim() || null,
        file_path: filePath,
      });
      if (contentError) {
        if (filePath) {
          const { error: removeError } = await client.storage.from('lesson-files').remove([filePath]);
          if (removeError) console.error('Berkas materi tertinggal setelah metadata gagal disimpan.', removeError);
        }
        await client.from('lessons').delete().eq('id', lesson.id);
        throw new Error(getErrorMessage(contentError));
      }
      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      setLessonFile(null);
    }, 'Materi ditambahkan.');
  };

  const deleteLesson = (lessonId: string) => {
    void runAction(async () => {
      const client = requireSupabase();
      const { data: contents, error: contentError } = await client.from('lesson_contents')
        .select('file_path').eq('lesson_id', lessonId).maybeSingle();
      if (contentError) throw new Error(getErrorMessage(contentError));
      const { error: deleteError } = await client.from('lessons').delete().eq('id', lessonId);
      if (deleteError) throw new Error(getErrorMessage(deleteError));
      if (contents?.file_path) {
        const { error: removeError } = await client.storage.from('lesson-files').remove([contents.file_path]);
        if (removeError) throw new Error(`Materi terhapus, tetapi berkas Storage gagal dihapus: ${getErrorMessage(removeError)}`);
      }
    }, 'Materi dihapus.');
  };

  const addQuiz = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !quizTitle.trim()) return;
    void runAction(async () => {
      const { error: insertError } = await requireSupabase().from('quizzes').insert({
        course_id: id,
        module_id: quizModuleId || null,
        title: quizTitle.trim(),
        time_limit_minutes: Math.max(1, Number(quizTimeLimit) || 20),
        passing_score: Math.min(100, Math.max(0, Number(quizPassingScore) || 80)),
        max_attempts: 3,
      });
      if (insertError) throw new Error(getErrorMessage(insertError));
      setQuizTitle('');
    }, 'Kuis dibuat sebagai draf.');
  };

  const addQuestion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionQuizId || !questionText.trim()) return;
    const options = Object.fromEntries(
      Object.entries(questionOptions).map(([label, text]) => [label, text.trim()]),
    );
    if (Object.values(options).some((text) => !text)) {
      setError('Isi seluruh opsi jawaban A sampai D.');
      return;
    }
    void runAction(async () => {
      const codeSnippet = questionCode.trim()
        ? { language: 'text', title: 'Kode', code: questionCode.trim() }
        : null;
      const client = requireSupabase();
      const questionPayload = {
        p_topic: questionTopic.trim(),
        p_text: questionText.trim(),
        p_options: options,
        p_correct_label: correctLabel,
        p_explanation: questionExplanation.trim(),
        p_points: Math.max(0.01, Number(questionPoints) || 10),
        p_code_snippet: codeSnippet,
      };
      const { error: questionError } = editingQuestionId
        ? await client.rpc('update_quiz_question', {
          p_question_id: editingQuestionId,
          ...questionPayload,
        })
        : await client.rpc('create_quiz_question', {
          p_quiz_id: questionQuizId,
          ...questionPayload,
        });
      if (questionError) throw new Error(getErrorMessage(questionError));
      setEditingQuestionId('');
      setQuestionText('');
      setQuestionTopic('');
      setQuestionOptions({ A: '', B: '', C: '', D: '' });
      setQuestionExplanation('');
      setQuestionCode('');
    }, editingQuestionId ? 'Soal diperbarui.' : 'Soal ditambahkan secara atomik.');
  };

  const editQuestion = (question: QuestionRow) => {
    const options = data?.questionOptions.filter((option) => option.question_id === question.id) ?? [];
    const key = data?.questionKeys.find((item) => item.question_id === question.id);
    const correctOption = options.find((option) => option.id === key?.correct_option_id);
    const snippet = question.code_snippet;
    const code = typeof snippet === 'object' && snippet !== null && 'code' in snippet && typeof snippet.code === 'string'
      ? snippet.code
      : '';
    setQuestionQuizId(question.quiz_id);
    setEditingQuestionId(question.id);
    setQuestionTopic(question.topic);
    setQuestionText(question.text);
    setQuestionOptions({
      A: options.find((option) => option.label === 'A')?.text ?? '',
      B: options.find((option) => option.label === 'B')?.text ?? '',
      C: options.find((option) => option.label === 'C')?.text ?? '',
      D: options.find((option) => option.label === 'D')?.text ?? '',
    });
    setCorrectLabel(correctOption?.label ?? 'A');
    setQuestionExplanation(key?.explanation ?? '');
    setQuestionPoints(String(question.points));
    setQuestionCode(code);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const deleteQuestion = (question: QuestionRow) => {
    if (!window.confirm('Hapus soal ini? Tindakan ini tidak dapat dibatalkan.')) return;
    void runAction(async () => {
      const { error: deleteError } = await requireSupabase().rpc('delete_quiz_question', {
        p_question_id: question.id,
      });
      if (deleteError) throw new Error(getErrorMessage(deleteError));
      if (editingQuestionId === question.id) setEditingQuestionId('');
    }, 'Soal dihapus.');
  };

  const toggleQuizPublication = (quiz: QuizRow) => {
    void runAction(async () => {
      const { error: updateError } = await requireSupabase().from('quizzes')
        .update({ is_published: !quiz.is_published }).eq('id', quiz.id);
      if (updateError) throw new Error(getErrorMessage(updateError));
    }, quiz.is_published ? 'Kuis ditarik dari peserta.' : 'Kuis diterbitkan.');
  };

  const submitForReview = () => {
    void runAction(async () => {
      const { error: submitError } = await requireSupabase().rpc('submit_course_for_review', { p_course_id: id });
      if (submitError) throw new Error(getErrorMessage(submitError));
    }, 'Kursus diajukan untuk ditinjau admin.');
  };

  const moveModule = (module: ModuleRow, direction: -1 | 1) => {
    if (!data) return;
    const currentIndex = data.modules.findIndex((item) => item.id === module.id);
    const swap = data.modules[currentIndex + direction];
    if (!swap) return;
    void runAction(async () => {
      const client = requireSupabase();
      const temporaryPosition = data.modules.length + 1;
      const first = await client.from('modules').update({ position: temporaryPosition }).eq('id', module.id);
      if (first.error) throw new Error(getErrorMessage(first.error));
      const second = await client.from('modules').update({ position: module.position }).eq('id', swap.id);
      if (second.error) throw new Error(getErrorMessage(second.error));
      const third = await client.from('modules').update({ position: swap.position }).eq('id', module.id);
      if (third.error) throw new Error(getErrorMessage(third.error));
    }, 'Urutan modul diperbarui.');
  };

  if (isLoading) return <Card className="p-10 text-center text-sm text-slate-500">Memuat editor kursus...</Card>;
  if (!data) {
    return (
      <Card className="p-8">
        <p role="alert" className="text-sm text-red">{error || 'Kursus tidak tersedia.'}</p>
        <Link to="/instructor" className="mt-4 inline-flex text-sm font-semibold text-blue">Kembali ke dasbor pengajar</Link>
      </Card>
    );
  }

  const thumbnailUrl = data.course.thumbnail_path
    ? requireSupabase().storage.from('course-thumbnails').getPublicUrl(data.course.thumbnail_path).data.publicUrl
    : '';
  const statuses: Record<string, string> = {
    draft: 'Draf',
    pending_review: 'Menunggu tinjauan',
    published: 'Terbit',
    archived: 'Diarsipkan',
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Link to="/instructor" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue">
        <ArrowLeft className="h-4 w-4" /> Dasbor Pengajar
      </Link>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue">Pengelolaan kursus</p>
          <h1 className="mt-1 text-2xl font-extrabold text-text-heading">{data.course.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Slug: {data.course.slug}</p>
        </div>
        <Badge variant={data.course.status === 'published' ? 'active' : 'in-review'}>{statuses[data.course.status] ?? data.course.status}</Badge>
      </header>

      {(error || notice || data.course.review_note) && (
        <div className="space-y-2">
          {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-green/20 bg-green-tint p-3 text-sm text-green">{notice}</p>}
          {data.course.review_note && <p className="rounded-xl border border-orange/20 bg-orange-tint p-3 text-sm text-slate-700">Catatan admin: {data.course.review_note}</p>}
        </div>
      )}

      <Card className="space-y-5 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-blue" />
          <h2 className="text-lg font-bold text-text-heading">Informasi dasar</h2>
        </div>
        <form onSubmit={saveCourse} className="space-y-4">
          <Input name="title" label="Judul kursus" defaultValue={data.course.title} required maxLength={160} />
          <label className="block text-xs font-semibold text-text-heading">
            Deskripsi
            <textarea name="description" rows={4} defaultValue={data.course.description} required maxLength={10000}
              className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-blue focus:outline-none" />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select name="category_id" label="Kategori" defaultValue={data.course.category_id ?? ''}
              options={data.categories.map((category) => ({ value: category.id, label: category.name }))} />
            <Select name="level" label="Tingkat" defaultValue={data.course.level}
              options={['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((level) => ({ value: level, label: level }))} />
            <Input name="price" label="Harga (Rupiah)" type="number" min="0" step="1000" defaultValue={String(data.course.price)} required />
          </div>
          <Button type="submit" variant="navy" disabled={isSaving}>Simpan informasi</Button>
        </form>

        <div className="border-t border-border pt-5">
          <h3 className="text-sm font-bold text-text-heading">Thumbnail kursus</h3>
          {thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail kursus" className="mt-3 aspect-video w-full max-w-sm rounded-xl object-cover" />}
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" /> Unggah JPG, PNG, atau WebP (maks. 2 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={isSaving}
              onChange={(event) => uploadThumbnail(event.target.files?.[0] ?? null)} />
          </label>
        </div>
      </Card>

      <Card className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 className="text-lg font-bold text-text-heading">Kurikulum</h2>
          <p className="mt-1 text-xs text-slate-500">Perubahan modul dan materi langsung tersimpan di Supabase.</p>
        </div>
        <form onSubmit={addModule} className="flex flex-col gap-3 sm:flex-row">
          <Input aria-label="Nama modul" placeholder="Nama modul baru" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} required />
          <Button type="submit" variant="outline" disabled={isSaving} leftIcon={<Plus className="h-4 w-4" />}>Tambah modul</Button>
        </form>
        <div className="space-y-3">
          {data.modules.map((module, index) => (
            <section key={module.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-text-heading">{index + 1}. {module.title}</h3>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => renameModule(module)} aria-label={`Ubah nama modul ${module.title}`}><Pencil className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="sm" disabled={isSaving || index === 0} onClick={() => moveModule(module, -1)} aria-label="Pindah modul ke atas"><ArrowUp className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="sm" disabled={isSaving || index === data.modules.length - 1} onClick={() => moveModule(module, 1)} aria-label="Pindah modul ke bawah"><ArrowDown className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => deleteModule(module.id)} aria-label="Hapus modul"><Trash2 className="h-4 w-4 text-red" /></Button>
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {data.lessons.filter((lesson) => lesson.module_id === module.id).map((lesson, lessonIndex, moduleLessons) => (
                  <li key={lesson.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-blue" />{lesson.title} <span className="text-xs text-slate-400">{lesson.type} · {lesson.duration_minutes} mnt</span></span>
                    <span className="flex shrink-0 items-center gap-1">
                      <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => renameLesson(lesson)} aria-label={`Ubah judul ${lesson.title}`}><Pencil className="h-4 w-4" /></Button>
                      <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => editLesson(lesson)} aria-label={`Ubah isi ${lesson.title}`}>Isi</Button>
                      <Button type="button" variant="outline" size="sm" disabled={isSaving || lessonIndex === 0} onClick={() => moveLesson(lesson, -1)} aria-label={`Pindah ${lesson.title} ke atas`}><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" variant="outline" size="sm" disabled={isSaving || lessonIndex === moduleLessons.length - 1} onClick={() => moveLesson(lesson, 1)} aria-label={`Pindah ${lesson.title} ke bawah`}><ArrowDown className="h-4 w-4" /></Button>
                      <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => deleteLesson(lesson.id)} aria-label={`Hapus ${lesson.title}`}><Trash2 className="h-4 w-4 text-red" /></Button>
                    </span>
                  </li>
                ))}
                {!data.lessons.some((lesson) => lesson.module_id === module.id) && <li className="text-xs text-slate-400">Belum ada materi.</li>}
                {data.lessons.filter((lesson) => lesson.module_id === module.id).map((lesson) => editingLessonId === lesson.id && (
                  <li key={`${lesson.id}:editor`} className="mt-3 rounded-xl border border-blue/20 bg-soft-blue/30 p-4">
                    <form onSubmit={saveLesson} className="space-y-3">
                      <h4 className="text-sm font-bold text-text-heading">Ubah materi: {lesson.title}</h4>
                      <Input label="Judul materi" value={editingLessonTitle} onChange={(event) => setEditingLessonTitle(event.target.value)} required maxLength={200} />
                      <Input label="Durasi (menit)" type="number" min="0" value={editingLessonDuration} onChange={(event) => setEditingLessonDuration(event.target.value)} />
                      <label className="block text-xs font-semibold text-text-heading">
                          Isi materi (Markdown)
                          <span className="mt-1 block font-normal text-slate-500">Gunakan Markdown untuk judul, daftar, tautan, dan format tulisan. HTML mentah tidak dijalankan.</span>
                          <textarea rows={5} value={editingLessonContent} onChange={(event) => setEditingLessonContent(event.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-blue focus:outline-none" />
                      </label>
                      {lesson.type === 'video' && (
                        <div>
                          <Input label="Tautan video YouTube atau Vimeo" type="url" value={editingLessonVideoUrl} onChange={(event) => setEditingLessonVideoUrl(event.target.value)} placeholder="https://youtu.be/... atau https://vimeo.com/..." />
                          <p className="mt-1 text-xs text-slate-500">Tautan akan ditampilkan sebagai pemutar video di halaman belajar peserta.</p>
                        </div>
                      )}
                      <div>
                          {data.lessonContents.find((item) => item.lesson_id === lesson.id)?.file_path && (
                            <p className="mb-2 text-xs text-slate-500">Berkas saat ini tersimpan. Pilih berkas baru hanya untuk menggantinya.</p>
                          )}
                          <Input label={`Ganti berkas (maks. 10 MB${lesson.type === 'video' ? ', MP4/WebM' : lesson.type === 'pdf' ? ', PDF' : ', gambar/PDF'})`} type="file"
                            accept={lesson.type === 'video' ? 'video/mp4,video/webm' : lesson.type === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,application/pdf'}
                            onChange={(event) => setEditingLessonFile(event.target.files?.[0] ?? null)} />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" variant="navy" size="sm" disabled={isSaving}>Simpan materi</Button>
                        <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => setEditingLessonId('')}>Batal</Button>
                      </div>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <form onSubmit={addLesson} className="space-y-4 border-t border-border pt-5">
          <h3 className="font-bold text-text-heading">Tambah materi</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Modul" value={lessonModuleId} onChange={(event) => setLessonModuleId(event.target.value)}
              options={data.modules.map((module) => ({ value: module.id, label: module.title }))} required />
            <Input label="Judul materi" value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} required maxLength={200} />
            <Select label="Jenis materi" value={lessonType} onChange={(event) => {
              setLessonType(event.target.value as LessonRow['type']);
              setLessonFile(null);
            }}
              options={[
                { value: 'video', label: 'Video' },
                { value: 'pdf', label: 'PDF' },
                { value: 'lab', label: 'Lab / praktik' },
                { value: 'text', label: 'Tulisan / materi teks' },
              ]} />
            <Input label="Durasi (menit)" type="number" min="0" value={lessonDuration} onChange={(event) => setLessonDuration(event.target.value)} />
          </div>
          {lessonType === 'video' && (
            <div>
              <Input label="Tautan video YouTube atau Vimeo (opsional jika unggah video)" type="url" value={lessonVideoUrl} onChange={(event) => setLessonVideoUrl(event.target.value)} placeholder="https://youtu.be/... atau https://vimeo.com/..." />
              <p className="mt-1 text-xs text-slate-500">Tautan akan ditampilkan sebagai pemutar video di halaman belajar peserta.</p>
            </div>
          )}
          <Input
            key={lessonType}
            label={`Berkas materi (maks. 10 MB${lessonType === 'video' ? ', MP4/WebM' : lessonType === 'pdf' ? ', PDF' : ', gambar/PDF'})`}
            type="file"
            accept={lessonType === 'video' ? 'video/mp4,video/webm' : lessonType === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,application/pdf'}
            onChange={(event) => setLessonFile(event.target.files?.[0] ?? null)}
          />
          <label className="block text-xs font-semibold text-text-heading">
              Isi materi (Markdown)
              <span className="mt-1 block font-normal text-slate-500">Materi tulisan disimpan sebagai Markdown dan akan ditampilkan dengan aman kepada peserta.</span>
              <textarea rows={5} value={lessonContent} onChange={(event) => setLessonContent(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-blue focus:outline-none" />
          </label>
          <Button type="submit" variant="navy" disabled={isSaving || !data.modules.length} leftIcon={<Plus className="h-4 w-4" />}>Tambah materi</Button>
        </form>
      </Card>

      <Card className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 className="text-lg font-bold text-text-heading">Kuis pilihan ganda</h2>
          <p className="mt-1 text-xs text-slate-500">Kunci jawaban disimpan terpisah dan tidak dibaca peserta sebelum kuis dikirim.</p>
        </div>
        <form onSubmit={addQuiz} className="grid gap-4 sm:grid-cols-2">
          <Input label="Judul kuis" value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} required maxLength={160} />
          <Select label="Modul (opsional)" value={quizModuleId} onChange={(event) => setQuizModuleId(event.target.value)}
            options={[{ value: '', label: 'Umum' }, ...data.modules.map((module) => ({ value: module.id, label: module.title }))]} />
          <Input label="Durasi (menit)" type="number" min="1" value={quizTimeLimit} onChange={(event) => setQuizTimeLimit(event.target.value)} required />
          <Input label="Nilai kelulusan (%)" type="number" min="0" max="100" value={quizPassingScore} onChange={(event) => setQuizPassingScore(event.target.value)} required />
          <Button type="submit" variant="outline" disabled={isSaving}>Buat kuis</Button>
        </form>
        <div className="space-y-3">
          {data.quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-text-heading">{quiz.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{quiz.time_limit_minutes} menit · lulus {quiz.passing_score}% · maksimal {quiz.max_attempts} percobaan</p>
                </div>
                <Button type="button" variant={quiz.is_published ? 'outline' : 'navy'} size="sm" disabled={isSaving}
                  onClick={() => toggleQuizPublication(quiz)}>{quiz.is_published ? 'Tarik kuis' : 'Terbitkan kuis'}</Button>
              </div>
            </div>
          ))}
        </div>
        {data.quizzes.length > 0 && (
          <div className="space-y-5 border-t border-border pt-5">
          <section className="space-y-3">
            <h3 className="font-bold text-text-heading">Daftar soal</h3>
            <Select label="Pilih kuis untuk mengelola soal" value={questionQuizId} onChange={(event) => {
              setQuestionQuizId(event.target.value);
              setEditingQuestionId('');
            }}
              options={data.quizzes.map((quiz) => ({ value: quiz.id, label: quiz.title }))} required />
            {data.questions.filter((question) => question.quiz_id === questionQuizId).map((question, index) => (
              <div key={question.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-slate-400">Soal {index + 1} · {question.topic} · {question.points} poin</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-text-heading">{question.text}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={isSaving}
                    onClick={() => editQuestion(question)} leftIcon={<Pencil className="h-4 w-4" />}>Ubah</Button>
                  <Button type="button" variant="outline" size="sm" disabled={isSaving}
                    onClick={() => deleteQuestion(question)} aria-label={`Hapus soal ${index + 1}`}>
                    <Trash2 className="h-4 w-4 text-red" />
                  </Button>
                </div>
              </div>
            ))}
            {!data.questions.some((question) => question.quiz_id === questionQuizId) && (
              <p className="text-xs text-slate-500">Belum ada soal dalam kuis ini.</p>
            )}
          </section>
          <form onSubmit={addQuestion} className="space-y-4">
            <h3 className="font-bold text-text-heading">{editingQuestionId ? 'Ubah soal' : 'Tambah soal'}</h3>
            <Select label="Kuis" value={questionQuizId} onChange={(event) => setQuestionQuizId(event.target.value)}
              options={data.quizzes.map((quiz) => ({ value: quiz.id, label: quiz.title }))} required />
            <Input label="Topik" value={questionTopic} onChange={(event) => setQuestionTopic(event.target.value)} />
            <label className="block text-xs font-semibold text-text-heading">Pertanyaan
              <textarea rows={3} value={questionText} onChange={(event) => setQuestionText(event.target.value)} required
                className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-blue focus:outline-none" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['A', 'B', 'C', 'D'] as const).map((label) => (
                <Input key={label} label={`Opsi ${label}`} value={questionOptions[label]}
                  onChange={(event) => setQuestionOptions((current) => ({ ...current, [label]: event.target.value }))} required />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Kunci jawaban" value={correctLabel} onChange={(event) => setCorrectLabel(event.target.value)}
                options={['A', 'B', 'C', 'D'].map((label) => ({ value: label, label }))} />
              <Input label="Bobot" type="number" min="0.01" step="0.01" value={questionPoints} onChange={(event) => setQuestionPoints(event.target.value)} />
            </div>
            <label className="block text-xs font-semibold text-text-heading">Penjelasan jawaban
              <textarea rows={2} value={questionExplanation} onChange={(event) => setQuestionExplanation(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-blue focus:outline-none" />
            </label>
            <label className="block text-xs font-semibold text-text-heading">Potongan kode (opsional)
              <textarea rows={3} value={questionCode} onChange={(event) => setQuestionCode(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 font-mono text-sm focus:border-blue focus:outline-none" />
            </label>
            <div className="flex gap-2">
              <Button type="submit" variant="navy" disabled={isSaving}>{editingQuestionId ? 'Simpan perubahan' : 'Simpan soal'}</Button>
              {editingQuestionId && <Button type="button" variant="outline" disabled={isSaving} onClick={() => {
                setEditingQuestionId('');
                setQuestionText('');
                setQuestionTopic('');
                setQuestionOptions({ A: '', B: '', C: '', D: '' });
                setQuestionExplanation('');
                setQuestionCode('');
              }}>Batal</Button>}
            </div>
          </form>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-blue/15 bg-soft-blue/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-text-heading">Ajukan untuk penerbitan</p>
          <p className="mt-1 text-xs text-slate-600">Perlu deskripsi, thumbnail, minimal satu modul, dan satu materi.</p>
        </div>
        <Button type="button" variant="orange" disabled={isSaving || data.course.status === 'pending_review' || data.course.status === 'published'}
          onClick={submitForReview} leftIcon={<Send className="h-4 w-4" />}>
          {data.course.status === 'pending_review' ? 'Menunggu tinjauan' : 'Ajukan kursus'}
        </Button>
      </div>
    </div>
  );
};
