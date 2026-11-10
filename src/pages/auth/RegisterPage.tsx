import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';
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
                  Ketentuan Layanan dan Kebijakan Privasi EduSpace (versi demo)
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

        <p className="my-6 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
          Pendaftaran Google dan GitHub belum tersedia. Buat akun demo melalui formulir di atas.
        </p>

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
