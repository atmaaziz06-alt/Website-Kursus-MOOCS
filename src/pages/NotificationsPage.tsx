import React, { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  CircleHelp,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { Card, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { NotificationKind, useNotifications } from '../context/NotificationContext';

const icons: Record<NotificationKind, React.ReactNode> = {
  course: <BookOpen className="w-4 h-4" />,
  achievement: <GraduationCap className="w-4 h-4" />,
  community: <CircleHelp className="w-4 h-4" />,
  system: <ShieldCheck className="w-4 h-4" />,
};

export const NotificationsPage: React.FC = () => {
  const { role } = useAuth();
  const { notifications, unreadCount, isRead, markAsRead, markAllAsRead, isLoading, error: notificationError } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [actionError, setActionError] = useState('');
  const filteredNotifications = useMemo(
    () => notifications.filter((item) => filter === 'all' || !isRead(item.id)),
    [filter, isRead, notifications]
  );
  const roleTitle = role === 'participant' ? 'belajar' : role === 'instructor' ? 'mengajar' : 'platform';
  const handleMarkAllRead = async () => {
    setActionError('');
    try {
      await markAllAsRead();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Notifikasi gagal diperbarui.');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue mb-1">Pembaruan untukmu</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">Notifikasi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ikuti perkembangan aktivitas {roleTitle}-mu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleMarkAllRead()}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-blue hover:text-navy disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" />
          Tandai semua telah dibaca
        </button>
      </div>

      {(notificationError || actionError) && (
        <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">
          {actionError || notificationError}
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                filter === 'all' ? 'bg-soft-blue text-blue' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              aria-pressed={filter === 'unread'}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                filter === 'unread' ? 'bg-soft-blue text-blue' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Belum dibaca{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Bell className="w-3.5 h-3.5" />
            {unreadCount === 0 ? 'Semua notifikasi telah dibaca' : `${unreadCount} belum dibaca`}
          </span>
        </div>

        {isLoading ? (
          <p className="p-10 text-center text-sm text-slate-500">Memuat notifikasi...</p>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Check className="w-7 h-7" />}
            title={filter === 'unread' ? 'Semua notifikasi telah dibaca' : 'Belum ada notifikasi'}
            description={
              filter === 'unread'
                ? 'Tidak ada notifikasi yang belum dibaca. Periksa kembali nanti untuk pembaruan.'
                : 'Pembaruan tentang kursus dan akunmu akan muncul di sini.'
            }
            className="py-12"
          />
        ) : (
          <ul className="divide-y divide-border">
            {filteredNotifications.map((notification) => {
              const read = isRead(notification.id);
              return (
                <li
                  key={notification.id}
                  className={`flex items-start gap-4 px-5 py-5 transition-colors ${
                    read ? 'bg-white' : 'bg-soft-blue/20'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      read ? 'bg-slate-100 text-slate-500' : 'bg-soft-blue text-blue'
                    }`}
                  >
                    {icons[notification.kind]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-text-heading">{notification.title}</h2>
                      {!read && <span className="h-2 w-2 rounded-full bg-blue" aria-label="Belum dibaca" />}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {notification.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{notification.time}</p>
                  </div>
                  {!read && (
                    <button
                      type="button"
                      onClick={() => {
                        void markAsRead(notification.id).catch((error: unknown) =>
                          setActionError(error instanceof Error ? error.message : 'Notifikasi gagal diperbarui.'));
                      }}
                      aria-label={`Tandai ${notification.title} telah dibaca`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};
