import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Download,
  Plus,
  Upload,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, StatCard, Button } from '../../components/ui';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../config/currency';
import { translateCategory, translateLevel } from '../../config/locale';
import { downloadCSV } from '../../utils/download';
import { getErrorMessage } from '../../lib/errors';
import { getInstructorDashboardAnalytics, type InstructorDashboardAnalytics } from '../../services/dashboardService';

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { instructorCourses } = useCourses();
  const [timeRange, setTimeRange] = useState<'30days' | '6months' | 'ytd'>('30days');
  const [analytics, setAnalytics] = useState<InstructorDashboardAnalytics>({
    totalEnrollments: 0,
    quizSubmissionCount: 0,
    averageQuizScore: null,
    enrollmentHistory: [],
  });
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [chartReferenceDate] = useState(() => new Date());
  const createdCourse = instructorCourses.find((course) => course.id === searchParams.get('created'));
  const courseIdsKey = instructorCourses.map((course) => course.id).sort().join(',');
  const courseIds = useMemo(() => courseIdsKey ? courseIdsKey.split(',') : [], [courseIdsKey]);
  const publishedCourses = instructorCourses.filter((course) => course.status === 'Published').length;
  const pendingCourses = instructorCourses.filter((course) => course.status === 'Pending review').length;

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    void getInstructorDashboardAnalytics(user.id, courseIds).then((result) => {
      if (active) {
        setAnalytics(result);
        setAnalyticsError('');
      }
    }).catch((error: unknown) => {
      if (active) setAnalyticsError(getErrorMessage(error));
    }).finally(() => {
      if (active) setAnalyticsLoading(false);
    });
    return () => { active = false; };
  }, [courseIds, user?.id]);

  const chartData = useMemo(() => {
    const now = chartReferenceDate;
    const start = new Date(now);
    if (timeRange === '30days') {
      start.setUTCDate(start.getUTCDate() - 29);
      start.setUTCHours(0, 0, 0, 0);
      const dailyCounts = new Map<string, number>();
      for (const enrollment of analytics.enrollmentHistory) {
        const key = new Date(enrollment.date).toISOString().slice(0, 10);
        dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
      }
      return Array.from({ length: 30 }, (_, index) => {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + index);
        const key = date.toISOString().slice(0, 10);
        return {
          period: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
          enrollments: dailyCounts.get(key) ?? 0,
        };
      });
    }

    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    if (timeRange === '6months') start.setUTCMonth(now.getUTCMonth() - 5);
    else start.setUTCMonth(0);
    const monthCounts = new Map<string, number>();
    for (const enrollment of analytics.enrollmentHistory) {
      const date = new Date(enrollment.date);
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
    const periods = timeRange === '6months' ? 6 : now.getUTCMonth() + 1;
    return Array.from({ length: periods }, (_, index) => {
      const date = new Date(start);
      date.setUTCMonth(start.getUTCMonth() + index);
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      return {
        period: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        enrollments: monthCounts.get(key) ?? 0,
      };
    });
  }, [analytics.enrollmentHistory, chartReferenceDate, timeRange]);
  const peakEnrollments = chartData.reduce((peak, point) => Math.max(peak, point.enrollments), 0);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              Selamat datang kembali, {user?.name?.split(' ')[0] ?? 'Pengajar'}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-tint text-orange-dark text-xs font-bold uppercase">
              PUSAT PENGAJAR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau kinerja kurikulum, keterlibatan peserta, dan antrean penilaian.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV('kursus-pengajar.csv', [
              ['ID', 'Judul Kursus', 'Kategori', 'Tingkat', 'Durasi', 'Harga', 'Status'],
              ...instructorCourses.map((course) => [
                course.id,
                course.title,
                translateCategory(course.category),
                translateLevel(course.level),
                course.duration,
                formatIDR(course.price),
                course.status,
              ]),
            ])}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Ekspor CSV
          </Button>
          <Button
            variant="orange"
            size="sm"
            onClick={() => navigate('/instructor/courses/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Buat Kursus
          </Button>
        </div>
      </div>

      {createdCourse && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-green/20 bg-green-tint/50 p-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green" />
          <div>
            <p className="text-sm font-bold text-text-heading">
              {createdCourse.status === 'Published' ? 'Kursus berhasil diterbitkan' : 'Draf tersimpan'}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">{createdCourse.title}</p>
          </div>
        </div>
      )}
      {analyticsError && (
        <p role="alert" className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">
          Gagal memuat analitik pengajar: {analyticsError}
        </p>
      )}

      {instructorCourses.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-base font-bold text-text-heading">Kursusmu</h2>
              <p className="mt-1 text-xs text-slate-500">Kursus dan draf yang telah kamu buat.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/instructor/courses/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Buat Kursus
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {instructorCourses.map((course) => (
              <li key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-text-heading">{course.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {translateCategory(course.category)} · {translateLevel(course.level)} · {course.duration} · {formatIDR(course.price)}
                  </p>
                </div>
                <span
                  className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    course.status === 'Published'
                      ? 'bg-green-tint text-green'
                      : 'bg-orange-tint text-orange-dark'
                  }`}
                >
                  {course.status === 'Published' ? 'Terbit' : 'Draf'}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/instructor/courses/${course.id}`)}
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                >
                  Kelola materi
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="TOTAL KURSUS"
          value={String(instructorCourses.length)}
          subtext={`${pendingCourses} menunggu peninjauan`}
          icon={<BookOpen className="w-5 h-5" />}
          iconVariant="soft-blue"
        />
        <StatCard
          label="PENDAFTARAN PESERTA"
          value={analyticsLoading ? '...' : analytics.totalEnrollments.toLocaleString('id-ID')}
          subtext="Pada seluruh kursusmu"
          icon={<Users className="w-5 h-5" />}
          iconVariant="navy"
        />
        <StatCard
          label="KURSUS TERBIT"
          value={String(publishedCourses)}
          subtext="Tersedia di katalog kursus"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconVariant="green"
        />
        <StatCard
          label="RATA-RATA NILAI KUIS"
          value={analyticsLoading ? '...' : analytics.averageQuizScore === null ? '—' : `${analytics.averageQuizScore}%`}
          subtext={`${analyticsLoading ? '...' : analytics.quizSubmissionCount.toLocaleString('id-ID')} pengumpulan`}
          icon={<Award className="w-5 h-5" />}
          iconVariant="orange"
        />
      </div>

      {/* Main Grid: Student Enrollments Chart + Cohort Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Student Enrollments Chart */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-text-heading">
                    Pendaftaran Peserta
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-tint text-green text-[11px] font-bold">
                  {analyticsLoading ? '...' : `${analytics.totalEnrollments.toLocaleString('id-ID')} pendaftaran`}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Pendaftaran baru pada kursusmu berdasarkan periode yang dipilih.
                </p>
              </div>

              {/* Timeframe Toggle: 30 Days / 6 Months / Year to Date */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold border border-border">
                <button
                  type="button"
                  onClick={() => setTimeRange('30days')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === '30days' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  30 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('6months')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === '6months' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  6 Bulan
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('ytd')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === 'ytd' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Sejak Awal Tahun
                </button>
              </div>
            </div>

            {/* Area Chart with Peak Annotation */}
            <div className="relative h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F4BDB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2F4BDB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07164F',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      border: '1px solid #263A7A',
                    }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 700 }}
                    itemStyle={{ color: '#FFFFFF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#2F4BDB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#enrollmentGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Peak Annotation pill */}
              {peakEnrollments > 0 && <div className="absolute top-2 right-24 bg-white border border-border shadow-soft rounded-lg px-2.5 py-1 text-[11px] font-bold text-navy flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                <span>Puncak: {peakEnrollments} pendaftaran</span>
              </div>}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Cohort Attention Card */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-text-heading">AKSES CEPAT</h3>
            <p className="mt-2 text-xs text-slate-500">Tindak lanjuti peserta dan hasil kuis berdasarkan data kursusmu.</p>
            <div className="mt-5 space-y-3">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/instructor/students')}>
                Lihat daftar peserta
              </Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/instructor/quiz-results')}>
                Buka analitik kuis
              </Button>
              <Button variant="orange" size="sm" fullWidth onClick={() => navigate('/instructor/messages')}>
                Pesan peserta
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
