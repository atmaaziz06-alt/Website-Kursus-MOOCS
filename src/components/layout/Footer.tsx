import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from '../ui/SocialIcons';
import { media } from '../../config/media';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-dark text-slate-300 pt-16 pb-8 border-t border-navy">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-12 items-center justify-center rounded-lg bg-white p-0.5">
                <img src={media.brand.logoMark} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight block leading-none">
                  EduSpace
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mt-0.5">
                  Learning for everyone
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              EduSpace is a premier online education and cohort bootcamp platform designed to empower learners worldwide through verified skills, top mentors, and real-world certifications.
            </p>
            <div className="flex items-center gap-2.5">
              {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#social"
                  className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-white transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Learner Portal
                </Link>
              </li>
              <li>
                <Link to="/instructor" className="text-slate-400 hover:text-white transition-colors">
                  Instructor Hub
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Course Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Categories
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/courses?category=Technology" className="text-slate-400 hover:text-white transition-colors">
                  Technology (24)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Development" className="text-slate-400 hover:text-white transition-colors">
                  Development (20)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Business" className="text-slate-400 hover:text-white transition-colors">
                  Business & Management (18)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Design" className="text-slate-400 hover:text-white transition-colors">
                  UI/UX & Product Design (16)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Marketing" className="text-slate-400 hover:text-white transition-colors">
                  Digital Marketing (14)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Support & Campus
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                <span>EduSpace Global Tower, Level 18, Jakarta & Singapore</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange shrink-0" />
                <span>support@eduspace.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange shrink-0" />
                <span>+1 234 567 8900</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2025 EduSpace. All rights reserved. Learning for everyone.
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#sitemap" className="hover:text-white transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
