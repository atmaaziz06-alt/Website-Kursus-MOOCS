import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { media } from '../../config/media';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const dashboardPath = role === 'instructor' ? '/instructor' : role === 'admin' ? '/admin' : '/student';
  const primaryPath = role === 'participant' ? '/student/courses' : dashboardPath;
  const primaryLabel = role === 'participant' ? 'Kursus Saya' : 'Dasbor';

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Kursus', path: '/courses' },
    { label: 'Cara Kerja', path: '/#how-it-works', targetId: 'how-it-works' },
    { label: 'Kategori', path: '/#categories', targetId: 'categories' },
    { label: 'Tentang Kami', path: '/#about', targetId: 'about' },
    { label: 'Kontak', path: '/#contact', targetId: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (link.targetId) {
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(link.targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', `#${link.targetId}`);
        }
      } else {
        // Navigating from another page to home section
        e.preventDefault();
        navigate(`/#${link.targetId}`);
      }
    }
  };

  const isActive = (link: typeof navLinks[0]) => {
    if (link.path === '/') return location.pathname === '/' && !location.hash;
    if (link.targetId) return location.hash === `#${link.targetId}`;
    return location.pathname.startsWith(link.path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-12 items-center justify-center transition-transform group-hover:scale-105">
            <img src={media.brand.logoMark} alt="" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-navy tracking-tight block leading-none">
              EduSpace
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mt-0.5">
              Belajar untuk semua
            </span>
          </div>
        </Link>

        {/* Center Nav Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`text-sm font-semibold transition-colors py-2 relative cursor-pointer ${
                  active
                    ? 'text-navy font-bold'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors"
            aria-label="Cari kursus"
          >
            <Search className="w-4 h-4" />
          </button>

          {isAuthenticated ? (
            <Link to={dashboardPath} className="text-sm font-bold text-navy hover:text-blue px-3 py-2">
              {user?.name?.split(' ')[0] || 'Akun Saya'}
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-bold text-navy hover:text-blue px-3 py-2">
              Masuk
            </Link>
          )}

          <Button
            variant="orange"
            size="md"
            onClick={() => navigate(isAuthenticated ? primaryPath : '/courses')}
            className="shadow-sm"
          >
            {isAuthenticated ? primaryLabel : 'Daftar Kursus'}
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-slate-600"
            aria-label="Cari"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-700"
            aria-label="Buka navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, link);
              }}
              className="block text-sm font-semibold text-slate-700 hover:text-navy py-1.5 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold text-navy border border-border rounded-xl"
              >
                {user?.name || 'Akun Saya'}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold text-navy border border-border rounded-xl"
              >
                Masuk
              </Link>
            )}
            <Button
              variant="orange"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(isAuthenticated ? primaryPath : '/courses');
              }}
            >
              {isAuthenticated ? primaryLabel : 'Daftar Kursus'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
