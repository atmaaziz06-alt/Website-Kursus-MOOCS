import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';

interface InstructorContact {
  id: string;
  name: string;
  avatarPath: string | null;
  courses: string[];
}

interface ConversationMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  sent_at: string;
}

export const StudentMessages: React.FC = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<InstructorContact[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadInbox = useCallback(async () => {
    if (!user) return;
    const client = requireSupabase();
    const { data: enrollments, error: enrollmentError } = await client.from('enrollments')
      .select('course_id')
      .eq('student_id', user.id)
      .in('status', ['active', 'completed']);
    if (enrollmentError) throw new Error(getErrorMessage(enrollmentError));
    const courseIds = [...new Set((enrollments ?? []).map((enrollment) => enrollment.course_id))];
    if (!courseIds.length) {
      setContacts([]);
      setMessages([]);
      return;
    }

    const { data: courses, error: coursesError } = await client.from('courses')
      .select('id, title, teacher_id').in('id', courseIds);
    if (coursesError) throw new Error(getErrorMessage(coursesError));
    const instructorIds = [...new Set((courses ?? []).map((course) => course.teacher_id))];
    if (!instructorIds.length) {
      setContacts([]);
      setMessages([]);
      return;
    }

    const [{ data: instructors, error: instructorsError }, { data: conversation, error: messagesError }] = await Promise.all([
      client.from('v_public_instructors').select('id, full_name, avatar_path').in('id', instructorIds),
      client.from('messages').select('id, sender_id, recipient_id, body, sent_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('sent_at', { ascending: false }),
    ]);
    if (instructorsError) throw new Error(getErrorMessage(instructorsError));
    if (messagesError) throw new Error(getErrorMessage(messagesError));
    setContacts((instructors ?? []).map((instructor) => ({
      id: instructor.id,
      name: instructor.full_name,
      avatarPath: instructor.avatar_path,
      courses: (courses ?? []).filter((course) => course.teacher_id === instructor.id).map((course) => course.title),
    })));
    setMessages(conversation ?? []);
  }, [user]);

  useEffect(() => {
    let active = true;
    setError('');
    void loadInbox()
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [loadInbox]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, instructorId]);

  const contact = contacts.find((item) => item.id === instructorId);
  const currentMessages = useMemo(() => {
    if (!user || !instructorId) return [];
    return messages
      .filter((message) =>
        (message.sender_id === user.id && message.recipient_id === instructorId) ||
        (message.sender_id === instructorId && message.recipient_id === user.id),
      )
      .sort((left, right) => left.sent_at.localeCompare(right.sent_at));
  }, [instructorId, messages, user]);

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!user || !contact || !body || isSending) return;
    setIsSending(true);
    setError('');
    const { error: sendError } = await requireSupabase().from('messages').insert({
      sender_id: user.id,
      recipient_id: contact.id,
      body,
    });
    if (sendError) {
      setError(getErrorMessage(sendError));
      setIsSending(false);
      return;
    }
    setDraft('');
    try {
      await loadInbox();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
    } finally {
      setIsSending(false);
    }
  };

  const avatarUrl = (path: string | null) => path
    ? requireSupabase().storage.from('avatars').getPublicUrl(path).data.publicUrl
    : undefined;

  if (isLoading) return <Card className="p-8 text-center text-sm text-slate-500">Memuat pesan...</Card>;

  if (instructorId && !contact) {
    return (
      <Card className="p-8 text-center">
        <p role="alert" className="text-sm text-red">{error || 'Pengajar ini tidak mengajar kursus yang sedang kamu ikuti.'}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/student/messages')}>Kembali ke pesan</Button>
      </Card>
    );
  }

  if (contact) {
    return (
      <div className="mx-auto max-w-[900px] space-y-5">
        <Link to="/student/messages" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue">
          <ArrowLeft className="h-4 w-4" /> Semua pesan
        </Link>
        <Card className="flex min-h-[65vh] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <Avatar src={avatarUrl(contact.avatarPath)} name={contact.name} size="md" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-text-heading">{contact.name}</h1>
              <p className="truncate text-xs text-slate-500">{contact.courses.join(', ')}</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6" aria-live="polite">
            {currentMessages.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                <MessageCircle className="h-8 w-8 text-blue" />
                <p className="mt-3 text-sm font-bold text-text-heading">Belum ada pesan</p>
                <p className="mt-1 text-xs text-slate-500">Kirim pertanyaan tentang kursus kepada pengajarmu.</p>
              </div>
            ) : currentMessages.map((message) => {
              const isStudentMessage = message.sender_id === user?.id;
              return (
                <div key={message.id} className={`flex ${isStudentMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                    isStudentMessage ? 'rounded-br-md bg-blue text-white' : 'rounded-bl-md border border-border bg-white text-slate-700'
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
                    <p className={`mt-1.5 text-right text-[10px] ${isStudentMessage ? 'text-blue-100' : 'text-slate-400'}`}>
                      {isStudentMessage ? user?.name : contact.name} · {new Date(message.sent_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="border-t border-border bg-white p-4 sm:p-5">
            <label htmlFor="instructor-message" className="sr-only">Tulis pesan</label>
            <div className="flex items-end gap-3">
              <textarea
                id="instructor-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder={`Pesan untuk ${contact.name.split(' ')[0]}...`}
                className="min-h-12 flex-1 resize-y rounded-xl border border-border bg-slate-50 px-3.5 py-3 text-sm focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/20"
              />
              <Button type="submit" variant="blue" size="md" disabled={!draft.trim() || isSending} leftIcon={<Send className="h-4 w-4" />}>
                {isSending ? 'Mengirim...' : 'Kirim'}
              </Button>
            </div>
            <p role="alert" className="mt-2 text-xs text-red">{error}</p>
            <p className="mt-2 text-[10px] text-slate-400">Pesan disimpan di EduSpace; balasan tidak dikirim lewat email.</p>
          </form>
        </Card>
      </div>
    );
  }

  const previews = new Map<string, ConversationMessage>();
  messages.forEach((message) => {
    const otherId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
    if (!previews.has(otherId)) previews.set(otherId, message);
  });

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-text-heading">Pesan</h1>
        <p className="mt-1 text-xs text-slate-500">Hubungi pengajar dari kursus yang sedang kamu ikuti.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      {contacts.length ? (
        <div className="space-y-3">
          {contacts.map((item) => {
            const preview = previews.get(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/student/messages/${item.id}`)}
                className="w-full text-left"
              >
                <Card className="flex items-center gap-4 p-5 transition-colors hover:border-blue/40">
                  <Avatar src={avatarUrl(item.avatarPath)} name={item.name} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-text-heading">{item.name}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {preview?.body ?? item.courses.join(', ')}
                    </span>
                  </span>
                  {preview && <span className="text-[10px] text-slate-400">{new Date(preview.sent_at).toLocaleDateString('id-ID')}</span>}
                </Card>
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-text-heading">Belum ada pengajar untuk dihubungi</p>
          <p className="mt-1 text-sm text-slate-500">Daftar kursus terlebih dahulu untuk memulai percakapan.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/courses')}>Jelajahi kursus</Button>
        </Card>
      )}
    </div>
  );
};
