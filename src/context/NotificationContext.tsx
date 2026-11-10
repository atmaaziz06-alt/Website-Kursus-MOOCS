import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { NotificationItem, notificationsByRole } from '../data/notifications';
import { UserRole } from '../types';

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isRead: (notificationId: string) => boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const loadReadNotifications = (role: UserRole): string[] => {
  const saved = localStorage.getItem(`eduspace_read_notifications_${role}`);
  return saved ? saved.split(',').filter(Boolean) : [];
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  const [readByRole, setReadByRole] = useState<Record<UserRole, string[]>>(() => ({
    participant: loadReadNotifications('participant'),
    instructor: loadReadNotifications('instructor'),
    admin: loadReadNotifications('admin'),
  }));
  const notifications = notificationsByRole[role];
  const readIds = readByRole[role];

  useEffect(() => {
    (['participant', 'instructor', 'admin'] as const).forEach((currentRole) => {
      localStorage.setItem(
        `eduspace_read_notifications_${currentRole}`,
        readByRole[currentRole].join(',')
      );
    });
  }, [readByRole]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !readIds.includes(item.id)).length,
      isRead: (notificationId) => readIds.includes(notificationId),
      markAsRead: (notificationId) => {
        setReadByRole((current) => ({
          ...current,
          [role]: current[role].includes(notificationId)
            ? current[role]
            : [...current[role], notificationId],
        }));
      },
      markAllAsRead: () => {
        setReadByRole((current) => ({
          ...current,
          [role]: notifications.map((item) => item.id),
        }));
      },
    }),
    [notifications, readIds, role]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
