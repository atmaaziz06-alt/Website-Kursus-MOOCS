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
  Download,
  Smartphone,
  ChevronDown,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getInstructorPhoto } from '../../config/media';
import { formatIDR } from '../../config/currency';
import { translateCategory, translateLevel } from '../../config/locale';
import { Button, Card, Avatar } from '../../components/ui';
import { CourseCard } from '../../components/course/CourseCard';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { getCourseBySlug, getCourseReviews, getCourses, CourseReview } from '../../services/courseService';
import { Course } from '../../types';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  const { enrolledCourses, enrollInCourse, savedCourseSlugs, toggleSavedCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [courseLoadError, setCourseLoadError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
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
    setReviews([]);
    setReviewsError('');
    setIsReviewsLoading(false);
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
      setIsReviewsLoading(true);
      void getCourseReviews(loadedCourse.id)
        .then((loadedReviews) => { if (active) setReviews(loadedReviews); })
        .catch((reviewError: unknown) => {
          if (active) setReviewsError(reviewError instanceof Error ? reviewError.message : 'Ulasan gagal dimuat.');
        })
        .finally(() => { if (active) setIsReviewsLoading(false); });
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
    { id: 'reviews', label: `Ulasan (${course.reviewCount})` },
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

  const instructorPhoto = getInstructorPhoto(course.instructor.id);
  const previewLesson = course.sections.flatMap((section) => section.lessons)
    .find((lesson) => lesson.isPreview);
  const formattedLastUpdated = Number.isNaN(new Date(course.lastUpdated).getTime())
    ? course.lastUpdated
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(course.lastUpdated));
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
              {course.price === 0 ? 'Gratis' : 'Kursus berbayar'}
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

                {course.reviewCount > 0 ? (
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Star className="w-4 h-4 fill-amber-300 stroke-amber-400" />
                    <span className="font-bold text-white">{course.rating.toFixed(1)}</span>
                    <span className="text-slate-300">({course.reviewCount} ulasan)</span>
                  </div>
                ) : <span className="text-slate-300">Belum ada ulasan</span>}

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span>{course.enrolledCount.toLocaleString()} peserta terdaftar</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span>Diperbarui {formattedLastUpdated}</span>
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
                {course.learningOutcomes.length > 0 ? course.learningOutcomes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                      {item}
                    </span>
                  </div>
                )) : <p className="text-sm text-slate-500">Capaian pembelajaran belum ditambahkan pengajar.</p>}
              </div>
            </Card>

            {/* SECTION 3: COURSE REQUIREMENTS */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-navy" />
                <h2 className="text-xl font-extrabold text-text-heading">Persyaratan Kursus</h2>
              </div>
              {course.requirements.length > 0 ? (
                <ul className="space-y-3">
                  {course.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">Tidak ada persyaratan khusus.</p>}
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
                              className={`px-5 py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-white transition-colors ${lesson.isPreview ? 'bg-white' : ''}`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {lesson.type === 'video' ? (
                                  <Play className="w-3.5 h-3.5 text-blue shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-orange shrink-0" />
                                )}
                                {lesson.isPreview ? (
                                  <Link to={`/preview/${course.slug}/${lesson.id}`} className="font-medium text-blue hover:underline truncate">
                                    {lesson.title}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-slate-700 truncate">{lesson.title}</span>
                                )}
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
                    <div>
                      <strong className="text-slate-700">{course.instructor.studentsCount.toLocaleString('id-ID')}</strong> Peserta
                    </div>
                    <span>•</span>
                    <div>
                      <strong className="text-slate-700">{course.instructor.coursesCount.toLocaleString('id-ID')}</strong> Kursus
                    </div>
                  </div>

                  {course.instructor.bio && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">{course.instructor.bio}</p>
                  )}
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

              <div className="pb-6 border-b border-border mb-6">
                <div className="text-4xl font-extrabold text-text-heading">
                  {course.reviewCount > 0 ? course.rating.toFixed(1) : '—'}
                </div>
                <div className="mt-1 flex items-center gap-1 text-amber-400" aria-label={`${course.rating.toFixed(1)} dari 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= Math.round(course.rating) && course.reviewCount > 0 ? 'fill-amber-400' : ''}`} />
                  ))}
                </div>
                <span className="mt-1 block text-xs text-slate-500">
                  {course.reviewCount.toLocaleString('id-ID')} ulasan peserta
                </span>
              </div>

              <div className="space-y-4">
                {reviewsError && <p role="alert" className="text-sm text-red">{reviewsError}</p>}
                {isReviewsLoading && <p className="text-sm text-slate-500">Memuat ulasan...</p>}
                {!isReviewsLoading && !reviewsError && reviews.length === 0 && (
                  <p className="rounded-xl border border-border bg-slate-50 p-5 text-sm text-slate-500">
                    Belum ada ulasan untuk kursus ini.
                  </p>
                )}
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-border bg-slate-50/50 p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-text-heading">Peserta</h4>
                        <time dateTime={review.createdAt} className="text-[11px] text-slate-400">
                          {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(review.createdAt))}
                        </time>
                      </div>
                      <div className="flex items-center" aria-label={`Nilai ${review.rating} dari 5`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{review.comment}</p>
                  </article>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Sticky Purchase Card */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="overflow-hidden shadow-soft-lg border-border">
              {/* Course video preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy">
                {course.thumbnailUrl && <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-70" />}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy/40 p-5 text-center text-white">
                  {previewLesson ? (
                    <>
                      <p className="text-sm font-semibold">{previewLesson.title}</p>
                      <Link to={`/preview/${course.slug}/${previewLesson.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-navy hover:bg-slate-100">
                        <Play className="h-4 w-4 fill-current" /> Coba materi gratis
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm font-semibold">Pengajar belum menyediakan materi pratinjau.</p>
                  )}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="p-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-text-heading">
                    {formatIDR(course.price)}
                  </span>
                  {course.originalPrice > course.price && (
                    <>
                      <span className="text-base text-slate-400 line-through">{formatIDR(course.originalPrice)}</span>
                      <span className="rounded-full border border-green/20 bg-green-tint px-2 py-0.5 text-xs font-bold text-green">
                        {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="mb-5 text-xs text-slate-500">
                  {course.price > 0
                    ? 'Pendaftaran kursus berbayar masih menggunakan simulasi; belum ada transaksi nyata.'
                    : 'Kursus gratis. Kamu bisa mendaftar untuk mulai belajar.'}
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

                {/* This Course Includes */}
                <div className="pt-6 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-heading mb-4">
                    Kursus Ini Mencakup:
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue shrink-0" />
                      <span>{course.lessonsCount} materi • {course.totalDuration}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-blue shrink-0" />
                      <span>Video, tulisan, dan lampiran sesuai kurikulum</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-blue shrink-0" />
                      <span>Akses belajar melalui ponsel dan komputer</span>
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
                Temukan kursus lain yang tersedia di EduSpace.
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
