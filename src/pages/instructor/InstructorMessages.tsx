import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';

interface ConversationMessage {
  id: string;
  sender_id: string;
  body: string;
  sent_at: string;
}

interface StudentProfile {
  id: string;
  full_name: string;
  avatar_path: string | null;
}

export const InstructorMessages: React.FC = () => {
  const { studentId = '' } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(async () => {
    if (!user || !studentId) return;
    const client = requireSupabase();
    const { data: profile, error: profileError } = await client.from('profiles')
      .select('id, full_name, avatar_path').eq('id', studentId).maybeSingle();
    if (profileError) throw new Error(getErrorMessage(profileError));
    if (!profile) throw new Error('Peserta tidak ditemukan atau kamu tidak memiliki akses.');

    const { data: instructorCourses, error: coursesError } = await client.from('courses')
      .select('id').eq('teacher_id', user.id);
    if (coursesError) throw new Error(getErrorMessage(coursesError));
    const courseIds = (instructorCourses ?? []).map((course) => course.id);
    if (!courseIds.length) throw new Error('Peserta ini tidak terdaftar di kursus yang kamu kelola.');

    const { data: enrollment, error: enrollmentError } = await client.from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .in('course_id', courseIds)
      .in('status', ['active', 'completed'])
      .limit(1)
      .maybeSingle();
    if (enrollmentError) throw new Error(getErrorMessage(enrollmentError));
    if (!enrollment) throw new Error('Peserta ini tidak terdaftar di kursus yang kamu kelola.');

    const { data: conversation, error: messagesError } = await client.from('messages')
      .select('id, sender_id, body, sent_at')
      .or(`and(sender_id.eq.${studentId},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${studentId})`)
      .order('sent_at');
    if (messagesError) throw new Error(getErrorMessage(messagesError));
    setStudent(profile);
    setMessages(conversation ?? []);
  }, [studentId, user]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMessage('');
    void loadConversation()
      .catch((loadError: unknown) => {
        if (active) setErrorMessage(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!user || !student || !body || isSending) return;
    setIsSending(true);
    setErrorMessage('');
    const { error } = await requireSupabase().from('messages').insert({
      sender_id: user.id,
      recipient_id: student.id,
      body,
    });
    if (error) {
      setErrorMessage(getErrorMessage(error));
      setIsSending(false);
      return;
    }
    setDraft('');
    try {
      await loadConversation();
    } catch (loadError) {
      setErrorMessage(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <Card className="mx-auto max-w-[900px] p-8 text-center text-sm text-slate-500">Memuat percakapan...</Card>;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-[900px]">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-bold text-text-heading">Percakapan tidak tersedia</h1>
          <p role="alert" className="mt-2 text-sm text-red">{errorMessage}</p>
          <Link to="/instructor/students" className="mt-4 inline-block text-sm font-bold text-blue">
            Kembali ke Daftar Peserta
          </Link>
        </Card>
      </div>
    );
  }

  const avatarUrl = student.avatar_path
    ? requireSupabase().storage.from('avatars').getPublicUrl(student.avatar_path).data.publicUrl
    : undefined;

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <Link to="/instructor/students" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Peserta
      </Link>

      <Card className="flex min-h-[65vh] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <Avatar src={avatarUrl} name={student.full_name} size="md" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-text-heading">{student.full_name}</h1>
            <p className="truncate text-xs text-slate-500">Peserta kursusmu</p>
          </div>
        </div>

        <div
          className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6"
          aria-live="polite"
          aria-label={`Percakapan dengan ${student.full_name}`}
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-blue">
                <MessageCircle className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-sm font-bold text-text-heading">Mulai Percakapan</h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                Kirim pesan tentang progres kursus atau pertanyaan lainnya.
              </p>
            </div>
          ) : messages.map((message) => {
            const isInstructorMessage = message.sender_id === user?.id;
            return (
              <div key={message.id} className={`flex ${isInstructorMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                  isInstructorMessage
                    ? 'rounded-br-md bg-blue text-white'
                    : 'rounded-bl-md border border-border bg-white text-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
                  <p className={`mt-1.5 text-right text-[10px] ${isInstructorMessage ? 'text-blue-100' : 'text-slate-400'}`}>
                    {isInstructorMessage ? user?.name : student.full_name}
                    {' · '}
                    {new Date(message.sent_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-border bg-white p-4 sm:p-5">
          <label htmlFor="student-message" className="sr-only">Tulis pesan</label>
          <div className="flex items-end gap-3">
            <textarea
              id="student-message"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={2}
              maxLength={2000}
              placeholder={`Pesan untuk ${student.full_name.split(' ')[0]}...`}
              className="min-h-12 flex-1 resize-y rounded-xl border border-border bg-slate-50 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
            <Button type="submit" variant="blue" size="md" disabled={!draft.trim() || isSending} leftIcon={<Send className="h-4 w-4" />}>
              {isSending ? 'Mengirim...' : 'Kirim'}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p role="alert" className="text-xs text-red">{errorMessage}</p>
            <p className="ml-auto text-[10px] text-slate-400">Enter untuk mengirim · Shift+Enter untuk baris baru</p>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">Pesan disimpan di akun EduSpace dan hanya dapat dilihat oleh peserta serta pengajarnya.</p>
        </form>
      </Card>
    </div>
  );
};
