import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Video,
  ArrowRight,
  Bookmark,
  Bell,
  Download,
  Flame,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, StatCard, Badge, Button, ProgressBar, Avatar, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { media, getCourseMedia } from '../../config/media';
import { translateCategory } from '../../config/locale';
import { useNotifications } from '../../context/NotificationContext';
import { downloadPrintableCertificate } from '../../utils/download';
import { getErrorMessage } from '../../lib/errors';
import { getStudentDashboardAnalytics, type StudentDashboardAnalytics } from '../../services/dashboardService';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrolledCourses, savedCourseSlugs, toggleSavedCourse, isLoading, error: coursesError } = useCourses();
  const { notifications, isRead, markAsRead } = useNotifications();

  const [courseFilter, setCourseFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [bookmarkError, setBookmarkError] = useState('');
  const [dashboardAnalytics, setDashboardAnalytics] = useState<StudentDashboardAnalytics>({
    averageQuizScore: null,
    totalStudyHours: 0,
    weeklyStudyHours: 0,
    streakDays: 0,
    studyByCategory: [],
  });
  const [dashboardAnalyticsError, setDashboardAnalyticsError] = useState('');
  const [dashboardAnalyticsLoading, setDashboardAnalyticsLoading] = useState(true);
  const courseIdsKey = enrolledCourses.map((course) => course.courseId).sort().join(',');

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    void getStudentDashboardAnalytics(user.id).then((result) => {
      if (active) {
        setDashboardAnalytics(result);
        setDashboardAnalyticsError('');
      }
    }).catch((error: unknown) => {
      if (active) setDashboardAnalyticsError(getErrorMessage(error));
    }).finally(() => {
      if (active) setDashboardAnalyticsLoading(false);
    });
    return () => { active = false; };
  }, [courseIdsKey, user?.id]);

  const toggleBookmark = async (courseSlug: string) => {
    setBookmarkError('');
    try {
      await toggleSavedCourse(courseSlug);
    } catch (error) {
      setBookmarkError(error instanceof Error ? error.message : 'Kursus gagal disimpan.');
    }
  };

  const inProgressCourses = enrolledCourses.filter((c) => !c.isCompleted);
  const completedCourses = enrolledCourses.filter((c) => c.isCompleted);

  const displayedCourses = enrolledCourses.filter((c) => {
    if (courseFilter === 'in-progress') return !c.isCompleted;
    if (courseFilter === 'completed') return c.isCompleted;
    return true;
  });

  const studyData = dashboardAnalytics.studyByCategory.map((category) => ({
    name: category.name,
    value: category.hours,
    color: category.color,
  }));
  const formatHours = (hours: number) => `${hours.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {coursesError && (
        <p role="alert" className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">
          Gagal memuat data kursus: {coursesError}
        </p>
      )}
      {bookmarkError && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">{bookmarkError}</p>}

      {isLoading ? (
        <Card className="p-12 text-center text-sm text-slate-500">Memuat data kursus...</Card>
      ) : enrolledCourses.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            title="Kamu belum mengikuti kursus apa pun"
            description="Jelajahi lebih dari 1.200 kursus dan bootcamp terakreditasi industri untuk memulai perjalanan belajarmu."
            primaryAction={{
              label: 'Jelajahi Kursus →',
              onClick: () => navigate('/courses'),
            }}
            secondaryAction={{
              label: 'Jelajahi Jalur Belajar',
              onClick: () => navigate('/courses'),
            }}
          />
        </Card>
      ) : (
        <>
          {dashboardAnalyticsError && (
            <p role="alert" className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">
              Gagal memuat statistik belajar: {dashboardAnalyticsError}
            </p>
          )}
          {/* 1. WELCOME BANNER (Blue gradient rounded-3xl) */}
          <div className="relative bg-gradient-to-r from-blue via-[#263ec2] to-navy rounded-3xl p-6 sm:p-10 text-white shadow-soft-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <span>DASHBOR PESERTA</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                  Selamat datang kembali, {user?.name?.split(' ')[0] || 'Peserta'}! 👋
                </h1>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl">
                  {dashboardAnalyticsLoading
                    ? 'Memuat ringkasan aktivitas belajarmu...'
                    : `Kamu memiliki ${inProgressCourses.length} kursus yang sedang berlangsung dan telah belajar ${formatHours(dashboardAnalytics.weeklyStudyHours)} minggu ini.`}
                </p>

                {/* Inner Translucent Strip */}
                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {dashboardAnalytics.streakDays > 0
                        ? <>Konsistensi belajarmu: <strong>{dashboardAnalytics.streakDays} hari berturut-turut</strong></>
                        : <>Belum ada aktivitas belajar beruntun. Lanjutkan materi untuk membangun konsistensi.</>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextCourse = inProgressCourses[0];
                      if (nextCourse?.currentLessonId) navigate(`/learn/${nextCourse.courseSlug}/${nextCourse.currentLessonId}`);
                      else navigate('/courses');
                    }}
                    className="text-xs font-bold text-orange hover:text-white transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Gabung Sesi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column (4 cols) - Student Portrait with floating streak card */}
              <div className="lg:col-span-4 hidden lg:flex justify-end relative">
                <div className="relative w-44 h-44 rounded-3xl overflow-hidden border-4 border-white/40 shadow-soft-lg">
                  <img
                    src={media.hero.studentPortrait}
                    alt="Foto Peserta"
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Streak Card */}
                  <div className="absolute bottom-2 right-2 bg-white text-navy px-3 py-1.5 rounded-xl shadow-md border border-border flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange fill-orange" />
                    <span className="text-xs font-extrabold">{dashboardAnalytics.streakDays} Hari Berturut-turut</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FOUR STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Kursus Diikuti"
              value={`${enrolledCourses.length} Kursus`}
              subtext={`${inProgressCourses.length} sedang berlangsung`}
              icon={<BookOpen className="w-5 h-5" />}
              iconVariant="soft-blue"
            />
            <StatCard
              label="Kursus Selesai"
              value={`${completedCourses.length} Kursus`}
              subtext={`${completedCourses.length} kursus selesai`}
              icon={<Award className="w-5 h-5" />}
              iconVariant="green"
            />
            <StatCard
              label="Rata-rata Nilai Kuis"
              value={dashboardAnalyticsLoading ? '...' : dashboardAnalytics.averageQuizScore === null ? '—' : `${dashboardAnalytics.averageQuizScore}%`}
              subtext="Rata-rata percobaan kuis terkirim"
              icon={<TrendingUp className="w-5 h-5" />}
              iconVariant="orange"
            />
            <StatCard
              label="Jam Belajar"
              value={dashboardAnalyticsLoading ? '...' : formatHours(dashboardAnalytics.totalStudyHours)}
              subtext={dashboardAnalyticsLoading ? 'Memuat...' : `${formatHours(dashboardAnalytics.weeklyStudyHours)} minggu ini`}
              icon={<Clock className="w-5 h-5" />}
              iconVariant="navy"
            />
          </div>

          {/* 3. MAIN TWO COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): My Enrolled Courses */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-extrabold text-text-heading">
                    Kursus yang Saya Ikuti
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-xs font-bold">
                    Total {enrolledCourses.length}
                  </span>
                </div>

                {/* Segmented Tabs: All (6) / In Progress (3) / Completed (3) */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-border text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCourseFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      courseFilter === 'all'
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    Semua ({enrolledCourses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseFilter('in-progress')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      courseFilter === 'in-progress'
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    Sedang Berlangsung ({inProgressCourses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      courseFilter === 'completed'
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    Selesai ({completedCourses.length})
                  </button>
                </div>
              </div>

              {/* Course Horizontal Cards */}
              <div className="space-y-4">
                {displayedCourses.map((item) => {
                  const thumbnail = item.thumbnailUrl || getCourseMedia(item.courseSlug).thumbnail;

                  return (
                    <Card
                      key={item.courseId}
                      className="p-5 flex flex-col sm:flex-row gap-5 hover:border-blue/30 transition-all"
                    >
                      {/* Image Left with Category Tag */}
                      <div className="relative w-full sm:w-44 h-32 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={thumbnail}
                          alt={item.courseTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="technology" size="xs">
                            {translateCategory(item.category)}
                          </Badge>
                        </div>
                      </div>

                      {/* Right Side Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Instructor row & bookmark */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={item.instructorAvatarUrl}
                                name={item.instructorName}
                                size="xs"
                              />
                              <span className="text-xs font-semibold text-slate-500">
                                {item.instructorName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => void toggleBookmark(item.courseSlug)}
                              className={savedCourseSlugs.includes(item.courseSlug) ? 'text-orange' : 'text-slate-400 hover:text-orange'}
                              aria-label={savedCourseSlugs.includes(item.courseSlug) ? 'Hapus kursus tersimpan' : 'Simpan kursus'}
                            >
                              <Bookmark className={`w-4 h-4 ${savedCourseSlugs.includes(item.courseSlug) ? 'fill-orange' : ''}`} />
                            </button>
                          </div>

                          {/* Bold Title */}
                          <h3 className="text-sm sm:text-base font-bold text-text-heading mb-1 line-clamp-1">
                            {item.courseTitle}
                          </h3>

                          {/* Current Module line in blue */}
                          <p className="text-xs font-semibold text-blue mb-3 truncate">
                            {item.isCompleted ? 'Kursus telah diselesaikan' : item.currentLessonTitle}
                          </p>

                          {/* Thin progress bar */}
                          <ProgressBar
                            progress={item.progressPercent}
                            color={item.isCompleted ? 'green' : 'blue'}
                            size="xs"
                            className="mb-2"
                          />

                          {/* Meta line */}
                          <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                            <span>
                              <strong>{item.progressPercent}%</strong> Selesai
                            </span>
                            <span>
                              {item.completedLessons}/{item.totalLessons} Pelajaran Selesai
                            </span>
                            <span>{item.remainingHours} tersisa</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 border-t border-border mt-3 flex items-center justify-end gap-3">
                          {item.isCompleted ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/courses/${item.courseSlug}`)}
                              >
                                Tinjau Silabus
                              </Button>
                              <Button
                                variant="navy"
                                size="sm"
                                onClick={() => downloadPrintableCertificate(user?.name || 'Peserta EduSpace', item.courseTitle)}
                                leftIcon={<Download className="w-3.5 h-3.5" />}
                              >
                                Unduh Sertifikat
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="navy"
                              size="sm"
                              onClick={() => navigate(`/learn/${item.courseSlug}/${item.currentLessonId}`)}
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            >
                              Lanjutkan Belajar
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right Column (4 cols): Deadlines, Alerts, Weekly Breakdown */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Deadlines & Quizzes */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Lanjutkan Belajar</h3>
                  <BookOpen className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {inProgressCourses.slice(0, 3).map((course) => (
                    <div key={course.courseId} className="rounded-xl border border-border bg-slate-50/70 p-3.5">
                      <p className="text-xs font-bold text-text-heading">{course.courseTitle}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{course.currentLessonTitle}</p>
                      <Button
                        variant="orange"
                        size="sm"
                        fullWidth
                        className="mt-3"
                        onClick={() => {
                          if (course.currentLessonId) navigate(`/learn/${course.courseSlug}/${course.currentLessonId}`);
                          else navigate(`/courses/${course.courseSlug}`);
                        }}
                      >
                        Lanjutkan materi
                      </Button>
                    </div>
                  ))}
                  {!inProgressCourses.length && (
                    <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                      Semua kursusmu telah selesai. Jelajahi kursus lain untuk melanjutkan belajar.
                    </p>
                  )}
                </div>
              </Card>

              {/* Card 2: Recent Alerts */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Pemberitahuan Terbaru</h3>
                  <Bell className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => {
                    const read = isRead(notification.id);
                    return (
                      <div key={notification.id} className={`flex items-start gap-3 text-xs ${read ? 'opacity-70' : ''}`}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? 'bg-slate-300' : 'bg-blue'}`} />
                        <div className="flex-1">
                          <div className={`font-bold ${read ? 'text-slate-600' : 'text-text-heading'}`}>{notification.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{notification.time}</div>
                        </div>
                        {!read && (
                          <button type="button" onClick={() => markAsRead(notification.id)} className="text-[11px] font-semibold text-blue hover:underline">
                            Tandai dibaca
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => navigate('/student/notifications')} className="text-xs font-bold text-blue hover:underline">
                    Lihat semua notifikasi →
                  </button>
                </div>
              </Card>

              {/* Card 3: Weekly Study Breakdown (Donut Chart) */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Rincian Belajar Mingguan</h3>
                  <span className="text-xs text-slate-400 font-semibold">{formatHours(dashboardAnalytics.weeklyStudyHours)}</span>
                </div>

                <div className="relative h-44 w-full flex items-center justify-center">
                  {studyData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={studyData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                          {studyData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="px-8 text-center text-xs text-slate-400">
                      Belum ada materi yang diselesaikan minggu ini.
                    </p>
                  )}
                  {/* Center Text inside Donut */}
                  {studyData.length > 0 && <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-extrabold text-text-heading">
                      {dashboardAnalytics.weeklyStudyHours.toLocaleString('id-ID', { maximumFractionDigits: 1 })}j
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tercatat</span>
                  </div>}
                </div>

                <div className="space-y-2 pt-3 border-t border-border">
                  {studyData.length ? studyData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-2 text-slate-700">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="shrink-0 text-slate-500">{formatHours(category.value)}</span>
                    </div>
                  )) : (
                    <p className="text-center text-xs text-slate-400">Rincian kategori akan muncul setelah materi selesai.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
