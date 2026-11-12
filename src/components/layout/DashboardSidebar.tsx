import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Award,
  Bell,
  Settings,
  LogOut,
  Users,
  FolderTree,
  FileCheck2,
  PlusCircle,
  MessageCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { media } from '../../config/media';

export interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Tidak dapat keluar dari akun.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getNavItems = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'instructor':
        return [
          { label: 'Dasbor', path: '/instructor', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Kursus Saya', path: '/instructor/courses/course-web-dev-2025', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Buat Kursus', path: '/instructor/courses/new', icon: <PlusCircle className="w-4 h-4 text-orange" />, badge: 'BARU', badgeColor: 'bg-orange text-white' },
          { label: 'Peserta', path: '/instructor/students', icon: <Users className="w-4 h-4" /> },
          { label: 'Hasil Kuis', path: '/instructor/quiz-results', icon: <Award className="w-4 h-4" /> },
          { label: 'Notifikasi', path: '/instructor/notifications', icon: <Bell className="w-4 h-4" />, badge: '4', badgeColor: 'bg-orange text-white' },
          { label: 'Profil & Pengaturan', path: '/instructor/settings', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'admin':
        return [
          { label: 'Dasbor', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Pengguna', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
          { label: 'Kategori', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
          { label: 'Tinjauan Kursus', path: '/admin/courses-review', icon: <FileCheck2 className="w-4 h-4" />, badge: '12', badgeColor: 'bg-orange text-white' },
          { label: 'Notifikasi', path: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
          { label: 'Pengaturan', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'participant':
      default:
        return [
          { label: 'Dasbor', path: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Kursus Saya', path: '/student/courses', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Jelajahi Kursus', path: '/courses', icon: <Compass className="w-4 h-4" /> },
          { label: 'Hasil Kuis', path: '/student/quiz-results', icon: <Award className="w-4 h-4" /> },
          { label: 'Pesan', path: '/student/messages', icon: <MessageCircle className="w-4 h-4" /> },
          { label: 'Notifikasi', path: '/student/notifications', icon: <Bell className="w-4 h-4" />, badge: '3', badgeColor: 'bg-orange text-white' },
          { label: 'Profil & Pengaturan', path: '/student/settings', icon: <Settings className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems(role).map((item) =>
    item.path.endsWith('/notifications')
      ? { ...item, badge: unreadCount > 0 ? String(unreadCount) : undefined }
      : item
  );

  const getSubLabel = () => {
    if (role === 'instructor') return 'PUSAT PENGAJAR';
    if (role === 'admin') return 'PUSAT ADMIN';
    return 'AKADEMI EDUSPACE';
  };

  const isActive = (itemPath: string) => {
    if (itemPath === '/student' || itemPath === '/instructor' || itemPath === '/admin') {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-[220px] bg-navy text-white z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-navy-dark ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Logo Block */}
          <div className="p-5 flex items-center justify-between border-b border-navy-dark">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-white p-0.5">
                <img src={media.brand.logoMark} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-none">
                  EduSpace
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">
                  {getSubLabel()}
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden text-slate-400 hover:text-white p-1"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-3">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all select-none ${
                    active
                      ? 'bg-blue text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pinned Bottom: Sign Out */}
        <div className="p-3 border-t border-navy-dark">
          {logoutError && <p role="alert" className="px-3.5 pb-2 text-xs text-red-200">{logoutError}</p>}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-dark transition-colors disabled:opacity-60"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>{isLoggingOut ? 'Memproses...' : 'Keluar'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
