import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Star,
  Users,
  Calendar,
  Globe,
  Check,
  Play,
  FileText,
  HelpCircle,
  Share2,
  Heart,
  Shield,
  Download,
  Code2,
  Smartphone,
  Award,
  ChevronDown,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';
import { formatIDR } from '../../config/currency';
import { translateCategory, translateLevel } from '../../config/locale';
import { Button, Card, Avatar, ProgressBar } from '../../components/ui';
import { CourseCard } from '../../components/course/CourseCard';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { getCourseBySlug, getCourses } from '../../services/courseService';
import { Course } from '../../types';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  const { enrolledCourses, enrollInCourse, savedCourseSlugs, toggleSavedCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [courseLoadError, setCourseLoadError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'sec-1': true,
    'sec-4': true,
  });
  const [shareStatus, setShareStatus] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(() => {
    const state = location.state as { enrollmentRoleError?: boolean } | null;
    return state?.enrollmentRoleError
      ? 'Hanya akun peserta yang dapat mengikuti kursus. Silakan masuk sebagai peserta.'
      : '';
  });
  const [wishlistError, setWishlistError] = useState('');

  useEffect(() => {
    let active = true;
    setIsCourseLoading(true);
    setCourseLoadError('');
    void Promise.all([
      slug ? getCourseBySlug(slug) : Promise.resolve(undefined),
      getCourses({ page: 1, pageSize: 4, sortBy: 'most-popular' }),
    ]).then(([loadedCourse, loadedRelated]) => {
      if (!active) return;
      if (!loadedCourse) {
        setCourseLoadError('Kursus tidak ditemukan atau belum diterbitkan.');
        return;
      }
      setCourse(loadedCourse);
      setRelatedCourses(loadedRelated.filter((item) => item.slug !== loadedCourse.slug).slice(0, 3));
    }).catch((loadError: unknown) => {
      if (active) setCourseLoadError(loadError instanceof Error ? loadError.message : 'Kursus gagal dimuat.');
    }).finally(() => {
      if (active) setIsCourseLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  const shareCourse = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('Tautan kursus disalin.');
    } catch (error) {
      console.error('Gagal menyalin tautan kursus', error);
      setShareStatus('Tautan tidak dapat disalin. Salin alamat halaman dari bilah alamat browser.');
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrollmentError('');
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location.pathname, enrollCourse: course.slug },
      });
      return;
    }
    if (role !== 'participant') {
      setEnrollmentError('Hanya akun peserta yang dapat mengikuti kursus. Silakan masuk sebagai peserta.');
      return;
    }
    if (isEnrolled) {
      navigate('/student/courses');
      return;
    }
    if (isFull) {
      setEnrollmentError('Kuota kursus sudah penuh.');
      return;
    }

    setIsEnrolling(true);
    try {
      await enrollInCourse(course);
      navigate('/student/courses', { state: { enrolledCourse: course.title } });
    } catch (error) {
      setEnrollmentError(error instanceof Error ? error.message : 'Pendaftaran kursus gagal.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const collapseAllSections = () => {
    if (!course) return;
    const allOpen = Object.values(openSections).some((val) => val === true);
    if (allOpen) {
      setOpenSections({});
    } else {
      const all: Record<string, boolean> = {};
      course.sections.forEach((s) => (all[s.id] = true));
      setOpenSections(all);
    }
  };

  const tabs = course ? [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'curriculum', label: `Kurikulum (${course.lessonsCount})` },
    { id: 'instructor', label: 'Pengajar' },
    { id: 'reviews', label: `Ulasan (${course.rating})` },
  ] : [];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (isCourseLoading) return <div className="p-12 text-center text-sm text-slate-500">Memuat detail kursus...</div>;
  if (!course) {
    return <div role="alert" className="mx-auto my-12 max-w-2xl rounded-xl border border-red/20 bg-red/5 p-6 text-sm text-red">{courseLoadError}</div>;
  }

  const courseMedia = getCourseMedia(course.slug);
  const instructorPhoto = getInstructorPhoto(course.instructor.id);
  const isWishlisted = savedCourseSlugs.includes(course.slug);
  const isEnrolled = enrolledCourses.some((enrollment) => enrollment.courseSlug === course.slug);
  const isFull = course.maxParticipants !== null && course.maxParticipants !== undefined
    && course.enrolledCount >= course.maxParticipants;
  const toggleWishlist = async () => {
    setWishlistError('');
    try {
      if (!isAuthenticated || role !== 'participant') {
        setWishlistError('Masuk sebagai peserta untuk menyimpan kursus.');
        return;
      }
      await toggleSavedCourse(course.slug);
    } catch (saveError) {
      setWishlistError(saveError instanceof Error ? saveError.message : 'Kursus gagal disimpan.');
    }
  };

  return (
    <div className="bg-app min-h-screen pb-20">
      {/* 1. HERO BANNER (Full width navy-to-blue gradient) */}
      <div className="bg-gradient-to-r from-navy via-navy to-blue text-white pt-10 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-white transition-colors">Kursus</Link>
            <span>/</span>
            <span className="text-white font-semibold truncate max-w-xs">{course.title}</span>
          </nav>

          {/* Badges */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
              {translateCategory(course.category)}
            </span>
            <span className="px-3 py-1 rounded-full bg-orange text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              Pendaftaran Angkatan 2025
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {/* Big White H1 Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-white">
                {course.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-6">
                {course.subtitle}
              </p>

              {/* Meta Row */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-200 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar src={instructorPhoto} name={course.instructor.name} size="xs" />
                  <span>Dibuat oleh <strong className="text-white">{course.instructor.name}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-300">
                  <Star className="w-4 h-4 fill-amber-300 stroke-amber-400" />
                  <span className="font-bold text-white">{course.rating}</span>
                  <span className="text-slate-300">({course.reviewCount} ulasan)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span>{course.enrolledCount.toLocaleString()} peserta terdaftar</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span>Diperbarui {course.lastUpdated}</span>
                </div>
              </div>

              {/* Chips */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{course.language}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-medium">
                  <span>Tingkat: {translateLevel(course.level)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT + STICKY PURCHASE CARD */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-6 lg:-mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Tabs + Stacked White Cards */}
          <div className="lg:col-span-8 space-y-8">
            {/* Pill-Style Tab Bar */}
            <div className="bg-white p-2 rounded-2xl border border-border shadow-sm flex items-center gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SECTION 1: ABOUT THIS COURSE */}
            <Card id="overview" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-blue" />
                <h2 className="text-xl font-extrabold text-text-heading">Tentang Kursus Ini</h2>
              </div>
              <div className="prose text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  {course.description}
                </p>
              </div>
            </Card>

            {/* SECTION 2: WHAT YOU'LL LEARN */}
            <Card className="p-8 bg-soft-blue/30 border-blue/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-orange" />
                <h2 className="text-xl font-extrabold text-text-heading">Yang Akan Kamu Pelajari</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.learningOutcomes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* SECTION 3: COURSE REQUIREMENTS */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-navy" />
                <h2 className="text-xl font-extrabold text-text-heading">Persyaratan Kursus</h2>
              </div>
              <ul className="space-y-3">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* SECTION 4: COURSE CURRICULUM */}
            <Card id="curriculum" className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-blue" />
                  <div>
                    <h2 className="text-xl font-extrabold text-text-heading">Kurikulum Kursus</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course.sections.length} Bagian • {course.lessonsCount} Pelajaran • Total {course.totalDuration}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={collapseAllSections}
                  className="text-xs font-bold text-blue hover:text-navy transition-colors self-start sm:self-auto"
                >
                  Buka / Tutup Semua
                </button>
              </div>

              {/* Accordions */}
              <div className="space-y-4">
                {course.sections.map((section) => {
                  const isOpen = !!openSections[section.id];
                  return (
                    <div
                      key={section.id}
                      className="border border-border rounded-xl bg-white overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 pr-4">
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isOpen ? 'transform rotate-180 text-blue' : ''
                            }`}
                          />
                          <span className="text-sm font-bold text-text-heading">
                            {section.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium shrink-0">
                          {section.lessons.length} Pelajaran
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-border/50 divide-y divide-border/40 bg-slate-50/40">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {lesson.type === 'video' ? (
                                  <Play className="w-3.5 h-3.5 text-blue shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-orange shrink-0" />
                                )}
                                <span className="font-medium text-slate-700 truncate">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {lesson.isPreview && (
                                  <span className="px-2 py-0.5 rounded-full bg-soft-blue text-blue text-[10px] font-bold uppercase tracking-wider">
                                    Pratinjau Gratis
                                  </span>
                                )}
                                <span className="text-slate-400">{lesson.duration}</span>
                              </div>
                            </div>
                          ))}

                          {section.quiz && (
                            <div className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs bg-orange-tint/40">
                              <div className="flex items-center gap-3 flex-1">
                                <HelpCircle className="w-4 h-4 text-orange shrink-0" />
                                <span className="font-bold text-orange-dark">
                                  {section.quiz.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[11px] font-semibold text-orange-dark">
                                  {section.quiz.questionsCount} Pertanyaan • {section.quiz.duration}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* SECTION 5: MEET YOUR INSTRUCTOR */}
            <Card id="instructor" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-navy" />
                <h2 className="text-xl font-extrabold text-text-heading">Kenali Pengajarmu</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <img
                  src={instructorPhoto}
                  alt={course.instructor.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-soft shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-heading mb-1">
                    {course.instructor.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue mb-3">
                    {course.instructor.title}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <strong className="text-slate-700">{course.instructor.rating}</strong> Rating
                    </div>
                    <span>•</span>
                    <div>
                      <strong className="text-slate-700">12.450</strong> Peserta
                    </div>
                    <span>•</span>
                    <div>
                      <strong className="text-slate-700">8</strong> Kursus
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {course.instructor.bio}
                  </p>

                  <p className="text-xs text-slate-400">Tautan profil pengajar belum tersedia.</p>
                </div>
              </div>
            </Card>

            {/* SECTION 6: STUDENT FEEDBACK & RATINGS */}
            <Card id="reviews" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-orange" />
                <h2 className="text-xl font-extrabold text-text-heading">
                  Ulasan & Penilaian Peserta
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-border mb-8">
                {/* Score breakdown left */}
                <div className="md:col-span-4 text-center md:text-left">
                  <div className="text-5xl font-extrabold text-text-heading tracking-tight mb-2">
                    4.9
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 block">
                    Penilaian Kursus • 428 Ulasan
                  </span>
                </div>

                {/* 5-bar breakdown (88/9/2/1%) */}
                <div className="md:col-span-8 space-y-2">
                  {[
                    { stars: 5, pct: 88 },
                    { stars: 4, pct: 9 },
                    { stars: 3, pct: 2 },
                    { stars: 2, pct: 1 },
                    { stars: 1, pct: 0 },
                  ].map((bar) => (
                    <div key={bar.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-slate-500">{bar.stars} bintang</span>
                      <div className="flex-1">
                        <ProgressBar progress={bar.pct} color="orange" size="xs" />
                      </div>
                      <span className="w-8 text-right font-semibold text-slate-600">
                        {bar.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two review cards */}
              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-border bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name="Sarah Jenkins" size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-text-heading">Sarah Jenkins</h4>
                        <span className="text-[11px] text-slate-400">2 minggu lalu</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ini adalah kursus pengembangan web paling terstruktur dan mudah dipahami yang pernah saya ikuti. John menjelaskan konsep React Fiber dan pengelolaan state yang rumit melalui contoh praktis.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name="Budi Santoso" size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-text-heading">Budi Santoso</h4>
                        <span className="text-[11px] text-slate-400">1 bulan lalu</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Kuis dan tantangan modul mendorong kita berpikir seperti seorang engineer. Empat minggu setelah menyelesaikan Modul 4, saya lulus evaluasi teknis frontend!
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Sticky Purchase Card */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="overflow-hidden shadow-soft-lg border-border">
              {/* Course video preview */}
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                {isPreviewPlaying ? (
                  courseMedia.previewVideoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${courseMedia.previewVideoId}?autoplay=1&rel=0`}
                      title={courseMedia.previewVideoTitle || `Pratinjau ${course.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy p-6 text-center text-sm font-semibold text-white">
                      Preview video belum tersedia untuk kursus ini.
                    </div>
                  )
                ) : (
                  courseMedia.previewVideoId ? (
                    <button
                      type="button"
                      onClick={() => setIsPreviewPlaying(true)}
                      className="absolute inset-0 w-full h-full group"
                      aria-label={`Putar pratinjau ${courseMedia.previewVideoTitle || course.title}`}
                    >
                      <img
                        src={courseMedia.previewPoster}
                        alt=""
                        className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-navy/30 flex flex-col items-center justify-center text-white">
                        <span className="w-14 h-14 rounded-full bg-white/90 text-navy flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-navy ml-1" />
                        </span>
                        <span className="text-xs font-bold mt-2 drop-shadow">
                          {courseMedia.previewVideoTitle}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy p-6 text-center text-sm font-semibold text-white">
                      Preview video belum tersedia untuk kursus ini.
                    </div>
                  )
                )}
              </div>

              {/* Pricing & CTA */}
              <div className="p-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-text-heading">
                    {formatIDR(course.price)}
                  </span>
                  <span className="text-base text-slate-400 line-through">
                    {formatIDR(course.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green-tint text-green text-xs font-bold border border-green/20">
                    45% OFF
                  </span>
                </div>

                {/* Urgency Alert Line */}
                <div className="text-xs font-semibold text-red mb-5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red" />
                  <span>Harga promo berakhir dalam 2 hari!</span>
                </div>

                {/* Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    variant="orange"
                    size="lg"
                    fullWidth
                    onClick={handleEnroll}
                    disabled={isEnrolling || isFull}
                    className="shadow-md"
                  >
                    {isFull && !isEnrolled ? 'Kuota Penuh' : isEnrolling ? 'Memproses...' : isEnrolled ? 'Lihat Kursus Saya' : 'Daftar Sekarang'}
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={handleEnroll}
                    disabled={isEnrolling || isFull}
                    className="bg-soft-blue/50 text-blue border-blue/20 hover:bg-soft-blue"
                  >
                    {isEnrolled ? 'Kursus Ditambahkan' : 'Tambah Kursus'}
                  </Button>
                </div>
                {enrollmentError && (
                  <p role="alert" className="mb-5 text-xs font-medium text-red">
                    {enrollmentError}
                  </p>
                )}

                <div className="text-center text-xs text-slate-400 mb-6">
                  Garansi uang kembali 30 hari • Akses selamanya
                </div>

                {/* This Course Includes */}
                <div className="pt-6 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-heading mb-4">
                    Kursus Ini Mencakup:
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue shrink-0" />
                      <span>{course.totalDuration} video sesuai permintaan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-blue shrink-0" />
                      <span>Sumber belajar yang dapat diunduh</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Code2 className="w-4 h-4 text-blue shrink-0" />
                      <span>Tantangan praktik pemrograman</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue shrink-0" />
                      <span>Akses penuh selamanya</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-blue shrink-0" />
                      <span>Akses melalui ponsel dan komputer</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-blue shrink-0" />
                      <span>Sertifikat kelulusan</span>
                    </li>
                  </ul>
                </div>

                {/* Social Share & Wishlist */}
                <div className="pt-6 border-t border-border mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => void toggleWishlist()}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red text-red' : ''}`} />
                    <span>{isWishlisted ? 'Disimpan' : 'Simpan Kursus'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={shareCourse}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                  </button>
                </div>
                {shareStatus && <p role="status" className="mt-2 text-right text-xs text-slate-500">{shareStatus}</p>}
                {wishlistError && <p role="alert" className="mt-2 text-right text-xs text-red">{wishlistError}</p>}
              </div>
            </Card>
          </div>
        </div>

        {/* 3. STUDENTS ALSO ENROLLED IN */}
        <div className="mt-20 pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-text-heading">
                Peserta Juga Mengikuti
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kursus yang sering diambil bersama program ini untuk memperdalam keterampilan full-stack.
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-bold text-blue hover:text-navy flex items-center gap-1.5"
            >
              <span>Jelajahi Semua Kursus</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((c) => (
              <CourseCard key={c.id} course={c} showPrice />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
