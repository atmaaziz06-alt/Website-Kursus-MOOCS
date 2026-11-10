import React, { useState } from 'react';
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
import { primaryWebDevCourse, mockCourses } from '../../data/mockData';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';
import { Button, Card, Avatar, ProgressBar } from '../../components/ui';
import { CourseCard } from '../../components/course/CourseCard';
import { TwitterIcon, LinkedinIcon } from '../../components/ui/SocialIcons';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  const { enrolledCourses, enrollInCourse } = useCourses();

  // Find course or default to primary Web Dev 2025
  const course = mockCourses.find((c) => c.slug === slug) || primaryWebDevCourse;
  const courseMedia = getCourseMedia(course.slug);
  const instructorPhoto = getInstructorPhoto(course.instructor.id);

  const [activeTab, setActiveTab] = useState('overview');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'sec-1': true,
    'sec-4': true,
  });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(() => {
    const state = location.state as { enrollmentRoleError?: boolean } | null;
    return state?.enrollmentRoleError
      ? 'Only participant accounts can enroll in courses. Please sign in as a participant.'
      : '';
  });
  const isEnrolled = enrolledCourses.some((enrollment) => enrollment.courseSlug === course.slug);

  const handleEnroll = () => {
    setEnrollmentError('');
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location.pathname, enrollCourse: course.slug },
      });
      return;
    }
    if (role !== 'participant') {
      setEnrollmentError('Only participant accounts can enroll in courses. Please sign in as a participant.');
      return;
    }
    if (isEnrolled) {
      navigate('/student/courses');
      return;
    }

    enrollInCourse(course);
    navigate('/student/courses', { state: { enrolledCourse: course.title } });
  };

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const collapseAllSections = () => {
    const allOpen = Object.values(openSections).some((val) => val === true);
    if (allOpen) {
      setOpenSections({});
    } else {
      const all: Record<string, boolean> = {};
      course.sections.forEach((s) => (all[s.id] = true));
      setOpenSections(all);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: `Curriculum (${course.lessonsCount})` },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: `Reviews (${course.rating})` },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Related courses
  const relatedCourses = mockCourses
    .filter((c) => c.slug !== course.slug)
    .slice(0, 3);

  return (
    <div className="bg-app min-h-screen pb-20">
      {/* 1. HERO BANNER (Full width navy-to-blue gradient) */}
      <div className="bg-gradient-to-r from-navy via-navy to-blue text-white pt-10 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-white font-semibold truncate max-w-xs">{course.title}</span>
          </nav>

          {/* Badges */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
              TECHNOLOGY & DEVELOPMENT
            </span>
            <span className="px-3 py-1 rounded-full bg-orange text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              2025 Cohort Enrolling
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
                  <span>Created by <strong className="text-white">{course.instructor.name}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-300">
                  <Star className="w-4 h-4 fill-amber-300 stroke-amber-400" />
                  <span className="font-bold text-white">{course.rating}</span>
                  <span className="text-slate-300">({course.reviewCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span>{course.enrolledCount.toLocaleString()} enrolled students</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span>Updated {course.lastUpdated}</span>
                </div>
              </div>

              {/* Chips */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{course.language}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-medium">
                  <span>Level: Beginner to Intermediate</span>
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
                <h2 className="text-xl font-extrabold text-text-heading">About This Course</h2>
              </div>
              <div className="prose text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  The Web Development Bootcamp 2025 is engineered to take you from foundational syntax to architecting enterprise-grade web applications. Designed closely with senior staff engineers from Silicon Valley and leading technology startups, this curriculum balances foundational computer science theory with production-tested tooling.
                </p>
                <p>
                  Throughout this comprehensive journey, you will construct interactive Single Page Applications using React 18, engineer scalable backend microservices with Node.js and PostgreSQL, and deploy high-concurrency cloud environments with Docker and modern CI/CD pipelines.
                </p>
              </div>
            </Card>

            {/* SECTION 2: WHAT YOU'LL LEARN */}
            <Card className="p-8 bg-soft-blue/30 border-blue/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-orange" />
                <h2 className="text-xl font-extrabold text-text-heading">What You'll Learn</h2>
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
                <h2 className="text-xl font-extrabold text-text-heading">Course Requirements</h2>
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
                    <h2 className="text-xl font-extrabold text-text-heading">Course Curriculum</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      5 Sections • 38 Lectures • 24h 45m total length
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={collapseAllSections}
                  className="text-xs font-bold text-blue hover:text-navy transition-colors self-start sm:self-auto"
                >
                  Collapse / Expand All
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
                          {section.lessons.length} Lectures
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
                                    Preview Free
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
                                  {section.quiz.questionsCount} Questions • {section.quiz.duration}
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
                <h2 className="text-xl font-extrabold text-text-heading">Meet Your Instructor</h2>
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
                      <strong className="text-slate-700">12,450</strong> Students
                    </div>
                    <span>•</span>
                    <div>
                      <strong className="text-slate-700">8</strong> Courses
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {course.instructor.bio}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors"
                      aria-label="Twitter profile"
                    >
                      <TwitterIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors"
                      aria-label="LinkedIn profile"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors"
                      aria-label="Website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* SECTION 6: STUDENT FEEDBACK & RATINGS */}
            <Card id="reviews" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full bg-orange" />
                <h2 className="text-xl font-extrabold text-text-heading">
                  Student Feedback & Ratings
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
                    Course Rating • 428 Reviews
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
                      <span className="w-12 text-slate-500">{bar.stars} stars</span>
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
                        <span className="text-[11px] text-slate-400">2 weeks ago</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This is undoubtedly the most structured and well-explained web development course I've ever taken. John breaks down complex React Fiber reconciliation and state closures into practical mental models.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name="Budi Santoso" size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-text-heading">Budi Santoso</h4>
                        <span className="text-[11px] text-slate-400">1 month ago</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The quizzes and module challenges push you to think like an engineer. Within 4 weeks of completing Module 4, I passed my technical frontend assessment!
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Sticky Purchase Card */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="overflow-hidden shadow-soft-lg border-border">
              {/* Video Preview Poster with Play Button */}
              <div className="relative aspect-[16/9] w-full bg-navy overflow-hidden group cursor-pointer">
                <img
                  src={courseMedia.previewPoster}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-navy/30 flex flex-col items-center justify-center text-white">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-navy flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-navy ml-1" />
                  </div>
                  <span className="text-xs font-bold mt-2 drop-shadow">
                    Preview this course
                  </span>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="p-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-text-heading">
                    ${course.price.toFixed(2)}
                  </span>
                  <span className="text-base text-slate-400 line-through">
                    ${course.originalPrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green-tint text-green text-xs font-bold border border-green/20">
                    45% OFF
                  </span>
                </div>

                {/* Urgency Alert Line */}
                <div className="text-xs font-semibold text-red mb-5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red" />
                  <span>Special promotional price ends in 2 days!</span>
                </div>

                {/* Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    variant="orange"
                    size="lg"
                    fullWidth
                    onClick={handleEnroll}
                    className="shadow-md"
                  >
                    {isEnrolled ? 'Go to My Courses' : 'Enroll Now'}
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={handleEnroll}
                    className="bg-soft-blue/50 text-blue border-blue/20 hover:bg-soft-blue"
                  >
                    {isEnrolled ? 'Course Added' : 'Add Course'}
                  </Button>
                </div>
                {enrollmentError && (
                  <p role="alert" className="mb-5 text-xs font-medium text-red">
                    {enrollmentError}
                  </p>
                )}

                <div className="text-center text-xs text-slate-400 mb-6">
                  30-Day Money-Back Guarantee • Lifetime Access
                </div>

                {/* This Course Includes */}
                <div className="pt-6 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-heading mb-4">
                    This Course Includes:
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue shrink-0" />
                      <span>24.5 hours on-demand video</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-blue shrink-0" />
                      <span>38 downloadable resources</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Code2 className="w-4 h-4 text-blue shrink-0" />
                      <span>12 practical coding challenges</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue shrink-0" />
                      <span>Full lifetime access</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-blue shrink-0" />
                      <span>Access on mobile and desktop</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-blue shrink-0" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>

                {/* Social Share & Wishlist */}
                <div className="pt-6 border-t border-border mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red text-red' : ''}`} />
                    <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 3. STUDENTS ALSO ENROLLED IN */}
        <div className="mt-20 pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-text-heading">
                Students Also Enrolled In
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Frequently taken alongside this curriculum to accelerate full-stack mastery.
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-bold text-blue hover:text-navy flex items-center gap-1.5"
            >
              <span>Explore All Courses</span>
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
