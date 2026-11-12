import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Download,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Card, StatCard, Button, Badge, Avatar } from '../../components/ui';
import { getCourseMedia } from '../../config/media';
import { translateCategory } from '../../config/locale';
import { downloadCSV } from '../../utils/download';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';
import { getAdminGrowthHistory, type AdminGrowthPoint } from '../../services/dashboardService';

type DashboardSummary = {
  users_by_role: Record<string, number>;
  courses_by_status: Record<string, number>;
  enrollments: number;
};

type PendingCourse = {
  id: string;
  title: string;
  slug: string;
  teacherName: string;
  categoryName: string;
};

const emptySummary: DashboardSummary = {
  users_by_role: {},
  courses_by_status: {},
  enrollments: 0,
};

const parseDashboardSummary = (value: unknown): DashboardSummary => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptySummary;
  const record = value as Record<string, unknown>;
  const numberMap = (item: unknown): Record<string, number> => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return {};
    return Object.fromEntries(
      Object.entries(item).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
    );
  };
  return {
    users_by_role: numberMap(record.users_by_role),
    courses_by_status: numberMap(record.courses_by_status),
    enrollments: typeof record.enrollments === 'number' ? record.enrollments : 0,
  };
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRoleTab, setUserRoleTab] = useState<'all' | 'instructors' | 'students'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewCategory, setReviewCategory] = useState('all');
  const [summary, setSummary] = useState(emptySummary);
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
  const [recentUsers, setRecentUsers] = useState<Array<{
    id: string;
    email: string;
    full_name: string;
    role: 'participant' | 'instructor' | 'admin';
    created_at: string;
  }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; percent: number; color: string }>>([]);
  const [growthData, setGrowthData] = useState<AdminGrowthPoint[]>([]);
  const [dashboardError, setDashboardError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const totalUsers = Object.values(summary.users_by_role).reduce((total, count) => total + count, 0);
  const totalInstructors = summary.users_by_role.instructor ?? 0;
  const totalCourses = Object.values(summary.courses_by_status).reduce((total, count) => total + count, 0);
  const publishedCourses = summary.courses_by_status.published ?? 0;
  const archivedCourses = summary.courses_by_status.archived ?? 0;
  const pendingCourseCount = summary.courses_by_status.pending_review ?? 0;
  const filteredPendingCourses = pendingCourses.filter((course) => {
    const matchesSearch = `${course.title} ${course.teacherName}`.toLocaleLowerCase().includes(reviewSearch.toLocaleLowerCase());
    const matchesCategory = reviewCategory === 'all' || course.categoryName === reviewCategory;
    return matchesSearch && matchesCategory;
  });
  const retentionData = growthData
    .filter((point) => point.retentionMonth1Percent !== null || point.retentionMonth2Percent !== null)
    .map((point) => ({
      month: point.month,
      retentionMonth1Percent: point.retentionMonth1Percent,
      retentionMonth2Percent: point.retentionMonth2Percent,
    }));

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setDashboardError('');
      try {
        const client = requireSupabase();
        const [summaryResult, usersResult, pendingResult, courseCategoriesResult, categoriesResult, historyResult] = await Promise.all([
          client.rpc('admin_dashboard_summary'),
          client.rpc('admin_list_users', {
            p_search: '',
            p_role: null,
            p_active: null,
            p_limit: 5,
            p_offset: 0,
          }),
          client.from('courses')
            .select('id,title,slug,teacher_id,category_id')
            .eq('status', 'pending_review')
            .order('created_at', { ascending: false })
            .limit(1000),
          client.from('courses').select('category_id'),
          client.from('categories').select('id,name').eq('is_active', true),
          getAdminGrowthHistory(),
        ]);
        const failedResult = [summaryResult, usersResult, pendingResult, courseCategoriesResult, categoriesResult]
          .find((result) => result.error);
        if (failedResult?.error) throw new Error(getErrorMessage(failedResult.error));

        const pending = pendingResult.data ?? [];
        const teacherIds = [...new Set(pending.map((course) => course.teacher_id))];
        const categoryIds = [...new Set(pending.map((course) => course.category_id).filter((id): id is string => Boolean(id)))];
        const [teachersResult, pendingCategoriesResult] = await Promise.all([
          teacherIds.length ? client.from('profiles').select('id,full_name').in('id', teacherIds) : Promise.resolve({ data: [], error: null }),
          categoryIds.length ? client.from('categories').select('id,name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
        ]);
        if (teachersResult.error) throw new Error(getErrorMessage(teachersResult.error));
        if (pendingCategoriesResult.error) throw new Error(getErrorMessage(pendingCategoriesResult.error));

        const teachers = new Map((teachersResult.data ?? []).map((teacher) => [teacher.id, teacher.full_name]));
        const categories = new Map((pendingCategoriesResult.data ?? []).map((category) => [category.id, category.name]));
        const categoryCounts = new Map<string, number>();
        for (const course of courseCategoriesResult.data ?? []) {
          if (course.category_id) categoryCounts.set(course.category_id, (categoryCounts.get(course.category_id) ?? 0) + 1);
        }
        const categoryNames = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
        const colors = ['#2F4BDB', '#E08A00', '#16A34A', '#0B1F8F'];

        if (!active) return;
        setSummary(parseDashboardSummary(summaryResult.data));
        setGrowthData(historyResult);
        setRecentUsers(usersResult.data ?? []);
        setPendingCourses(pending.map((course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          teacherName: teachers.get(course.teacher_id) ?? 'Pengajar',
          categoryName: course.category_id ? categories.get(course.category_id) ?? 'Tanpa kategori' : 'Tanpa kategori',
        })));
        const categoryTotal = [...categoryCounts.values()].reduce((total, count) => total + count, 0);
        setCategoryData([...categoryCounts.entries()].map(([id, value], index) => ({
          name: categoryNames.get(id) ?? 'Tanpa kategori',
          value,
          percent: categoryTotal ? Math.round((value / categoryTotal) * 100) : 0,
          color: colors[index % colors.length],
        })));
      } catch (error) {
        if (active) setDashboardError(getErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-[10px] font-bold uppercase tracking-wider">
              PUSAT KENDALI EDUSPACE
            </span>
            <span className="text-xs text-slate-400 font-mono">            ID Node: ID-JKT-082</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
            Ringkasan Admin & Analitik Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Selamat datang kembali, Admin. Pantau pengelolaan platform, retensi pengguna, dan kepatuhan kurikulum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV('ringkasan-admin.csv', [
              ['Metrik', 'Nilai'],
              ['Total pengguna', String(totalUsers)],
              ['Total pengajar', String(totalInstructors)],
              ['Total kursus', String(totalCourses)],
              ['Kursus aktif', String(publishedCourses)],
              ['Kursus diarsipkan', String(archivedCourses)],
              ['Kursus menunggu peninjauan', String(pendingCourseCount)],
              ['Pendaftaran aktif', String(summary.enrollments)],
            ])}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Ekspor Ringkasan (.CSV)
          </Button>
          <Button
            variant="orange"
            size="sm"
            onClick={() => navigate('/admin/users')}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            + Undang Pengajar Baru
          </Button>
        </div>
      </div>

      {dashboardError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Gagal memuat ringkasan admin: {dashboardError}
        </div>
      )}

      {/* 2. 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="TOTAL PENGGUNA"
          value={isLoading ? '...' : totalUsers.toLocaleString('id-ID')}
          subtext="seluruh akun terdaftar"
          icon={<Users className="w-5 h-5" />}
          iconVariant="green"
        />
        <StatCard
          label="TOTAL PENGAJAR"
          value={isLoading ? '...' : totalInstructors.toLocaleString('id-ID')}
          subtext={`${summary.users_by_role.admin ?? 0} admin platform`}
          icon={<GraduationCap className="w-5 h-5" />}
          iconVariant="navy"
        />
        <StatCard
          label="TOTAL KURSUS"
          value={isLoading ? '...' : totalCourses.toLocaleString('id-ID')}
          subtext={`${publishedCourses} aktif • ${archivedCourses} diarsipkan`}
          icon={<BookOpen className="w-5 h-5" />}
          iconVariant="soft-blue"
        />
        {/* PENDING REVIEWS (Orange-tinted card) */}
        <Card className="p-5 bg-orange-tint/70 border-orange/30 shadow-soft relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-dark block">
                  MENUNGGU PENINJAUAN
                </span>
                <span className="px-1.5 py-0.2 rounded bg-orange text-white text-[9px] font-extrabold uppercase">
                  Tindakan
                </span>
              </div>
              <div className="text-2xl lg:text-3xl font-extrabold text-orange-dark tracking-tight">
                {isLoading ? '...' : pendingCourseCount.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-orange-dark/90 font-medium">
            Kursus menunggu keputusan admin
          </p>
        </Card>
      </div>

      {/* 3. ROW: Current platform snapshot + courses by category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): User Growth Multi-line chart */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-text-heading">
                  Pertumbuhan Pengguna dan Aktivitas Peserta
                </h3>
                <p className="text-xs text-slate-500">
                  Pendaftaran akun dan peserta aktif per bulan dalam 12 bulan terakhir.
                </p>
              </div>
            </div>

            {/* Combined Area + Line Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studentGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F4BDB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2F4BDB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#07164F', borderRadius: '12px', border: '1px solid #263A7A', color: '#fff', fontSize: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                    formatter={(value, name) => [Number(value).toLocaleString('id-ID'), name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="participants"
                    name="Peserta baru"
                    stroke="#2F4BDB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#studentGrowthGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="instructors"
                    name="Pengajar baru"
                    stroke="#E08A00"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeParticipants"
                    name="Peserta aktif"
                    stroke="#16A34A"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <h4 className="text-sm font-bold text-text-heading">Retensi peserta berdasarkan kohor pendaftaran</h4>
              <p className="mt-1 text-xs text-slate-500">
                Persentase peserta yang kembali menyelesaikan materi atau mengirim kuis pada bulan berikutnya. Bulan yang belum selesai tidak dihitung.
              </p>
              {retentionData.length ? (
                <div className="mt-3 h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={10}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value: number) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#07164F', borderRadius: '12px', border: '1px solid #263A7A', color: '#fff', fontSize: '12px' }}
                        formatter={(value, name) => [`${Number(value).toLocaleString('id-ID')}%`, name]}
                      />
                      <Line type="monotone" dataKey="retentionMonth1Percent" name="Bulan ke-1" stroke="#2F4BDB" strokeWidth={2} connectNulls dot={false} />
                      <Line type="monotone" dataKey="retentionMonth2Percent" name="Bulan ke-2" stroke="#E08A00" strokeWidth={2} connectNulls dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
                  Belum ada kohor pendaftaran yang cukup lama untuk menghitung retensi bulanan.
                </p>
              )}
            </div>

            {/* Footer Legend */}
            <div className="pt-4 border-t border-border mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue" />
                <span className="text-slate-600 font-medium">Peserta baru/bulan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 border-t-2 border-dashed border-orange" />
                <span className="text-slate-600 font-medium">Pengajar baru/bulan</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-1 border-t-2 border-green" />
                <span className="text-slate-600 font-medium">Peserta aktif/bulan</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Courses by Category Donut */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-heading mb-1">
              Kursus berdasarkan Kategori
            </h3>
            <p className="text-xs text-slate-500 mb-4">Sebaran kurikulum berdasarkan bidang</p>

            <div className="relative h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center 148 COURSES */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-text-heading">{totalCourses}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  KURSUS
                </span>
              </div>
            </div>

            {/* Legend: Tech 62 42%, UI/UX 41 28%, Data & AI 27 18%, Business 18 12% */}
            <div className="space-y-2.5 pt-4 border-t border-border mt-2 text-xs">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong className="text-navy">{item.value}</strong>
                    <span className="text-slate-400">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. ROW: Courses Awaiting Review Table + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Courses Awaiting Review */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-text-heading">
                    Kursus Menunggu Peninjauan
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    {pendingCourseCount} Menunggu
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tinjauan mutu dan akreditasi silabus sebelum kursus ditampilkan di katalog.
                </p>
              </div>

              {/* Search + All Categories filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Cari tinjauan..."
                  className="bg-slate-50 text-xs rounded-xl border border-border px-3 py-1.5 focus:outline-none focus:border-blue"
                />
                <select
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value)}
                  className="bg-slate-50 text-xs rounded-xl border border-border px-2.5 py-1.5 focus:outline-none focus:border-blue cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {categoryData.map((category) => (
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">JUDUL KURSUS</th>
                    <th className="pb-3">PENGAJAR</th>
                    <th className="pb-3">KATEGORI</th>
                    <th className="pb-3 text-right">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPendingCourses.map((c) => {
                    const cMedia = getCourseMedia(c.slug);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                              <img src={cMedia.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-text-heading block line-clamp-1">{c.title}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={c.teacherName} size="xs" />
                            <span className="font-medium text-slate-700">{c.teacherName}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <Badge variant="neutral" size="xs">{translateCategory(c.categoryName)}</Badge>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/admin/courses-review')}
                            className="text-xs font-bold text-blue hover:text-navy underline"
                          >
                            Tinjau Silabus →
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  {!filteredPendingCourses.length && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        {isLoading ? 'Memuat antrean...' : 'Tidak ada kursus yang cocok dengan filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {filteredPendingCourses.length} dari {pendingCourseCount} kursus menunggu tinjauan</span>
              <button type="button" onClick={() => navigate('/admin/courses-review')} className="font-bold text-blue hover:text-navy">
                Buka antrean tinjauan →
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Recent Users */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div>
                <h3 className="text-sm font-bold text-text-heading">Pengguna Terbaru</h3>
                <span className="text-[11px] text-slate-400">Pendaftaran terbaru di platform</span>
              </div>
              <Link to="/admin/users" className="text-xs font-bold text-blue hover:text-navy flex items-center gap-1">
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tabs: All Roles / Instructors / Students */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold mb-4 border border-border">
              <button
                type="button"
                onClick={() => setUserRoleTab('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  userRoleTab === 'all' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                Semua Peran
              </button>
              <button
                type="button"
                onClick={() => setUserRoleTab('instructors')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  userRoleTab === 'instructors' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                Pengajar
              </button>
              <button
                type="button"
                onClick={() => setUserRoleTab('students')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  userRoleTab === 'students' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                Peserta
              </button>
            </div>

            {/* Rows with avatar + online dot, name (+ verified check), email, time ago, role pill */}
            <div className="space-y-3 mb-6">
              {recentUsers
                .filter((u) => {
                  if (userRoleTab === 'instructors') return u.role === 'instructor';
                  if (userRoleTab === 'students') return u.role === 'participant';
                  return true;
                })
                .map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={u.full_name} size="xs" />
                      <div className="min-w-0">
                        <span className="font-bold text-text-heading truncate block">{u.full_name}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{u.email}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {new Date(u.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <Badge variant={u.role === 'instructor' ? 'orange' : 'preview-free'} size="xs">
                        {u.role === 'instructor' ? 'Pengajar' : u.role === 'admin' ? 'Admin' : 'Peserta'}
                      </Badge>
                    </div>
                  </div>
                ))}
              {!recentUsers.length && (
                <p className="py-4 text-center text-xs text-slate-400">
                  {isLoading ? 'Memuat pengguna...' : 'Belum ada data pengguna.'}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/admin/users')}
            >
              Manage User Directory
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
