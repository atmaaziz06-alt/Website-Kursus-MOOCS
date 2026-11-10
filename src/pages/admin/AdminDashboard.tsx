import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Download,
  UserPlus,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, StatCard, Button, Badge, Avatar } from '../../components/ui';
import { getCourseMedia, getUserAvatar, getInstructorPhoto } from '../../config/media';
import { translateCategory } from '../../config/locale';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'30days' | '6months' | 'ytd'>('6months');
  const [userRoleTab, setUserRoleTab] = useState<'all' | 'instructors' | 'students'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewCategory, setReviewCategory] = useState('all');

  // Multi-line growth chart data (Dec to May)
  const growthData = [
    { month: 'Des', students: 12400, instructors: 140 },
    { month: 'Jan', students: 15100, instructors: 180 },
    { month: 'Feb', students: 17800, instructors: 210 },
    { month: 'Mar', students: 19900, instructors: 250 },
    { month: 'Apr', students: 22400, instructors: 285 },
    { month: 'Mei', students: 24850, instructors: 312 },
  ];

  // Donut data: Tech & Software 62 42%, UI/UX & Design 41 28%, Data & AI 27 18%, Business 18 12%
  const categoryData = [
    { name: 'Teknologi & Perangkat Lunak', value: 62, percent: 42, color: '#2F4BDB' },
    { name: 'Desain UI/UX & Produk', value: 41, percent: 28, color: '#E08A00' },
    { name: 'Rekayasa Data & AI', value: 27, percent: 18, color: '#16A34A' },
    { name: 'Bisnis & Kepemimpinan', value: 18, percent: 12, color: '#0B1F8F' },
  ];

  // 4 rows of Courses Awaiting Review
  const pendingCourses = [
    {
      title: 'Next.js 15 Full-Stack & Agen AI',
      slug: 'full-stack-nextjs-ai',
      meta: '36 Pelajaran • 18,5 jam',
      instructor: 'John Smith',
      instructorId: 'john-smith',
      category: 'Development',
      badgeColor: 'development',
    },
    {
      title: 'Deep Learning dengan PyTorch: Dari Tensor hingga LLM',
      slug: 'deep-learning-pytorch',
      meta: '30 Pelajaran • 28 jam',
      instructor: 'Dr. Siti Nurhaliza M.Cs.',
      instructorId: 'dr-siti',
      category: 'Technology',
      badgeColor: 'technology',
    },
    {
      title: 'Arsitektur Sistem Desain Figma: Variables & Token',
      slug: 'figma-design-system',
      meta: '24 Pelajaran • 16 jam',
      instructor: 'Sarah Jenkins',
      instructorId: 'sarah-jenkins',
      category: 'Design',
      badgeColor: 'design',
    },
    {
      title: 'Cloud DevOps dengan Kubernetes: Alur Kerja GitOps',
      slug: 'cloud-devops-kubernetes',
      meta: '29 Pelajaran • 24 jam',
      instructor: 'Marcus Vance',
      instructorId: 'marcus-vance',
      category: 'Technology',
      badgeColor: 'technology',
    },
  ];

  // Recent Users live registrations
  const recentUsers = [
    {
      name: 'Rian Hidayat',
      email: 'rian.hidayat@eduspace.ac.id',
      avatarId: 'rian-hidayat',
      timeAgo: '4 menit lalu',
      role: 'Peserta',
      verified: true,
    },
    {
      name: 'Dr. Siti Nurhaliza M.Cs.',
      email: 'siti.nurhaliza@eduspace.ac.id',
      avatarId: 'dr-siti',
      timeAgo: '18 menit lalu',
      role: 'Pengajar',
      verified: true,
    },
    {
      name: 'Dian Paramitha',
      email: 'dian.paramitha@eduspace.ac.id',
      avatarId: 'dian-paramitha',
      timeAgo: '1 jam lalu',
      role: 'Peserta',
      verified: true,
    },
    {
      name: 'Michael Wong',
      email: 'michael.wong@eduspace.ac.id',
      avatarId: 'michael-wong',
      timeAgo: '3 jam lalu',
      role: 'Pengajar',
      verified: false,
    },
  ];

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
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Unduh Log Audit (.CSV)
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

      {/* 2. 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="TOTAL PENGGUNA"
          value="24,850"
          subtext="pertumbuhan dibanding bulan lalu"
          trend={{ value: '+14.2%', isPositive: true }}
          icon={<Users className="w-5 h-5" />}
          iconVariant="green"
        />
        <StatCard
          label="TOTAL PENGAJAR"
          value="312"
          subtext="+8 menunggu verifikasi"
          icon={<GraduationCap className="w-5 h-5" />}
          iconVariant="navy"
        />
        <StatCard
          label="TOTAL KURSUS"
          value="148"
          subtext="126 Aktif • 22 Diarsipkan"
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
                14
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-orange-dark/90 font-medium">
            Perlu ditangani dalam 24 jam
          </p>
        </Card>
      </div>

      {/* 3. ROW: User Growth Multi-line Chart + Courses by Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): User Growth Multi-line chart */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-text-heading">
                  Pertumbuhan Pengguna & Tren Pendaftaran
                </h3>
                <p className="text-xs text-slate-500">
                  Memantau pertumbuhan peserta dan retensi angkatan aktif sepanjang 2025.
                </p>
              </div>

              {/* Timeframe Toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold border border-border">
                <button
                  type="button"
                  onClick={() => setTimeframe('30days')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === '30days' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  30 Hari Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('6months')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === '6months' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  6 Bulan Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('ytd')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === 'ytd' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Sejak Awal Tahun
                </button>
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
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 30000]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-navy text-white text-xs p-3 rounded-xl shadow-lg border border-navy-dark">
                            <span className="font-bold block mb-1">
                              Puncak Angkatan Mei: 24.850 Pengguna Aktif +18%
                            </span>
                            <span className="text-blue-tint block">Peserta: {payload[0]?.value?.toLocaleString()}</span>
                            <span className="text-orange block">Pengajar: {payload[1]?.value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Solid Blue Line + Gradient Fill */}
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#2F4BDB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#studentGrowthGrad)"
                  />
                  {/* Dashed Orange Line for Instructors */}
                  <Line
                    type="monotone"
                    dataKey="instructors"
                    stroke="#E08A00"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Footer Legend */}
            <div className="pt-4 border-t border-border mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue" />
                <span className="text-slate-600 font-medium">Peserta (24.538)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 border-t-2 border-dashed border-orange" />
                <span className="text-slate-600 font-medium">Pengajar (312)</span>
              </div>
              <div className="text-slate-500 font-medium">
                Pertumbuhan Puncak: <strong className="text-navy">+1.240 per minggu</strong>
              </div>
              <div className="text-slate-500 font-medium">
                Retensi Angkatan: <strong className="text-green">94,1%</strong>
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
                <span className="text-xl font-extrabold text-text-heading">148</span>
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
                    14 Menunggu
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
                  <option value="development">Pemrograman</option>
                  <option value="technology">Teknologi</option>
                  <option value="design">Desain</option>
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
                  {pendingCourses.map((c) => {
                    const cMedia = getCourseMedia(c.slug);
                    const instPhoto = getInstructorPhoto(c.instructorId);
                    return (
                      <tr key={c.slug} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                              <img src={cMedia.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-text-heading block line-clamp-1">{c.title}</span>
                              <span className="text-[10px] text-slate-400">{c.meta}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar src={instPhoto} name={c.instructor} size="xs" />
                            <span className="font-medium text-slate-700">{c.instructor}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <Badge variant={c.badgeColor as any} size="xs">
                            {translateCategory(c.category)}
                          </Badge>
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
                </tbody>
              </table>
            </div>

            {/* Footer with pagination */}
            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan 1-4 dari 14 kursus</span>
              <div className="flex items-center gap-1">
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50 disabled:opacity-40" disabled>
                  Sebelumnya
                </button>
                <button type="button" className="px-2.5 py-1 rounded-lg bg-navy text-white font-bold">1</button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50">2</button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50">3</button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50">Berikutnya</button>
              </div>
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
                  if (userRoleTab === 'instructors') return u.role === 'Pengajar';
                  if (userRoleTab === 'students') return u.role === 'Peserta';
                  return true;
                })
                .map((u) => (
                  <div key={u.email} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <Avatar src={getUserAvatar(u.avatarId)} name={u.name} size="xs" />
                        <span className="w-2 h-2 rounded-full bg-green absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-text-heading truncate">{u.name}</span>
                          {u.verified && <CheckCircle2 className="w-3 h-3 text-blue shrink-0" />}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">{u.email}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block mb-0.5">{u.timeAgo}</span>
                      <Badge variant={u.role === 'Instructor' ? 'orange' : 'preview-free'} size="xs">
                        {u.role}
                      </Badge>
                    </div>
                  </div>
                ))}
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
