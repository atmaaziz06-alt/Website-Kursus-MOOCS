import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Video,
  ArrowRight,
  Bookmark,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bell,
  Download,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, StatCard, Badge, Button, ProgressBar, Avatar, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { media, getCourseMedia, getInstructorPhoto } from '../../config/media';
import { mockCourses } from '../../data/mockData';
import { translateCategory } from '../../config/locale';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrolledCourses, isDevEmptyState, toggleDevEmptyState } = useCourses();

  const [courseFilter, setCourseFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  const inProgressCourses = enrolledCourses.filter((c) => !c.isCompleted);
  const completedCourses = enrolledCourses.filter((c) => c.isCompleted);

  const displayedCourses = enrolledCourses.filter((c) => {
    if (courseFilter === 'in-progress') return !c.isCompleted;
    if (courseFilter === 'completed') return c.isCompleted;
    return true;
  });

  // Recharts study breakdown donut data
  const studyData = [
    { name: 'Web Dev', value: 8.0, color: '#2F4BDB' },
    { name: 'UI/UX', value: 3.2, color: '#E08A00' },
    { name: 'Data Prep', value: 1.2, color: '#16A34A' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Dev Toggle for Empty State */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-border text-xs">
        <span className="font-semibold text-slate-600">
          Mode Tampilan: <strong className="text-navy">{isDevEmptyState ? 'Tampilan Kosong Aktif' : 'Tampilan Normal'}</strong>
        </span>
        <button
          type="button"
          onClick={toggleDevEmptyState}
          className="text-xs font-bold text-blue hover:text-navy underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ubah Tampilan Kosong</span>
        </button>
      </div>

      {isDevEmptyState ? (
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
          {/* 1. WELCOME BANNER (Blue gradient rounded-3xl) */}
          <div className="relative bg-gradient-to-r from-blue via-[#263ec2] to-navy rounded-3xl p-6 sm:p-10 text-white shadow-soft-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <span>DASHBOR PESERTA • SEMESTER 2025</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                  Selamat datang kembali, {user?.name?.split(' ')[0] || 'Dian'}! 👋
                </h1>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl">
                  Kamu telah mencapai 72% dari target belajar mingguan. Pertahankan semangatmu dan raih sertifikasi berikutnya!
                </p>

                {/* Inner Translucent Strip */}
                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      Sesi langsung berikutnya: <strong>Diskusi Arsitektur Web</strong> (Hari ini pukul 19.30 WIB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/learn/web-development-bootcamp-2025/les-15')}
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
                    <span className="text-xs font-extrabold">14 Hari Berturut-turut</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FOUR STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Kursus Diikuti"
              value="6 Kursus"
              subtext="2 sedang berlangsung"
              icon={<BookOpen className="w-5 h-5" />}
              iconVariant="soft-blue"
            />
            <StatCard
              label="Kursus Selesai"
              value="3 Kursus"
              subtext="3 sertifikat terverifikasi"
              icon={<Award className="w-5 h-5" />}
              iconVariant="green"
            />
            <StatCard
              label="Rata-rata Nilai Kuis"
              value="92.4%"
              subtext="Nilai rata-rata"
              trend={{ value: '+4,2% dari bulan lalu', isPositive: true }}
              icon={<TrendingUp className="w-5 h-5" />}
              iconVariant="orange"
            />
            <StatCard
              label="Jam Belajar"
              value="48,5 jam"
              subtext="12,4 jam minggu ini"
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
                    Total 6
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
                  const courseDetail = mockCourses.find((c) => c.slug === item.courseSlug);
                  const courseMedia = getCourseMedia(item.courseSlug);
                  const instructorPhoto = getInstructorPhoto(
                    courseDetail?.instructor.id || 'john-smith'
                  );

                  return (
                    <Card
                      key={item.courseId}
                      className="p-5 flex flex-col sm:flex-row gap-5 hover:border-blue/30 transition-all"
                    >
                      {/* Image Left with Category Tag */}
                      <div className="relative w-full sm:w-44 h-32 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={courseMedia.thumbnail}
                          alt={courseDetail?.title || item.courseSlug}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="technology" size="xs">
                            {translateCategory(courseDetail?.category || 'Development')}
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
                                src={instructorPhoto}
                                name={courseDetail?.instructor.name || 'John Smith'}
                                size="xs"
                              />
                              <span className="text-xs font-semibold text-slate-500">
                                {courseDetail?.instructor.name || 'John Smith'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-orange"
                              aria-label="Simpan kursus"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Bold Title */}
                          <h3 className="text-sm sm:text-base font-bold text-text-heading mb-1 line-clamp-1">
                            {courseDetail?.title}
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
                  <h3 className="text-sm font-bold text-text-heading">Tenggat & Kuis</h3>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {/* Quiz item with red deadline & orange Start Quiz */}
                  <div className="p-3.5 rounded-xl border border-red/20 bg-red-tint/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red">Besok, 23.59</span>
                      <Badge variant="orange" size="xs">Kuis Modul 4</Badge>
                    </div>
                    <h4 className="text-xs font-bold text-text-heading mb-2">
                      React Hooks & State Management
                    </h4>
                    <Button
                      variant="orange"
                      size="sm"
                      fullWidth
                      onClick={() => navigate('/quiz/quiz-react-hooks')}
                    >
                      Mulai Kuis
                    </Button>
                  </div>

                  {/* Assignment item with Details */}
                  <div className="p-3.5 rounded-xl border border-border bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-semibold">Jumat, 18.00</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Tugas</span>
                    </div>
                    <h4 className="text-xs font-bold text-text-heading mb-2">
                      Proyek Akhir REST API Blog Full-Stack
                    </h4>
                    <Button variant="outline" size="sm" fullWidth>
                      Rincian
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Card 2: Recent Alerts */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Pemberitahuan Terbaru</h3>
                  <Bell className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="font-bold text-text-heading">Solusi Kode Modul 4 Telah Terbit</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">2 jam lalu</div>
                    </div>
                    <button type="button" className="text-[11px] font-semibold text-blue hover:underline">
                      Tandai dibaca
                    </button>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="font-bold text-text-heading">Tautan Sesi Tanya Jawab Aktif</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">5 jam lalu</div>
                    </div>
                    <button type="button" className="text-[11px] font-semibold text-blue hover:underline">
                      Tandai dibaca
                    </button>
                  </div>

                  <div className="flex items-start gap-3 text-xs opacity-70">
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-600">Kuis 03 Dinilai (Lulus 95%)</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">Kemarin</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 3: Weekly Study Breakdown (Donut Chart) */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Rincian Belajar Mingguan</h3>
                  <span className="text-xs text-slate-400 font-semibold">Target: 15 jam</span>
                </div>

                <div className="relative h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studyData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {studyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-extrabold text-text-heading">12.4h</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tercatat</span>
                  </div>
                </div>

                {/* Legend: Web Dev 8.0h / UI/UX 3.2h / Data Prep 1.2h */}
                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-border">
                  <div>
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-blue" />
                      <span className="text-[11px] font-bold text-slate-700">Pengembangan Web</span>
                    </div>
                    <span className="text-xs text-slate-500">8,0 jam</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-orange" />
                      <span className="text-[11px] font-bold text-slate-700">UI/UX</span>
                    </div>
                    <span className="text-xs text-slate-500">3,2 jam</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-green" />
                      <span className="text-[11px] font-bold text-slate-700">Persiapan Data</span>
                    </div>
                    <span className="text-xs text-slate-500">1,2 jam</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
