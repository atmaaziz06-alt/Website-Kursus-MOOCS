import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Award, Users, BookOpen } from 'lucide-react';
import { media } from '../../config/media';

export interface AuthSplitLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children, mode }) => {
  const isLogin = mode === 'login';
  const bgImage = isLogin ? media.auth.loginPanel : media.auth.registerPanel;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-app">
      {/* Left Brand Panel (5 cols on lg) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-navy text-white overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt="EduSpace Learning Community"
            className="w-full h-full object-cover mix-blend-overlay opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/95 to-navy" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-11 items-center justify-center rounded-lg bg-white p-0.5">
              <img src={media.brand.logoMark} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">EduSpace</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto py-12">
          {/* Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
            <span>{isLogin ? '✨ WELCOME TO EDUSPACE' : '✨ JOIN 20,000+ LEARNERS WORLDWIDE'}</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            {isLogin ? 'Continue Your Learning Journey' : 'Start Your Learning Journey'}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md">
            {isLogin
              ? 'Access your enrolled bootcamps, resume interactive video lessons, and test your skills with real-time graded evaluations.'
              : 'Empower your career with top-tier technical and design curricula recognized by top tech employers.'}
          </p>

          {/* Stat blocks */}
          <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/15">
            <div>
              <div className="text-2xl font-extrabold text-white">20K+</div>
              <div className="text-xs text-slate-300">
                {isLogin ? 'Active Learners' : 'Active Learners from 85+ countries'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">1,200+</div>
              <div className="text-xs text-slate-300">
                {isLogin ? 'Courses Available' : 'Accredited Tracks (Tech, AI & Design)'}
              </div>
            </div>
          </div>

          {/* 3 Feature Chips */}
          <div className="flex flex-wrap gap-2">
            {(isLogin
              ? ['Resume Anytime', 'Verified Certificates', 'Community Access']
              : ['Lifetime Access', 'Industry Certificates', '1-on-1 Mentorship']
            ).map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold border border-white/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-orange" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-slate-400">
          © 2025 EduSpace Inc. Empowering curious minds everywhere.
        </div>
      </div>

      {/* Right Column: Centered White Card (7 cols on lg) */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Back to Home link */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-white p-0.5">
                <img src={media.brand.logoMark} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <span className="font-bold text-navy">EduSpace</span>
            </Link>
            <Link to="/" className="text-xs text-slate-500 hover:text-navy flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Home
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
