import { UserRole } from '../types';

export type NotificationKind = 'course' | 'achievement' | 'community' | 'system';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
}

export const notificationsByRole: Record<UserRole, NotificationItem[]> = {
  participant: [
    {
      id: 'course-progress',
      kind: 'course',
      title: 'Continue your Web Development course',
      description: 'You are making great progress. Pick up where you left off in React Hooks.',
      time: '2 hours ago',
    },
    {
      id: 'quiz-score',
      kind: 'achievement',
      title: 'Your quiz result is ready',
      description: 'Your latest assessment score has been added to your learning record.',
      time: 'Yesterday',
    },
    {
      id: 'weekly-goal',
      kind: 'system',
      title: 'Your weekly learning goal is waiting',
      description: 'Complete one more lesson to reach this week’s learning target.',
      time: '2 days ago',
    },
  ],
  instructor: [
    {
      id: 'new-enrollments',
      kind: 'community',
      title: 'New students joined your course',
      description: '12 learners enrolled in Web Development Bootcamp this week.',
      time: '1 hour ago',
    },
    {
      id: 'grading-queue',
      kind: 'course',
      title: 'Assessments are ready to review',
      description: 'There are new quiz submissions waiting in your grading queue.',
      time: '4 hours ago',
    },
    {
      id: 'course-review',
      kind: 'system',
      title: 'Course review update',
      description: 'Your latest course update has been received and is under review.',
      time: 'Yesterday',
    },
    {
      id: 'student-question',
      kind: 'community',
      title: 'A student asked a question',
      description: 'A learner posted a new question in your course discussion.',
      time: '2 days ago',
    },
  ],
  admin: [
    {
      id: 'pending-courses',
      kind: 'course',
      title: 'Courses need your review',
      description: '12 courses are waiting for approval in the review queue.',
      time: '30 minutes ago',
    },
    {
      id: 'new-instructors',
      kind: 'community',
      title: 'Instructor verification requested',
      description: '8 instructor accounts are waiting for verification.',
      time: '3 hours ago',
    },
    {
      id: 'system-status',
      kind: 'system',
      title: 'System health report is ready',
      description: 'The latest platform operations report is available to review.',
      time: 'Yesterday',
    },
  ],
};
