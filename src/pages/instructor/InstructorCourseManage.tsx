import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Move,
  Plus,
  Play,
  FileText,
  Terminal,
  Download,
  Search,
  ExternalLink,
  Copy,
  ChevronDown,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, ProgressBar, Avatar } from '../../components/ui';
import { primaryWebDevCourse } from '../../data/mockData';
import { getCourseMedia, getUserAvatar } from '../../config/media';

export const InstructorCourseManage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = primaryWebDevCourse;
  const courseMedia = getCourseMedia(course.slug);

  const [activeTab, setActiveTab] = useState('info');
  const [courseTitle, setCourseTitle] = useState(course.title);
  const [synopsis, setSynopsis] = useState(
    'Bootcamp komprehensif untuk mempelajari pengembangan web full-stack modern dengan React 18, TypeScript, Node.js, dan microservices berbasis container.'
  );

  // Curriculum draggable modules state
  const [modules, setModules] = useState([
    { id: 'm-1', title: 'Modul 1: Dasar Web & Semantic HTML5', status: 'Selesai', badgeColor: 'active' },
    { id: 'm-2', title: 'Modul 2: JavaScript ES6+ Modern & Pemrograman Asinkron', status: 'Selesai', badgeColor: 'active' },
    { id: 'm-3', title: 'Modul 3: TypeScript untuk Aplikasi Frontend Modern', status: 'Selesai', badgeColor: 'active' },
    { id: 'm-4', title: 'Modul 4: Arsitektur React & Frontend (Angkatan Aktif)', status: 'Modul Aktif', badgeColor: 'preview-free' },
    { id: 'm-5', title: 'Modul 5: Microservices Backend dengan Node.js & Prisma', status: 'Sedang Ditinjau', badgeColor: 'in-review' },
    { id: 'm-6', title: 'Modul 6: Deployment Cloud & Pipeline CI/CD', status: 'Draf', badgeColor: 'draft' },
  ]);

  // Drag and drop handler
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newItems = [...modules];
    const item = newItems.splice(draggedIdx, 1)[0];
    newItems.splice(idx, 0, item);
    setDraggedIdx(idx);
    setModules(newItems);
  };

  // Student table filter state
  const [studentFilter, setStudentFilter] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  const enrolledStudents = [
    { name: 'Dian Paramitha', avatarId: 'dian-paramitha', enrolledDate: '12 Jan 2025', progress: 85, quizAvg: 92.4, lastActive: '2 jam lalu' },
    { name: 'Ahmad Fauzi', avatarId: 'ahmad-fauzi', enrolledDate: '18 Jan 2025', progress: 65, quizAvg: 88.0, lastActive: 'Kemarin' },
    { name: 'Budi Santoso', avatarId: 'budi-santoso', enrolledDate: '05 Jan 2025', progress: 100, isCompleted: true, quizAvg: 95.0, lastActive: '3 hari lalu' },
    { name: 'Sarah Jenkins', avatarId: 'usr-84920', enrolledDate: '22 Feb 2025', progress: 40, quizAvg: 78.5, lastActive: '5 hari lalu', isAtRisk: true },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/instructor" className="hover:text-navy font-semibold">
              ← Kursus Saya
            </Link>
            <span>/</span>
            <span className="text-slate-400">Bootcamp Pengembangan Web 2025</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              Kelola Kursus: Web Dev Bootcamp
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-xs font-bold uppercase">
              ANGKATAN 2025
            </span>
            <Badge variant="active" size="xs">
              Terbit (v2.4)
            </Badge>
          </div>
          <span className="text-xs text-slate-400 block mt-1">
            Terakhir diedit 15 menit lalu oleh John Smith
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/courses/web-development-bootcamp-2025')}
          >
            Pratinjau sebagai Peserta
          </Button>
          <Button variant="outline" size="sm">
            Simpan sebagai Draf
          </Button>
          <Button variant="orange" size="sm">
            Terbitkan Perubahan
          </Button>
        </div>
      </div>

      {/* 2. TAB PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {[
          { id: 'info', label: 'Info Kursus' },
          { id: 'curriculum', label: 'Kurikulum & Materi (38 Pelajaran)' },
          { id: 'quizzes', label: 'Kuis & Evaluasi (4 Kuis)' },
          { id: 'students', label: 'Peserta Terdaftar (1.450)' },
          { id: 'analytics', label: 'Analitik & Performa' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-navy hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Wide Cards */}
        <div className="xl:col-span-8 space-y-8">
          {/* CARD 1: Course Basic Information */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-blue" />
                <h3 className="text-base font-bold text-text-heading">
                  Informasi Dasar Kursus
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-[11px] font-bold uppercase">
                Silabus Terakreditasi
              </span>
            </div>

            <div className="space-y-4">
              <Input
                label="Judul Kursus (Wajib)*"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Kategori"
                  options={[
                    { value: 'development', label: 'Pemrograman & Rekayasa' },
                    { value: 'technology', label: 'Teknologi & Cloud' },
                    { value: 'design', label: 'Desain & UX' },
                  ]}
                  defaultValue="development"
                />
                <Select
                  label="Tingkat Kesulitan"
                  options={[
                    { value: 'beginner', label: 'Pemula hingga Menengah' },
                    { value: 'intermediate', label: 'Menengah' },
                    { value: 'advanced', label: 'Lanjutan' },
                  ]}
                  defaultValue="beginner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Perkiraan Durasi & Tempo"
                  defaultValue="24 Hours (8 Weeks recommended pacing)"
                />
                <Input
                  label="Bahasa Pengantar"
                  defaultValue="Bahasa Indonesia & English"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wide">
                  Short Synopsis
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={3}
                  className="w-full bg-white text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:border-blue"
                />
                <div className="text-right text-[11px] text-slate-400 mt-1">
                  {synopsis.length} / 200 characters
                </div>
              </div>

              {/* Rich Text Style Editor for Comprehensive Syllabus */}
              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wide">
                  Silabus Komprehensif & Capaian Pembelajaran
                </label>
                <div className="rounded-xl border border-border overflow-hidden bg-white">
                  {/* Toolbar */}
                  <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-1 flex-wrap">
                    {[
                      { icon: <Bold className="w-3.5 h-3.5" />, title: 'Tebal' },
                      { icon: <Italic className="w-3.5 h-3.5" />, title: 'Miring' },
                      { icon: <Strikethrough className="w-3.5 h-3.5" />, title: 'Coret' },
                      { icon: <Heading2 className="w-3.5 h-3.5" />, title: 'Judul 2' },
                      { icon: <Heading3 className="w-3.5 h-3.5" />, title: 'Judul 3' },
                      { icon: <List className="w-3.5 h-3.5" />, title: 'Daftar Berpoin' },
                      { icon: <Code className="w-3.5 h-3.5" />, title: 'Blok kode' },
                      { icon: <LinkIcon className="w-3.5 h-3.5" />, title: 'Tautan' },
                      { icon: <ImageIcon className="w-3.5 h-3.5" />, title: 'Gambar media' },
                    ].map((tool, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={tool.title}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-navy hover:bg-white border border-transparent hover:border-border transition-colors"
                      >
                        {tool.icon}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    defaultValue={`### Module 1: Web Foundations & DOM Trees
- Semantic HTML elements, accessibility standards (WCAG 2.1 AA)
- Modern CSS Grid and Flexbox responsive layouts

### Module 4: Advanced React & State
- Fiber reconciliation, hooks internals, and memory profiling`}
                    className="w-full p-4 text-xs sm:text-sm font-mono text-slate-700 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Course Showcase Banner & Thumbnail upload area */}
              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-semibold text-text-heading mb-2 uppercase tracking-wide">
                  Banner & Gambar Mini Kursus
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-border bg-slate-50">
                  <div className="w-40 aspect-[16/9] rounded-lg overflow-hidden bg-slate-200 border border-border shadow-sm shrink-0">
                    <img
                      src={courseMedia.thumbnail}
                      alt="Pratinjau gambar mini"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-bold text-text-heading block mb-0.5">
                      web-dev-bootcamp-showcase-2025.jpg
                    </span>
                    <span className="text-[11px] text-slate-400 block mb-3">
                      Resolusi tinggi 1920x1080 • Dikelola melalui repositori media terpusat
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Button variant="outline" size="sm" className="text-blue border-blue/30">
                        Ganti Gambar
                      </Button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-red hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 2: Course Curriculum & Learning Materials */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-orange" />
                <div>
                  <h3 className="text-base font-bold text-text-heading">
                    Kurikulum Kursus & Materi Pembelajaran
                  </h3>
                  <span className="text-xs text-slate-400">Total 6 Bagian • Seret modul untuk mengurutkan</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Urutkan Ulang Bagian
                </Button>
                <Button variant="navy" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Tambah Materi
                </Button>
              </div>
            </div>

            {/* Draggable Module Rows */}
            <div className="space-y-3">
              {modules.map((m, idx) => (
                <div
                  key={m.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  className="border border-border rounded-xl p-4 bg-white hover:border-blue/40 transition-all cursor-move shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Move className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-text-heading truncate">
                        {m.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={m.badgeColor as any} size="xs">
                        {m.status}
                      </Badge>
                      <button type="button" className="text-slate-400 hover:text-navy p-1">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="text-slate-400 hover:text-red p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Items for Module 4 */}
                  {m.id === 'm-4' && (
                    <div className="mt-4 pt-3 border-t border-border/60 space-y-2 pl-7">
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-blue" />
                          <span>15. Pendalaman useState, useEffect & Custom Hooks</span>
                          <span className="px-1.5 py-0.5 rounded bg-soft-blue text-blue text-[9px] font-bold">
                            Pratinjau Gratis
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">28m</span>
                          <Edit className="w-3 h-3 text-slate-400 hover:text-navy cursor-pointer" />
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red cursor-pointer" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-orange" />
                          <span>Module-15-Hooks-Cheatsheet.pdf</span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-tint text-orange text-[9px] font-bold">
                            PDF
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">1.2 MB</span>
                          <Edit className="w-3 h-3 text-slate-400 hover:text-navy cursor-pointer" />
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red cursor-pointer" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Interactive Lab: Custom Hook Testing Sandbox</span>
                          <span className="px-1.5 py-0.5 rounded bg-green-tint text-green text-[9px] font-bold">
                            Interactive Lab
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Lab Kode</span>
                          <Edit className="w-3 h-3 text-slate-400 hover:text-navy cursor-pointer" />
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* CARD 3: Enrolled Students Overview */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-heading">
                    Enrolled Students Overview (Cohort 2025)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-xs font-bold">
                    1,450 Total
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Track individual pacing, submission rates, and cohort compliance
                </span>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export CSV
              </Button>
            </div>

            {/* Toolbar: Search + Filter Pills */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStudentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'all' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  All (1,450)
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'active' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Active (1,290)
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'completed' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Completed (112)
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('at-risk')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'at-risk' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  At Risk (48)
                </button>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari nama peserta..."
                  className="w-full bg-slate-50 text-xs rounded-xl border border-border px-3 py-2 focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">PESERTA</th>
                    <th className="pb-3">TANGGAL DAFTAR</th>
                    <th className="pb-3 w-36">PROGRES</th>
                    <th className="pb-3">RATA-RATA KUIS</th>
                    <th className="pb-3">AKTIF TERAKHIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {enrolledStudents.map((st) => (
                    <tr key={st.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={getUserAvatar(st.avatarId)} name={st.name} size="xs" />
                          <span className="font-bold text-text-heading">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500">{st.enrolledDate}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            progress={st.progress}
                            color={st.isCompleted ? 'green' : 'blue'}
                            size="xs"
                          />
                          <span className="font-bold text-slate-700 w-8">{st.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold text-navy">{st.quizAvg}%</td>
                      <td className="py-3.5 text-slate-500">{st.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Module Quizzes, Health & Engagement, Office Hours */}
        <div className="xl:col-span-4 space-y-6 sticky top-24">
          {/* Right Card 1: Module Quizzes */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-heading">Kuis Modul</h3>
              <Button variant="orange" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Quiz
              </Button>
            </div>

            <div className="space-y-4">
              {/* Quiz 1 */}
              <div className="p-4 rounded-xl border border-blue/30 bg-soft-blue/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy">
                    Quiz 1: React & Frontend Architecture
                  </span>
                  <Badge variant="active" size="xs">Aktif</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  10 Questions • 15 Mins Limit • Min Pass 80%
                </p>
                <div className="text-xs text-slate-600 font-semibold mb-3 flex items-center justify-between">
                  <span>Jawaban: <strong>1.420</strong></span>
                  <span>Rata-rata: <strong>86,5%</strong></span>
                  <span className="text-green">Lulus: <strong>92%</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-blue">
                  <a href="#analytics" className="hover:underline">Lihat Analitik</a>
                  <span>•</span>
                  <a href="#edit" className="hover:underline">Ubah</a>
                  <span>•</span>
                  <a href="#dup" className="hover:underline">Duplikat</a>
                </div>
              </div>

              {/* Quiz 2 */}
              <div className="p-4 rounded-xl border border-border bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-text-heading">
                    Quiz 2: JavaScript Modern ES6+ & Async
                  </span>
                  <Badge variant="active" size="xs">Aktif</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  12 Questions • 20 Mins Limit • Min Pass 75%
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-blue">
                  <a href="#analytics" className="hover:underline">Lihat Analitik</a>
                  <span>•</span>
                  <a href="#edit" className="hover:underline">Ubah</a>
                </div>
              </div>

              {/* Quiz 3 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-text-heading">
                    Quiz 3: Full-Stack Node.js & Schemas
                  </span>
                  <Badge variant="draft" size="xs">Draf</Badge>
                </div>
                <p className="text-[11px] text-amber-800 mb-2 font-medium">
                  Unpublished changes • In preparation for Week 6
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-orange">
                  <a href="#edit" className="hover:underline">Lanjutkan Mengedit →</a>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Card 2: Course Health & Engagement */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-text-heading mb-2">
              Course Health & Engagement
            </h3>
            <div className="flex items-center gap-2 text-xs text-green font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span>Peserta Aktif Mingguan +18,4% dibanding minggu lalu</span>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Rata-rata Durasi Tonton:</span>
                <strong className="text-navy">34,2 menit / sesi</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pengumpulan Tugas:</span>
                <strong className="text-navy">94,8% tepat waktu</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pertanyaan Diajukan:</span>
                <strong className="text-navy">128 di forum tanya jawab</strong>
              </div>
            </div>
          </Card>

          {/* Right Card 3: Navy Card - Instructor Office Hours */}
          <div className="bg-navy rounded-2xl p-6 text-white shadow-soft flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange block mb-0.5">
                LIVE SESSION
              </span>
              <h4 className="text-xs sm:text-sm font-bold">
                Instructor Office Hours
              </h4>
              <p className="text-[11px] text-slate-300">
                Every Thursday • 19:00 WIB
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-navy hover:bg-slate-100 font-bold border-none"
            >
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
