import React, { useState } from 'react';
import { Bell, CheckCircle2, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import { Avatar, Button, Card, Toggle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getInstructorPhoto, getUserAvatar } from '../config/media';
import { UserRole } from '../types';

interface Preferences {
  emailUpdates: boolean;
  productAnnouncements: boolean;
  weeklySummary: boolean;
}

const defaultPreferences: Preferences = {
  emailUpdates: true,
  productAnnouncements: false,
  weeklySummary: true,
};

const preferenceKeys: Record<keyof Preferences, string> = {
  emailUpdates: 'email_updates',
  productAnnouncements: 'product_announcements',
  weeklySummary: 'weekly_summary',
};

const readPreference = (role: UserRole, key: keyof Preferences): boolean => {
  const saved = localStorage.getItem(`eduspace_preference_${role}_${preferenceKeys[key]}`);
  return saved === null ? defaultPreferences[key] : saved === 'true';
};

const getInitialPreferences = (role: UserRole): Preferences => {
  return {
    emailUpdates: readPreference(role, 'emailUpdates'),
    productAnnouncements: readPreference(role, 'productAnnouncements'),
    weeklySummary: readPreference(role, 'weeklySummary'),
  };
};

export const AccountSettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [preferences, setPreferences] = useState(() => getInitialPreferences(role));
  const [saved, setSaved] = useState(false);
  const roleLabel = role === 'participant' ? 'Peserta' : role === 'instructor' ? 'Pengajar' : 'Admin';
  const avatar = role === 'instructor'
    ? getInstructorPhoto(user?.avatarId || 'john-smith')
    : getUserAvatar(user?.avatarId || 'dian-paramitha');

  const updatePreference = (key: keyof Preferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const savePreferences = () => {
    (Object.keys(preferences) as (keyof Preferences)[]).forEach((key) => {
      localStorage.setItem(
        `eduspace_preference_${role}_${preferenceKeys[key]}`,
        String(preferences[key])
      );
    });
    setSaved(true);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue mb-1">Akun</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">Profil & Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola profil dan preferensi komunikasimu.</p>
      </div>

      <Card className="p-5 sm:p-7">
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <Avatar src={avatar} name={user?.name || 'User'} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-text-heading">{user?.name || 'User'}</h2>
            <p className="text-sm text-slate-500">{roleLabel}</p>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-green-tint px-3 py-1 text-xs font-bold text-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            Akun aktif
          </span>
        </div>

        <div className="grid gap-5 pt-5 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Nama lengkap</p>
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
              <UserRound className="w-4 h-4 text-slate-400" />
              <span>{user?.name || 'User'}</span>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Alamat email</p>
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-slate-50 px-3.5 py-3 text-sm text-slate-700 break-all">
              <Mail className="w-4 h-4 shrink-0 text-slate-400" />
              <span>{user?.email || 'No email available'}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <LockKeyhole className="w-3.5 h-3.5" />
          Detail profil dikelola melalui akun EduSpace-mu.
        </p>
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="mb-5">
          <h2 className="text-base font-bold text-text-heading">Preferensi notifikasi</h2>
          <p className="mt-1 text-sm text-slate-500">Pilih informasi yang ingin kamu terima.</p>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Pembaruan email</p>
              <p className="mt-0.5 text-xs text-slate-500">Terima informasi penting tentang akun dan aktivitasmu.</p>
            </div>
            <Toggle ariaLabel="Pembaruan email" checked={preferences.emailUpdates} onChange={(value) => updatePreference('emailUpdates', value)} />
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Pengumuman produk</p>
              <p className="mt-0.5 text-xs text-slate-500">Dapatkan informasi tentang fitur belajar dan platform terbaru.</p>
            </div>
            <Toggle ariaLabel="Pengumuman produk" checked={preferences.productAnnouncements} onChange={(value) => updatePreference('productAnnouncements', value)} />
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Ringkasan mingguan</p>
              <p className="mt-0.5 text-xs text-slate-500">Dapatkan ringkasan aktivitas EduSpace setiap minggu.</p>
            </div>
            <Toggle ariaLabel="Ringkasan mingguan" checked={preferences.weeklySummary} onChange={(value) => updatePreference('weeklySummary', value)} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <span role="status" className="inline-flex items-center gap-1.5 text-xs font-medium text-green">
            {saved && <><CheckCircle2 className="w-4 h-4" /> Preferensi tersimpan</>}
          </span>
          <Button
            type="button"
            variant="blue"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={savePreferences}
          >
            Simpan preferensi
          </Button>
        </div>
      </Card>

      <div className="flex items-center gap-2 rounded-xl border border-blue/15 bg-soft-blue/30 px-4 py-3 text-xs text-slate-600">
        <Bell className="w-4 h-4 shrink-0 text-blue" />
        Preferensi disimpan di perangkat ini untuk peran akunmu.
      </div>
    </div>
  );
};
