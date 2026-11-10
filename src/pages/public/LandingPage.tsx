import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Play,
  ArrowRight,
  Code,
  Briefcase,
  Palette,
  Terminal,
  TrendingUp,
  Sparkles,
  Search,
  UserCheck,
  BookOpen,
  CheckCircle2,
  Users,
  GraduationCap,
  Layers,
  Percent,
  Mail,
  Phone,
  MapPin,
  Check,
} from 'lucide-react';
import { Button, Card, Avatar } from '../../components/ui';
import { CourseCard } from '../../components/course/CourseCard';
import { mockCourses } from '../../data/mockData';
import { media, getUserAvatar } from '../../config/media';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const featuredCourses = mockCourses.slice(0, 4);

  // Scroll to hash element on load / hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  const categories = [
    { name: 'Technology', count: 24, icon: <Terminal className="w-6 h-6 text-blue" /> },
    { name: 'Business', count: 18, icon: <Briefcase className="w-6 h-6 text-blue" /> },
    { name: 'Design', count: 16, icon: <Palette className="w-6 h-6 text-blue" /> },
    { name: 'Development', count: 20, icon: <Code className="w-6 h-6 text-blue" /> },
    { name: 'Marketing', count: 14, icon: <TrendingUp className="w-6 h-6 text-blue" /> },
    { name: 'Personal Growth', count: 12, icon: <Sparkles className="w-6 h-6 text-blue" /> },
  ];

  const steps = [
    {
      step: 'Step 01',
      title: 'Find a Course',
      desc: 'Browse our catalog of 1,200+ accredited tech, business, and design courses tailored for industry demands.',
      icon: <Search className="w-6 h-6 text-white" />,
    },
    {
      step: 'Step 02',
      title: 'Register & Enroll',
      desc: 'Create your account in seconds, access financial aid or cohort tracks, and unlock immediate syllabus access.',
      icon: <UserCheck className="w-6 h-6 text-white" />,
    },
    {
      step: 'Step 03',
      title: 'Learn the Materials',
      desc: 'Watch HD video lectures, download interactive cheatsheets, and practice code directly inside your browser.',
      icon: <BookOpen className="w-6 h-6 text-white" />,
    },
    {
      step: 'Step 04',
      title: 'Take Quizzes & Track Progress',
      desc: 'Solidify your knowledge with timed assessments, earn verified certificates, and showcase your achievements.',
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
    },
  ];

  const stats = [
    { number: '20,000+', label: 'Active Students', icon: <Users className="w-5 h-5 text-blue" /> },
    { number: '500+', label: 'Expert Instructors', icon: <GraduationCap className="w-5 h-5 text-blue" /> },
    { number: '1,200+', label: 'Courses Available', icon: <Layers className="w-5 h-5 text-blue" /> },
    { number: '95%', label: 'Success Rate', icon: <Percent className="w-5 h-5 text-blue" /> },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="bg-app py-14 lg:py-20 border-b border-border/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7">
              {/* Overline pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-soft-blue text-blue border border-blue/20 text-xs font-bold uppercase tracking-wider mb-5">
                <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                BEST ONLINE EDUCATION
              </div>

              {/* H1 Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-extrabold text-text-heading tracking-tight leading-[1.15] mb-6">
                Build Your Future With{' '}
                <span className="text-blue relative inline-block">
                  EduSpace
                  {/* Hand-drawn SVG underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blue"
                    viewBox="0 0 250 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 10.5C55 3.5 195 2 247 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Paragraph */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Find courses, learn at your own pace, take quizzes and track your progress, all in one online learning platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Button
                  variant="navy"
                  size="lg"
                  onClick={() => navigate('/courses')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Courses
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/courses/web-development-bootcamp-2025')}
                  leftIcon={<Play className="w-4 h-4 text-orange fill-orange" />}
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-heading">Accredited Degrees</h4>
                    <p className="text-xs text-slate-500">Verified certificates</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-heading">Top Mentors</h4>
                    <p className="text-xs text-slate-500">From leading tech firms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols) - Visual block with floating cards */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Decorative dots top-right */}
              <div className="absolute -top-4 -right-4 flex gap-1.5 z-10">
                <div className="w-3 h-3 rounded-full bg-orange animate-bounce" />
                <div className="w-3 h-3 rounded-full bg-blue" />
                <div className="w-3 h-3 rounded-full bg-navy" />
              </div>

              {/* Main Image Container */}
              <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-soft-lg border-4 border-white bg-blue">
                <img
                  src={media.hero.mainImage}
                  alt="Students learning on EduSpace"
                  className="w-full h-full object-cover mix-blend-normal"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Card Top-Left: "20K+ Active Students" with overlapping avatar circles */}
                <div className="absolute top-6 left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-soft-md border border-border flex items-center gap-3 animate-fade-in z-20">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    <Avatar src={getUserAvatar('dian-paramitha')} name="Dian Paramitha" size="sm" />
                    <Avatar src={getUserAvatar('rian-hidayat')} name="Rian Hidayat" size="sm" />
                    <Avatar src={getUserAvatar('ahmad-fauzi')} name="Ahmad Fauzi" size="sm" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-text-heading block leading-tight">
                      20K+
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Active Students
                    </span>
                  </div>
                </div>

                {/* Floating Card Bottom-Right: "95% Success Rate" */}
                <div className="absolute bottom-6 right-4 sm:-right-6 bg-white rounded-2xl p-3.5 shadow-soft-md border border-border flex items-center gap-3 z-20">
                  <div className="w-10 h-10 rounded-xl bg-orange-tint flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-text-heading block leading-tight">
                      95%
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Success Rate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {/* Centered Title & Subtitle */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
              FEATURED CURRICULUM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mb-3">
              Explore Our Featured Courses
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Explore curated professional courses led by industry veterans to advance your career.
            </p>
          </div>

          {/* 4 Course cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} showPrice />
            ))}
          </div>

          {/* Centered navy "View All Courses →" button */}
          <div className="text-center">
            <Button
              variant="navy"
              size="lg"
              onClick={() => navigate('/courses')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* 3. COURSE CATEGORIES SECTION (Tinted background) */}
      <section id="categories" className="py-20 bg-app border-y border-border/60 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
              EXPLORE BY TOPIC
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mb-3">
              Course Categories
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Discover industry-focused learning tracks crafted to prepare you for high-impact roles.
            </p>
          </div>

          {/* 3x2 grid of white cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Card
                key={cat.name}
                hoverable
                onClick={() => navigate(`/courses?category=${cat.name}`)}
                className="p-8 text-center flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-soft-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-1.5 group-hover:text-blue transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {cat.count} Courses
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
              SEAMLESS LEARNING
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Follow our simple four-step pathway from initial onboarding to verified course graduation.
            </p>
          </div>

          {/* 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st) => (
              <div key={st.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center mb-4 shadow-sm">
                  {st.icon}
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-[11px] font-bold uppercase tracking-wider mb-2">
                  {st.step}
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-2">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT US SECTION */}
      <section id="about" className="py-20 bg-app border-y border-border/60 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
              ABOUT EDUSPACE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mb-3">
              Empowering 20,000+ Learners Worldwide
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We bridge the gap between academic theory and high-growth industry standards through real-world mentorship, hands-on coding labs, and accredited credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-soft-blue text-blue flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">Accredited Certifications</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Graduates receive verified digital credentials recognized by global tech employers and industry advisory councils.
              </p>
            </Card>

            <Card className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-tint text-orange flex items-center justify-center mb-5">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">Staff Engineer Mentors</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Learn directly from veterans with real architecture backgrounds from Meta, Stripe, Google, and top unicorn startups.
              </p>
            </Card>

            <Card className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-green-tint text-green flex items-center justify-center mb-5">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">Interactive Code Labs</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Gain muscle memory through timed module assessments, in-browser sandbox exercises, and weekly live breakout code reviews.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. STATS BAND SECTION */}
      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="bg-navy rounded-3xl p-8 sm:p-12 shadow-soft-lg text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-navy-dark">
              {stats.map((st, idx) => (
                <div
                  key={st.label}
                  className={`flex flex-col items-center text-center ${
                    idx > 0 ? 'lg:pl-8' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    {st.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1 text-white">
                    {st.number}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-300">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONTRAST CTA PANEL SECTION */}
      <section className="py-16 bg-app">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {/* Deep Navy/Dark Slate Background with Crisp White & Radiant Orange Highlights */}
          <div className="relative rounded-3xl p-8 sm:p-12 lg:p-14 shadow-soft-lg overflow-hidden bg-[#071355] border border-blue/30">
            {/* Background ambient decorative glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-orange/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                {/* Overline Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-200 border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                  <span>START YOUR JOURNEY TODAY</span>
                </div>

                {/* Heading with Ultra-High Contrast */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                  Ready to start{' '}
                  <span className="text-[#FFAE19] drop-shadow-sm inline-block underline decoration-[#FFAE19]/40 underline-offset-8">
                    learning?
                  </span>
                </h2>

                {/* Subtitle with High-Contrast White/Slate */}
                <p className="text-slate-100 text-base sm:text-lg leading-relaxed mb-6 font-normal">
                  Join over 20,000 active students advancing their tech, design, and business careers with verified credentials today.
                </p>

                {/* Feature Checkpoints */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200 justify-center lg:justify-start">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-orange" />
                    <span>No credit card required to explore</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-orange" />
                    <span>30-Day Money-Back Guarantee</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-orange" />
                    <span>Instant Course Access</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: High Contrast */}
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto z-10">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange hover:bg-orange-dark text-white font-extrabold text-base shadow-lg shadow-orange/30 transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
                >
                  Register Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-navy font-extrabold text-base shadow-md transition-all hover:scale-105 active:scale-95 text-center border-none cursor-pointer"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT / SUPPORT SECTION */}
      <section id="contact" className="py-16 bg-white border-t border-border scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
              CONTACT & CAMPUS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-heading tracking-tight mb-2">
              We're Here to Help You Succeed
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Have questions regarding admissions, corporate cohort packages, or syllabus accreditation? Get in touch with our advisory team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-soft-blue text-blue flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-heading mb-1">Email Advisory</h4>
              <p className="text-xs text-slate-500 mb-2">Direct assistance within 2 hours</p>
              <a href="mailto:info@eduspace.com" className="text-xs font-bold text-blue hover:underline">
                info@eduspace.com
              </a>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-orange-tint text-orange flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-heading mb-1">Student Hotline</h4>
              <p className="text-xs text-slate-500 mb-2">Mon - Fri, 09:00 - 18:00 WIB</p>
              <a href="tel:+12345678900" className="text-xs font-bold text-orange hover:underline">
                +1 234 567 8900
              </a>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-green-tint text-green flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-heading mb-1">Global Campus Hub</h4>
              <p className="text-xs text-slate-500 mb-2">Level 18, EduSpace Tower</p>
              <span className="text-xs font-bold text-slate-700">
                Jakarta & Singapore
              </span>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
