import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { Card, Input, Button, Checkbox } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [roleSelection, setRoleSelection] = useState<UserRole>('participant');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Kata sandi lemah', color: 'bg-red' };
    if (score === 2) return { score: 2, label: 'Kata sandi sedang', color: 'bg-orange' };
    if (score >= 3) return { score: 3, label: 'Kata sandi kuat', color: 'bg-green' };
    return { score: 0, label: '', color: 'bg-slate-200' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!fullName || !email || !password || !confirmPassword || !agreeTerms) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    login(roleSelection);
    if (roleSelection === 'instructor') {
      navigate('/instructor');
    } else {
      navigate('/student');
    }
  };

  return (
    <AuthSplitLayout mode="register">
      <Card className="p-8 sm:p-10 shadow-soft-lg border-border">
        {/* Header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-dark block mb-1">
            Pendaftaran Cepat
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading tracking-tight mb-1.5">
            Buat Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Bergabunglah dengan peserta aktif dan pengajar berpengalaman
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-text-heading mb-2 uppercase tracking-wide">
            Saya ingin bergabung sebagai
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRoleSelection('participant')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                roleSelection === 'participant'
                  ? 'border-blue bg-soft-blue/40 ring-1 ring-blue'
                  : 'border-border bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <BookOpen
                  className={`w-4 h-4 ${
                    roleSelection === 'participant' ? 'text-blue' : 'text-slate-400'
                  }`}
                />
                {roleSelection === 'participant' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-text-heading block">Peserta</span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Saya ingin belajar
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRoleSelection('instructor')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                roleSelection === 'instructor'
                  ? 'border-blue bg-soft-blue/40 ring-1 ring-blue'
                  : 'border-border bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <GraduationCap
                  className={`w-4 h-4 ${
                    roleSelection === 'instructor' ? 'text-blue' : 'text-slate-400'
                  }`}
                />
                {roleSelection === 'instructor' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-text-heading block">Pengajar</span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Saya ingin mengajar
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap*"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="mis. Dian Paramitha"
            leftIcon={<User className="w-4 h-4" />}
            error={submitted && !fullName ? 'Nama lengkap wajib diisi' : undefined}
            required
          />

          <Input
            label="Alamat Email*"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@eduspace.ac.id"
            leftIcon={<Mail className="w-4 h-4" />}
            error={submitted && !email ? 'Alamat email wajib diisi' : undefined}
            required
          />

          <div>
            <Input
              label="Kata Sandi*"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={submitted && !password ? 'Kata sandi wajib diisi' : undefined}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 block">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Konfirmasi Kata Sandi*"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={
                !passwordsMatch
                  ? 'Kata sandi tidak sama. Pastikan kedua kata sandi cocok.'
                  : undefined
              }
              required
            />
          </div>

          <div className="pt-1">
            <Checkbox
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              label={
                <span>
                  Saya menyetujui{' '}
                  <a href="#terms" className="text-blue font-semibold hover:underline">
                    Ketentuan Layanan
                  </a>{' '}
                  dan{' '}
                  <a href="#privacy" className="text-blue font-semibold hover:underline">
                    Kebijakan Privasi
                  </a>
                </span>
              }
            />
            {submitted && !agreeTerms && (
              <p className="mt-1 text-xs text-red font-medium">Kamu harus menyetujui ketentuan untuk melanjutkan</p>
            )}
          </div>

          <Button
            type="submit"
            variant={roleSelection === 'instructor' ? 'navy' : 'orange'}
            size="lg"
            fullWidth
            className="mt-3"
          >
            Buat Akun
          </Button>
        </form>

        {/* Social signup divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            ATAU DAFTAR DENGAN
          </span>
        </div>

        {/* Google & GitHub Outline Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              login(roleSelection);
              navigate(roleSelection === 'instructor' ? '/instructor' : '/student');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              login(roleSelection);
              navigate(roleSelection === 'instructor' ? '/instructor' : '/student');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Already have an account */}
        <p className="text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="font-bold text-navy hover:text-blue">
            Masuk
          </Link>
        </p>
      </Card>
    </AuthSplitLayout>
  );
};
