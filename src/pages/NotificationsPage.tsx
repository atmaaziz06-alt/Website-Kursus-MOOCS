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
import { NotificationKind } from '../data/notifications';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const icons: Record<NotificationKind, React.ReactNode> = {
  course: <BookOpen className="w-4 h-4" />,
  achievement: <GraduationCap className="w-4 h-4" />,
  community: <CircleHelp className="w-4 h-4" />,
  system: <ShieldCheck className="w-4 h-4" />,
};

export const NotificationsPage: React.FC = () => {
  const { role } = useAuth();
  const { notifications, unreadCount, isRead, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const filteredNotifications = useMemo(
    () => notifications.filter((item) => filter === 'all' || !isRead(item.id)),
    [filter, isRead, notifications]
  );
  const roleTitle = role === 'participant' ? 'learning' : role === 'instructor' ? 'teaching' : 'platform';

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue mb-1">Your updates</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay up to date with your {roleTitle} activity.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-blue hover:text-navy disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

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
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              aria-pressed={filter === 'unread'}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                filter === 'unread' ? 'bg-soft-blue text-blue' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Bell className="w-3.5 h-3.5" />
            {unreadCount === 0 ? 'You’re all caught up' : `${unreadCount} unread`}
          </span>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Check className="w-7 h-7" />}
            title={filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}
            description={
              filter === 'unread'
                ? 'There are no unread notifications. Check back later for new updates.'
                : 'New updates about your courses and account will appear here.'
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
                      {!read && <span className="h-2 w-2 rounded-full bg-blue" aria-label="Unread" />}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {notification.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{notification.time}</p>
                  </div>
                  {!read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      aria-label={`Mark ${notification.title} as read`}
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
