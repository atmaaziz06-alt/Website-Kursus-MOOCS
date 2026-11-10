import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getUserAvatar } from '../../config/media';
import { instructorStudents } from '../../data/instructorStudents';

interface ConversationMessage {
  id: string;
  text: string;
  sentAt: string;
  sender: 'instructor' | 'student';
}

const isConversationMessage = (value: unknown): value is ConversationMessage => {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message.id === 'string' &&
    typeof message.text === 'string' &&
    typeof message.sentAt === 'string' &&
    (message.sender === 'instructor' || message.sender === 'student')
  );
};

const loadConversation = (studentId: string): ConversationMessage[] => {
  const storageKey = `eduspace_messages_${studentId}`;
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [];

  try {
    const messages: unknown = JSON.parse(saved);
    if (!Array.isArray(messages)) throw new Error('Saved conversation must be an array.');
    return messages.filter(isConversationMessage);
  } catch (error) {
    console.error(`Unable to load conversation for student ${studentId}.`, error);
    return [];
  }
};

export const InstructorMessages: React.FC = () => {
  const { studentId = '' } = useParams();
  const student = instructorStudents.find((item) => item.id === studentId);
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>(() => loadConversation(studentId));
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadConversation(studentId));
    setDraft('');
    setErrorMessage('');
  }, [studentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  if (!student) {
    return (
      <div className="max-w-[900px] mx-auto">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-bold text-text-heading">Student not found</h1>
          <p className="mt-2 text-sm text-slate-500">This student is not in your directory.</p>
          <Link to="/instructor/students" className="mt-4 inline-block text-sm font-bold text-blue">
            Return to Students
          </Link>
        </Card>
      </div>
    );
  }

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      setErrorMessage('Write a message before sending.');
      return;
    }

    const message: ConversationMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      sentAt: new Date().toISOString(),
      sender: 'instructor',
    };
    const updatedMessages = [...messages, message];
    localStorage.setItem(`eduspace_messages_${student.id}`, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setDraft('');
    setErrorMessage('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <Link
        to="/instructor/students"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      <Card className="flex min-h-[65vh] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <Avatar src={getUserAvatar(student.avatarId)} name={student.name} size="md" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-text-heading">{student.name}</h1>
            <p className="truncate text-xs text-slate-500">{student.email}</p>
          </div>
          <span className="ml-auto hidden rounded-full bg-soft-blue px-3 py-1 text-[10px] font-bold uppercase text-blue sm:inline">
            {student.track}
          </span>
        </div>

        <div
          className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6"
          aria-live="polite"
          aria-label={`Conversation with ${student.name}`}
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-blue">
                <MessageCircle className="w-6 h-6" />
              </span>
              <h2 className="mt-4 text-sm font-bold text-text-heading">Start a conversation</h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                Send {student.name.split(' ')[0]} a message about their course progress or any questions.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isInstructorMessage = message.sender === 'instructor';
              return (
                <div
                  key={message.id}
                  className={`flex ${isInstructorMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                      isInstructorMessage
                        ? 'rounded-br-md bg-blue text-white'
                        : 'rounded-bl-md border border-border bg-white text-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>
                    <p className={`mt-1.5 text-right text-[10px] ${isInstructorMessage ? 'text-blue-100' : 'text-slate-400'}`}>
                      {isInstructorMessage ? user?.name || 'You' : student.name}
                      {' · '}
                      {new Date(message.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-border bg-white p-4 sm:p-5">
          <label htmlFor="student-message" className="sr-only">Write a message</label>
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
              placeholder={`Message ${student.name.split(' ')[0]}...`}
              className="min-h-12 flex-1 resize-y rounded-xl border border-border bg-slate-50 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
            <Button
              type="submit"
              variant="blue"
              size="md"
              disabled={!draft.trim()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p role="status" className="text-xs text-red">{errorMessage}</p>
            <p className="ml-auto text-[10px] text-slate-400">Enter to send · Shift+Enter for a new line</p>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Demo messages are saved in this browser and are not delivered to email or another device.
          </p>
        </form>
      </Card>
    </div>
  );
};
