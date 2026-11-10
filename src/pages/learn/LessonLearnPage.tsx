import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Bell,
  Play,
  Bookmark,
  HelpCircle,
  Download,
  CheckCircle2,
  Lock,
  ChevronDown,
  Star,
  FileText,
  Code2,
  Terminal,
  ExternalLink,
  Layers,
  Search,
  Check,
} from 'lucide-react';
import { getCourseMedia, getInstructorPhoto, getUserAvatar } from '../../config/media';
import { Card, Badge, Button, ProgressBar, Avatar } from '../../components/ui';
import { useCourses } from '../../context/CourseContext';

export const LessonLearnPage: React.FC = () => {
  const { courseSlug = 'web-development-bootcamp-2025', lessonId = 'les-15' } = useParams();
  const navigate = useNavigate();
  const { markLessonCompleted } = useCourses();

  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'sandbox'>('video');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(15);
  const [expandedSection, setExpandedSection] = useState<string>('sec-4');
  const [searchQuery, setSearchQuery] = useState('');

  const instructorPhoto = getInstructorPhoto('marcus-vance');
  const userAvatar = getUserAvatar('dian-paramitha');
  const courseMedia = getCourseMedia(courseSlug);

  const handleMarkCompleted = () => {
    setIsCompleted(true);
    setCompletedCount(16);
    markLessonCompleted(courseSlug, lessonId);
  };

  const sections = [
    {
      id: 'sec-1',
      title: 'Modul 1: Dasar Web & HTML5',
      status: 'completed',
      lessons: [
        { id: 'les-1', title: '1. Gambaran Arsitektur Web', duration: '18 mnt', type: 'video', done: true },
        { id: 'les-2', title: '2. Semantic HTML5 & DOM Tree', duration: '24 mnt', type: 'video', done: true },
      ],
    },
    {
      id: 'sec-2',
      title: 'Modul 2: JavaScript ES6+ Modern',
      status: 'completed',
      lessons: [
        { id: 'les-5', title: '5. Sintaks Modern & Closures', duration: '26 mnt', type: 'video', done: true },
        { id: 'les-6', title: '6. Scope & Execution Context', duration: '34 mnt', type: 'video', done: true },
      ],
    },
    {
      id: 'sec-3',
      title: 'Modul 3: Arsitektur TypeScript',
      status: 'completed',
      lessons: [
        { id: 'les-9', title: '9. Interfaces & Generics', duration: '22 mnt', type: 'video', done: true },
        { id: 'les-10', title: '10. Penyempitan Tipe & Guards', duration: '30 mnt', type: 'video', done: true },
      ],
    },
    {
      id: 'sec-4',
      title: 'Modul 4: Arsitektur React & Frontend',
      status: 'active',
      lessons: [
        { id: 'les-13', title: '13. Arsitektur Berbasis Komponen', duration: '31 mnt', type: 'video', done: true },
        { id: 'les-14', title: '14. Siklus Hidup Komponen & Cleanup', duration: '29 mnt', type: 'video', done: true },
        { id: 'les-15', title: '15. Pendalaman useState & useEffect', duration: '28 mnt', type: 'video', current: true, done: isCompleted },
        { id: 'les-16', title: '16. Context API & State Skalabel', duration: '35 mnt', type: 'video', done: false },
        { id: 'les-17', title: '17. Profil Performa & memo', duration: '42 mnt', type: 'video', done: false },
        { id: 'les-18', title: '18. Ringkasan & Kode Awal Modul 4', duration: 'PDF', type: 'pdf', done: false },
        { id: 'quiz-mod-4', title: 'Kuis 04: Penguasaan React Hooks', duration: '20 mnt', type: 'quiz', done: false },
      ],
    },
    {
      id: 'sec-5',
      title: 'Modul 5: Microservices Backend dengan Node.js',
      status: 'locked',
      lessons: [],
    },
    {
      id: 'sec-6',
      title: 'Modul 6: Deployment Cloud & CI/CD',
      status: 'locked',
      lessons: [],
    },
  ];

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-border h-16 px-4 sm:px-8 flex items-center justify-between shadow-sm">
        {/* Left: Back arrow, truncated course title, blue pill */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/student')}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors shrink-0"
            aria-label="Kembali ke dasbor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-text-heading truncate hidden sm:inline-block max-w-[200px]">
            Bootcamp Pengembangan Web 2025
          </span>

          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-soft-blue text-blue text-xs font-bold shrink-0">
            Modul 4: Arsitektur React & Frontend
          </span>
        </div>

        {/* Center: Progress Bar */}
        <div className="hidden lg:flex items-center gap-3 w-64">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
              <span>{Math.round((completedCount / 38) * 100)}% Selesai</span>
              <span>({completedCount}/38 Pelajaran)</span>
            </div>
            <ProgressBar progress={(completedCount / 38) * 100} color="blue" size="xs" />
          </div>
        </div>

        {/* Right: Resources, comments, bell, user */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href="#resources"
            className="text-xs font-bold text-slate-600 hover:text-navy hidden sm:inline-block"
          >
            Sumber Belajar
          </a>

          <button
            type="button"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-600 hover:text-navy"
            aria-label="Diskusi"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-600 hover:text-navy"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <Avatar src={userAvatar} name="Dian Paramitha" size="sm" />
            <span className="text-xs font-bold text-text-heading hidden md:inline-block">
              Dian Paramitha
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: Two Columns */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Player & Lesson Info */}
        <div className="xl:col-span-8 space-y-6">
          {/* Tabs row */}
          <div className="flex items-center justify-between pb-2 flex-wrap gap-4">
            <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-border shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'video'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                Video Pelajaran (Aktif)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'notes'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                Catatan Interaktif & PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'sandbox'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                Ruang Uji Kode
              </button>
            </div>

            {/* Synchronized Code Stream Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-tint border border-green/20 text-green text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span>Aliran Kode Tersinkronisasi</span>
            </div>
          </div>

          {/* Use the course-specific video instead of a generic demo clip. */}
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-soft-lg aspect-[16/9]">
            {courseMedia.previewVideoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${courseMedia.previewVideoId}?rel=0`}
                title={courseMedia.previewVideoTitle || `${courseSlug} lesson video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-navy p-6 text-center text-sm font-semibold text-white">
                Video pembelajaran untuk kursus ini belum tersedia.
              </div>
            )}
          </div>

          {/* Action Row Below Video */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-soft-blue text-blue text-xs font-bold">
                Menengah
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                28 menit
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" leftIcon={<Bookmark className="w-3.5 h-3.5" />}>
                Simpan
              </Button>
              <Button variant="outline" size="sm" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>
                Ajukan Pertanyaan (18)
              </Button>
              <Button
                variant="navy"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Unduh Kode (.zip)
              </Button>
            </div>
          </div>

          {/* FLOATING WHITE ACTION BAR */}
          <Card className="p-4 bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              className="text-xs font-bold text-slate-600 hover:text-navy transition-colors"
            >
              ← Sebelumnya: 14. Siklus Hidup Komponen
            </button>

            <Button
              variant={isCompleted ? 'outline' : 'orange'}
              size="sm"
              onClick={handleMarkCompleted}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
              className={isCompleted ? 'bg-green-tint text-green border-green/30' : ''}
            >
              {isCompleted ? 'Selesai ✓' : 'Tandai Selesai'}
            </Button>

            <Button
              variant="navy"
              size="sm"
              onClick={() => navigate('/learn/web-development-bootcamp-2025/les-16')}
            >
              Pelajaran Berikutnya (16. Context API) →
            </Button>
          </Card>

          {/* LESSON DETAILS & INSTRUCTOR ROW */}
          <Card className="p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-text-heading mb-4">
                15. Pendalaman useState, useEffect & Custom Hooks
              </h1>

              {/* Instructor row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-border">
                <div className="flex items-center gap-3">
                  <img
                    src={instructorPhoto}
                    alt="Marcus Vance"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-heading">Marcus Vance</span>
                      <span className="px-2 py-0.5 rounded-full bg-soft-blue text-blue text-[10px] font-bold">
                        Insinyur Senior
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pengajar Utama • Mantan Pemimpin Teknis Frontend Meta • 94 ribu Peserta
                    </p>
                  </div>
                </div>

                <div className="text-right self-end sm:self-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    PENILAIAN PELAJARAN
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    <span>4.94</span>
                    <span className="text-slate-400 font-normal text-xs">(1.420 suara)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Overview & Key Concepts */}
            <div>
              <h3 className="text-base font-bold text-text-heading mb-2">
                Ringkasan Pelajaran & Konsep Utama
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Pada pelajaran ini, kita membahas cara engine Fiber React menyelaraskan perubahan state. Kita mempelajari pembaruan fungsional menggunakan <code className="bg-slate-100 text-blue px-1.5 py-0.5 rounded text-xs font-mono font-bold">setCount(prev =&gt; prev + 1)</code>, meninjau pembersihan efek pada <code className="bg-slate-100 text-blue px-1.5 py-0.5 rounded text-xs font-mono font-bold">useEffect</code>, dan menyusun custom hook yang skalabel untuk mencegah kebocoran memori pada langganan asinkron.
              </p>

              {/* 3 Concept Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-white">
                  <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-blue mb-2 font-bold text-xs">
                    01
                  </div>
                  <h4 className="text-xs font-bold text-text-heading mb-1">Mengangkat State</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Membagikan state tersinkronisasi dengan rapi ke beberapa komponen sejajar.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-white">
                  <div className="w-8 h-8 rounded-lg bg-orange-tint flex items-center justify-center text-orange mb-2 font-bold text-xs">
                    02
                  </div>
                  <h4 className="text-xs font-bold text-text-heading mb-1">Optimasi Render</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Mengurangi render ulang yang tidak perlu dengan dependensi stabil dan memoization.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-white">
                  <div className="w-8 h-8 rounded-lg bg-green-tint flex items-center justify-center text-green mb-2 font-bold text-xs">
                    03
                  </div>
                  <h4 className="text-xs font-bold text-text-heading mb-1">Desain Custom Hook</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Membungkus event listener browser dan penyimpanan cache lokal yang kompleks.
                  </p>
                </div>
              </div>
            </div>

            {/* Lesson Assets & Code Snippets */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-base font-bold text-text-heading mb-3">
                Aset Pelajaran & Cuplikan Kode
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="#download-code"
                  className="p-3 rounded-xl border border-border flex items-center gap-3 hover:border-blue transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-soft-blue flex items-center justify-center text-blue shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-heading block truncate group-hover:text-blue">
                      Lesson-15-Code-Snippet.js
                    </span>
                    <span className="text-[10px] text-slate-400">42 KB • JavaScript</span>
                  </div>
                </a>

                <a
                  href="#download-pdf"
                  className="p-3 rounded-xl border border-border flex items-center gap-3 hover:border-blue transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-tint flex items-center justify-center text-orange shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-heading block truncate group-hover:text-blue">
                      React-Hooks-Cheatsheet.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">1,2 MB • Panduan PDF</span>
                  </div>
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl border border-border flex items-center gap-3 hover:border-blue transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center text-navy shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-heading block truncate group-hover:text-blue">
                      Cabang Repositori GitHub
                    </span>
                    <span className="text-[10px] text-slate-400">branch: module-04-react</span>
                  </div>
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar (4 cols): Course Content */}
        <div className="xl:col-span-4 space-y-6 sticky top-24">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text-heading">Materi Kursus</h3>
              <span className="text-xs font-bold text-blue">4/8 Bagian</span>
            </div>

            {/* Metrics */}
            <div className="py-3 border-b border-border space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>15/38 Completed ({Math.round((completedCount / 38) * 100)}%)</span>
                <span className="text-green font-semibold">Progres Belajar: Sesuai Target</span>
              </div>
              <ProgressBar progress={(completedCount / 38) * 100} color="blue" size="xs" />
              <div className="text-[11px] text-slate-400">23 Pelajaran Tersisa</div>
            </div>

            {/* Search lesson or topic */}
            <div className="py-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pelajaran atau topik..."
                  className="w-full bg-slate-50 border border-border rounded-xl text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            {/* Collapsible Sections List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sections.map((sec) => {
                const isSecExpanded = expandedSection === sec.id;
                const isCompletedSec = sec.status === 'completed';
                const isLockedSec = sec.status === 'locked';

                return (
                  <div key={sec.id} className="border border-border rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => !isLockedSec && setExpandedSection(isSecExpanded ? '' : sec.id)}
                      className={`w-full p-3.5 flex items-center justify-between text-left text-xs font-bold ${
                        isLockedSec ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 pr-2">
                        {isCompletedSec ? (
                          <div className="w-5 h-5 rounded-full bg-green text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isLockedSec ? (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            4
                          </div>
                        )}
                        <span className="truncate text-slate-800">{sec.title}</span>
                      </div>
                      {!isLockedSec && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            isSecExpanded ? 'transform rotate-180 text-blue' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Expanded Section Items */}
                    {isSecExpanded && !isLockedSec && (
                      <div className="border-t border-border/60 divide-y divide-border/40 bg-slate-50/50">
                        {sec.lessons.map((les) => (
                          <div
                            key={les.id}
                            onClick={() => les.type === 'quiz' ? navigate('/quiz/quiz-react-hooks') : null}
                            className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                              les.current
                                ? 'bg-soft-blue/70 border-l-4 border-l-blue font-bold text-navy'
                                : 'hover:bg-white text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {les.done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0" />
                              ) : les.type === 'video' ? (
                                <Play className="w-3 h-3 text-blue shrink-0" />
                              ) : les.type === 'quiz' ? (
                                <HelpCircle className="w-3.5 h-3.5 text-orange shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {les.current && (
                                <span className="px-1.5 py-0.5 rounded bg-blue text-white text-[9px] font-extrabold uppercase">
                                  SEDANG DIPUTAR
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{les.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Assessment CTA */}
            <div className="pt-4 border-t border-border space-y-2 mt-4">
              <Button
                variant="orange"
                size="md"
                fullWidth
                onClick={() => navigate('/quiz/quiz-react-hooks')}
              >
                Quiz: Module 4 Assessment (Pass: 80%) →
              </Button>
              <p className="text-[11px] text-slate-500 text-center leading-snug">
                Complete all lessons in Section 4 to unlock official certificate exam eligibility.
              </p>
            </div>
          </Card>

          {/* Navy Card: Live Cohort Office Hours */}
          <div className="bg-navy rounded-2xl p-6 text-white shadow-soft">
            <h4 className="text-sm font-bold mb-1">Sesi Tanya Jawab Langsung</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Need 1-on-1 code review or debugging help with senior mentors? Join our weekly breakout room.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              className="bg-white text-navy hover:bg-slate-100 border-none font-bold"
            >
              Join Live Mentor Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
