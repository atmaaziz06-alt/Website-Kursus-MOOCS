import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentQuizResults } from './pages/student/StudentQuizResults';

// Learning & Quiz Rooms
import { LessonLearnPage } from './pages/learn/LessonLearnPage';
import { QuizRoomPage } from './pages/quiz/QuizRoomPage';
import { QuizResultPage } from './pages/quiz/QuizResultPage';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { InstructorCourseCreate } from './pages/instructor/InstructorCourseCreate';
import { InstructorCourseManage } from './pages/instructor/InstructorCourseManage';
import { InstructorStudents } from './pages/instructor/InstructorStudents';
import { InstructorMessages } from './pages/instructor/InstructorMessages';
import { InstructorQuizResults } from './pages/instructor/InstructorQuizResults';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCoursesReview } from './pages/admin/AdminCoursesReview';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CourseProvider>
          <BrowserRouter>
            <Routes>
            {/* 1. Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
            </Route>

            {/* 2. Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 3. Learn & Quiz Rooms (Distraction-free layouts) */}
            <Route path="/learn/:courseSlug/:lessonId" element={<LessonLearnPage />} />
            <Route path="/quiz/:quizId" element={<QuizRoomPage />} />
            <Route path="/quiz/:quizId/result" element={<QuizResultPage />} />

            {/* 4. Student Dashboard Area */}
            <Route element={<ProtectedRoute allowedRoles={['participant']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<StudentCourses />} />
                <Route path="/student/quiz-results" element={<StudentQuizResults />} />
                <Route path="/student/notifications" element={<NotificationsPage />} />
                <Route path="/student/settings" element={<AccountSettingsPage />} />
              </Route>
            </Route>

            {/* 5. Instructor Dashboard Area */}
            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/instructor/courses/new" element={<InstructorCourseCreate />} />
                <Route path="/instructor/courses/:id" element={<InstructorCourseManage />} />
                <Route path="/instructor/students" element={<InstructorStudents />} />
                <Route path="/instructor/messages/:studentId" element={<InstructorMessages />} />
                <Route path="/instructor/quiz-results" element={<InstructorQuizResults />} />
                <Route path="/instructor/notifications" element={<NotificationsPage />} />
                <Route path="/instructor/settings" element={<AccountSettingsPage />} />
              </Route>
            </Route>

            {/* 6. Admin Dashboard Area */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/courses-review" element={<AdminCoursesReview />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                <Route path="/admin/settings" element={<AccountSettingsPage />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CourseProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
