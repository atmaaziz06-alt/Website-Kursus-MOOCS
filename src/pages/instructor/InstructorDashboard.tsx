import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  Download,
  Plus,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
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
import { formatIDR } from '../../config/currency';
import { translateCategory, translateLevel } from '../../config/locale';

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { instructorCourses } = useCourses();
  const [timeRange, setTimeRange] = useState<'30days' | '6months' | 'ytd'>('30days');
  const createdCourse = instructorCourses.find((course) => course.id === searchParams.get('created'));

  const chartData = [
    { day: 'Hari 1', enrollments: 120 },
    { day: 'Hari 5', enrollments: 180 },
    { day: 'Hari 10', enrollments: 240 },
    { day: 'Hari 15', enrollments: 210 },
    { day: 'Hari 20', enrollments: 320 },
    { day: 'Hari 25', enrollments: 280 },
    { day: 'Hari 30', enrollments: 305 },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              Selamat datang kembali, John!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-tint text-orange-dark text-xs font-bold uppercase">
              MUSIM PANAS 2025
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau kinerja kurikulum, keterlibatan peserta, dan antrean penilaian.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
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
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="TOTAL KURSUS"
          value="12"
          subtext="2 draf menunggu peninjauan silabus"
          icon={<BookOpen className="w-5 h-5" />}
          iconVariant="soft-blue"
        />
        <StatCard
          label="TOTAL PESERTA"
          value="3,480"
          subtext="pertumbuhan dibanding bulan lalu"
          trend={{ value: '+18.4%', isPositive: true }}
          icon={<Users className="w-5 h-5" />}
          iconVariant="navy"
        />
        <StatCard
          label="KURSUS TERBIT"
          value="8"
          subtext="Tersedia di katalog kursus"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconVariant="green"
        />
        <StatCard
          label="RATA-RATA NILAI KUIS"
          value="86.5%"
          subtext="Dari total 1.420 jawaban"
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
                    +1.240 peserta
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Jumlah peserta baru pada 8 bootcamp aktif yang telah diterbitkan.
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
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
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
              <div className="absolute top-2 right-24 bg-white border border-border shadow-soft rounded-lg px-2.5 py-1 text-[11px] font-bold text-navy flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                <span>Puncak: 320 per hari</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Cohort Attention Card */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-heading">PERHATIAN PESERTA</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-tint text-orange-dark text-[10px] font-extrabold uppercase">
                Perlu Tindakan
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-text-heading">Pertanyaan Forum Belum Dijawab</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange text-white text-xs font-bold">
                    4 Menunggu
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Pertanyaan di forum diskusi arsitektur React Hooks Modul 4.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/instructor/courses/course-web-dev-2025')}
                >
                  Buka Antrean Forum
                </Button>
              </div>

              {/* Educational Tip Box */}
              <div className="p-4 rounded-xl bg-soft-blue/40 border border-blue/20 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center gap-1.5 text-blue font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Wawasan Retensi</span>
                </div>
                Respons cepat dalam 2 jam dapat meningkatkan retensi peserta dan kelulusan bootcamp hingga <strong>24%</strong>.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
