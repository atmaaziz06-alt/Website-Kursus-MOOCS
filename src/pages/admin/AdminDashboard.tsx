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

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'30days' | '6months' | 'ytd'>('6months');
  const [userRoleTab, setUserRoleTab] = useState<'all' | 'instructors' | 'students'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewCategory, setReviewCategory] = useState('all');

  // Multi-line growth chart data (Dec to May)
  const growthData = [
    { month: 'Dec', students: 12400, instructors: 140 },
    { month: 'Jan', students: 15100, instructors: 180 },
    { month: 'Feb', students: 17800, instructors: 210 },
    { month: 'Mar', students: 19900, instructors: 250 },
    { month: 'Apr', students: 22400, instructors: 285 },
    { month: 'May', students: 24850, instructors: 312 },
  ];

  // Donut data: Tech & Software 62 42%, UI/UX & Design 41 28%, Data & AI 27 18%, Business 18 12%
  const categoryData = [
    { name: 'Tech & Software', value: 62, percent: 42, color: '#2F4BDB' },
    { name: 'UI/UX & Product Design', value: 41, percent: 28, color: '#E08A00' },
    { name: 'Data & AI Engineering', value: 27, percent: 18, color: '#16A34A' },
    { name: 'Business & Leadership', value: 18, percent: 12, color: '#0B1F8F' },
  ];

  // 4 rows of Courses Awaiting Review
  const pendingCourses = [
    {
      title: 'Full-Stack Next.js 15 & AI Agents',
      slug: 'full-stack-nextjs-ai',
      meta: '36 Lectures • 18.5 hrs',
      instructor: 'John Smith',
      instructorId: 'john-smith',
      category: 'Development',
      badgeColor: 'development',
    },
    {
      title: 'Deep Learning with PyTorch: From Tensors to LLMs',
      slug: 'deep-learning-pytorch',
      meta: '30 Lectures • 28.0 hrs',
      instructor: 'Dr. Siti Nurhaliza M.Cs.',
      instructorId: 'dr-siti',
      category: 'Technology',
      badgeColor: 'technology',
    },
    {
      title: 'Figma Design System Architecture: Variables & Tokens',
      slug: 'figma-design-system',
      meta: '24 Lectures • 16.0 hrs',
      instructor: 'Sarah Jenkins',
      instructorId: 'sarah-jenkins',
      category: 'Design',
      badgeColor: 'design',
    },
    {
      title: 'Cloud DevOps with Kubernetes: GitOps Workflows',
      slug: 'cloud-devops-kubernetes',
      meta: '29 Lectures • 24.0 hrs',
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
      timeAgo: '4 mins ago',
      role: 'Student',
      verified: true,
    },
    {
      name: 'Dr. Siti Nurhaliza M.Cs.',
      email: 'siti.nurhaliza@eduspace.ac.id',
      avatarId: 'dr-siti',
      timeAgo: '18 mins ago',
      role: 'Instructor',
      verified: true,
    },
    {
      name: 'Dian Paramitha',
      email: 'dian.paramitha@eduspace.ac.id',
      avatarId: 'dian-paramitha',
      timeAgo: '1 hour ago',
      role: 'Student',
      verified: true,
    },
    {
      name: 'Michael Wong',
      email: 'michael.wong@eduspace.ac.id',
      avatarId: 'michael-wong',
      timeAgo: '3 hours ago',
      role: 'Instructor',
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
              EDUSPACE CONTROL CENTER
            </span>
            <span className="text-xs text-slate-400 font-mono">Node ID: ID-JKT-082</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
            Admin Overview & System Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome back, System Admin. Real-time platform governance, user retention metrics, and curriculum compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Download Audit Log (.CSV)
          </Button>
          <Button
            variant="orange"
            size="sm"
            onClick={() => navigate('/admin/users')}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            + Invite New Instructor
          </Button>
        </div>
      </div>

      {/* 2. 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="TOTAL USERS"
          value="24,850"
          subtext="growth vs last month"
          trend={{ value: '+14.2%', isPositive: true }}
          icon={<Users className="w-5 h-5" />}
          iconVariant="green"
        />
        <StatCard
          label="TOTAL INSTRUCTORS"
          value="312"
          subtext="+8 new pending verification"
          icon={<GraduationCap className="w-5 h-5" />}
          iconVariant="navy"
        />
        <StatCard
          label="TOTAL COURSES"
          value="148"
          subtext="126 Active • 22 Archived"
          icon={<BookOpen className="w-5 h-5" />}
          iconVariant="soft-blue"
        />
        {/* PENDING REVIEWS (Orange-tinted card) */}
        <Card className="p-5 bg-orange-tint/70 border-orange/30 shadow-soft relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-dark block">
                  PENDING REVIEWS
                </span>
                <span className="px-1.5 py-0.2 rounded bg-orange text-white text-[9px] font-extrabold uppercase">
                  Action
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
            Requires attention within 24h
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
                  User Growth & Enrollment Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking student velocity and active cohort retention across 2025 terms.
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
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('6months')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === '6months' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Last 6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('ytd')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === 'ytd' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Year to Date
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
                              May Cohort Peak 24,850 Total Active +18%
                            </span>
                            <span className="text-blue-tint block">Students: {payload[0]?.value?.toLocaleString()}</span>
                            <span className="text-orange block">Instructors: {payload[1]?.value}</span>
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
                <span className="text-slate-600 font-medium">Students (24,538)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 border-t-2 border-dashed border-orange" />
                <span className="text-slate-600 font-medium">Instructors (312)</span>
              </div>
              <div className="text-slate-500 font-medium">
                Peak Velocity: <strong className="text-navy">+1,240 weekly</strong>
              </div>
              <div className="text-slate-500 font-medium">
                Cohort Retention: <strong className="text-green">94.1%</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Courses by Category Donut */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-heading mb-1">
              Courses by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">Curriculum distribution across disciplines</p>

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
                  COURSES
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
                    Courses Awaiting Review
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    14 Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Comprehensive QA and syllabus accreditation reviews prior to public catalog release.
                </p>
              </div>

              {/* Search + All Categories filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Search reviews..."
                  className="bg-slate-50 text-xs rounded-xl border border-border px-3 py-1.5 focus:outline-none focus:border-blue"
                />
                <select
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value)}
                  className="bg-slate-50 text-xs rounded-xl border border-border px-2.5 py-1.5 focus:outline-none focus:border-blue cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="development">Development</option>
                  <option value="technology">Technology</option>
                  <option value="design">Design</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">COURSE TITLE</th>
                    <th className="pb-3">INSTRUCTOR</th>
                    <th className="pb-3">CATEGORY</th>
                    <th className="pb-3 text-right">ACTION</th>
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
                            {c.category}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/admin/courses-review')}
                            className="text-xs font-bold text-blue hover:text-navy underline"
                          >
                            Review Syllabus →
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
              <span>Showing 1 to 4 of 14 courses</span>
              <div className="flex items-center gap-1">
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50 disabled:opacity-40" disabled>
                  Previous
                </button>
                <button type="button" className="px-2.5 py-1 rounded-lg bg-navy text-white font-bold">1</button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50">2</button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50">3</button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-slate-50">Next</button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Recent Users */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div>
                <h3 className="text-sm font-bold text-text-heading">Recent Users</h3>
                <span className="text-[11px] text-slate-400">Live platform registrations</span>
              </div>
              <Link to="/admin/users" className="text-xs font-bold text-blue hover:text-navy flex items-center gap-1">
                <span>View All</span>
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
                All Roles
              </button>
              <button
                type="button"
                onClick={() => setUserRoleTab('instructors')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  userRoleTab === 'instructors' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                Instructors
              </button>
              <button
                type="button"
                onClick={() => setUserRoleTab('students')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  userRoleTab === 'students' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                Students
              </button>
            </div>

            {/* Rows with avatar + online dot, name (+ verified check), email, time ago, role pill */}
            <div className="space-y-3 mb-6">
              {recentUsers
                .filter((u) => {
                  if (userRoleTab === 'instructors') return u.role === 'Instructor';
                  if (userRoleTab === 'students') return u.role === 'Student';
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

