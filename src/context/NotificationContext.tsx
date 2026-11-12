import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type NotificationKind = 'course' | 'achievement' | 'community' | 'system';
export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
  readAt: string | null;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isRead: (notificationId: string) => boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
const kinds: NotificationKind[] = ['course', 'achievement', 'community', 'system'];

const formatTimeAgo = (value: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Kemarin' : `${days} hari lalu`;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await requireSupabase().from('notifications')
        .select('id, kind, title, body, read_at, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
      if (queryError) throw new Error(getErrorMessage(queryError));
      setNotifications((data ?? []).map((item) => ({
        id: item.id,
        kind: kinds.includes(item.kind as NotificationKind) ? item.kind as NotificationKind : 'system',
        title: item.title,
        description: item.body,
        time: formatTimeAgo(item.created_at),
        readAt: item.read_at,
      })));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      throw loadError;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    void refreshNotifications().catch(() => undefined);
  }, [refreshNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await requireSupabase().from('notifications')
      .update({ read_at: readAt }).eq('id', notificationId).eq('user_id', user.id).is('read_at', null);
    if (updateError) {
      setError(getErrorMessage(updateError));
      throw new Error(getErrorMessage(updateError));
    }
    setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, readAt } : item));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await requireSupabase().from('notifications')
      .update({ read_at: readAt }).eq('user_id', user.id).is('read_at', null);
    if (updateError) {
      setError(getErrorMessage(updateError));
      throw new Error(getErrorMessage(updateError));
    }
    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
  };

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.readAt).length,
    isLoading,
    error,
    isRead: (notificationId) => Boolean(notifications.find((item) => item.id === notificationId)?.readAt),
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  }), [error, isLoading, notifications, refreshNotifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
