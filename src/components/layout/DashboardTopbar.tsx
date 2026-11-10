import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Flame, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';
import { getUserAvatar, getInstructorPhoto } from '../../config/media';

export interface DashboardTopbarProps {
  onToggleSidebar?: () => void;
  titleBadge?: React.ReactNode;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  onToggleSidebar,
  titleBadge,
}) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const getAvatarUrl = () => {
    if (role === 'instructor') {
      return getInstructorPhoto('john-smith');
    }
    return getUserAvatar(user?.avatarId || 'dian-paramitha');
  };

  const roleLabel = role === 'participant' ? 'Peserta' : role === 'instructor' ? 'Pengajar' : 'Admin';
  const notificationPath = role === 'participant'
    ? '/student/notifications'
    : role === 'instructor'
    ? '/instructor/notifications'
    : '/admin/notifications';

  const getPill = () => {
    if (titleBadge) return titleBadge;
    if (role === 'instructor') {
      return (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-blue text-blue text-xs font-bold border border-blue/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Periode penilaian semester 2 berakhir dalam 4 hari</span>
        </div>
      );
    }
    if (role === 'admin') {
      return (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-tint text-green text-xs font-bold border border-green/20">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span>Semua sistem beroperasi normal</span>
        </div>
      );
    }
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-tint text-orange-dark text-xs font-bold border border-orange/20">
        <Flame className="w-3.5 h-3.5 text-orange" />
        <span>Belajar 5 hari berturut-turut</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border h-16 px-4 sm:px-8 flex items-center justify-between shadow-sm">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-navy hover:bg-slate-100 transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form
          className="relative flex items-center w-full"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(`/courses?q=${encodeURIComponent(search.trim())}`);
          }}
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Cari kursus"
            placeholder={
              role === 'admin'
                ? 'Cari kursus, pengajar, peserta, atau log sistem...'
                : role === 'instructor'
                ? 'Cari kursus, peserta, laporan...'
                : 'Cari kursus, pelajaran, catatan...'
            }
            className="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl border border-border pl-10 pr-3.5 py-2 transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue/20 focus:border-blue placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right: Pill, Bell, Divider, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 pl-4">
        {getPill()}

        {/* Bell Icon */}
        <button
          type="button"
          onClick={() => navigate(notificationPath)}
          className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-orange absolute top-2 right-2 ring-2 ring-white" />
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* User Info & Avatar */}
        <div className="flex items-center gap-2.5">
          <Avatar
            src={getAvatarUrl()}
            name={user?.name || 'User'}
            size="sm"
          />
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-text-heading block leading-tight">
              {user?.name || 'Dian Paramitha'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block capitalize">
              {user?.title || roleLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
