import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';
import { z } from 'zod';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { Card, Input, Button, Checkbox, Alert } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const registrationSchema = z.object({
  fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().trim().email('Masukkan alamat email yang valid'),
  password: z.string().min(8, 'Kata sandi harus terdiri dari minimal 8 karakter'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(Boolean, 'Kamu harus menyetujui ketentuan untuk melanjutkan'),
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Kata sandi tidak sama. Pastikan kedua kata sandi cocok.',
});

type RegistrationField = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'agreeTerms';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isConfigured } = useAuth();
  const [roleSelection, setRoleSelection] = useState<'participant' | 'instructor'>('participant');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegistrationField, string>>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getPasswordStrength = (value: string) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (!value) return { score: 0, label: '', color: 'bg-slate-200' };
    if (score <= 1) return { score: 1, label: 'Kata sandi lemah', color: 'bg-red' };
    if (score === 2) return { score: 2, label: 'Kata sandi sedang', color: 'bg-orange' };
    return { score: 3, label: 'Kata sandi kuat', color: 'bg-green' };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const result = registrationSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      agreeTerms,
    });

    if (!result.success) {
      const errors: Partial<Record<RegistrationField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as RegistrationField;
        errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      const needsEmailConfirmation = await register(
        result.data.email,
        result.data.password,
        result.data.fullName,
        roleSelection === 'instructor',
      );
      if (needsEmailConfirmation) {
        setSuccessMessage('Akun berhasil dibuat. Periksa email untuk mengonfirmasi alamat sebelum masuk.');
      } else {
        navigate('/student', { replace: true });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <AuthSplitLayout mode="register">
      <Card className="p-8 sm:p-10 shadow-soft-lg border-border">
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-dark block mb-1">
            Pendaftaran
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading tracking-tight mb-1.5">
            Buat Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Bergabunglah dengan peserta dan pengajar EduSpace
          </p>
        </div>

        {!isConfigured && (
          <Alert type="warning" className="mb-5">
            Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local.
          </Alert>
        )}
        {errorMessage && <Alert type="error" className="mb-5">{errorMessage}</Alert>}
        {successMessage && <Alert type="success" className="mb-5">{successMessage}</Alert>}

        <div className="mb-6">
          <label className="block text-xs font-semibold text-text-heading mb-2 uppercase tracking-wide">
            Saya ingin bergabung sebagai
          </label>
          <div className="grid grid-cols-2 gap-3">
            <RoleOption
              selected={roleSelection === 'participant'}
              onClick={() => setRoleSelection('participant')}
              icon={<BookOpen className="w-4 h-4" />}
              title="Peserta"
              description="Saya ingin belajar"
            />
            <RoleOption
              selected={roleSelection === 'instructor'}
              onClick={() => setRoleSelection('instructor')}
              icon={<GraduationCap className="w-4 h-4" />}
              title="Pengajar"
              description="Permintaan ditinjau admin"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Semua akun baru dimulai sebagai peserta. Permintaan pengajar harus disetujui admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nama Lengkap*"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="mis. Dian Paramitha"
            leftIcon={<User className="w-4 h-4" />}
            error={submitted ? fieldErrors.fullName : undefined}
            autoComplete="name"
          />
          <Input
            label="Alamat Email*"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@contoh.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={submitted ? fieldErrors.email : undefined}
            autoComplete="email"
          />
          <div>
            <Input
              label="Kata Sandi*"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              leftIcon={<Lock className="w-4 h-4" />}
              error={submitted ? fieldErrors.password : undefined}
              autoComplete="new-password"
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 block">{strength.label}</span>
              </div>
            )}
          </div>
          <Input
            label="Konfirmasi Kata Sandi*"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Ulangi kata sandi"
            leftIcon={<Lock className="w-4 h-4" />}
            error={submitted ? fieldErrors.confirmPassword : undefined}
            autoComplete="new-password"
          />
          <div className="pt-1">
            <Checkbox
              checked={agreeTerms}
              onChange={(event) => setAgreeTerms(event.target.checked)}
              label={<span>Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi EduSpace.</span>}
            />
            {submitted && fieldErrors.agreeTerms && (
              <p className="mt-1 text-xs text-red font-medium">{fieldErrors.agreeTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            variant={roleSelection === 'instructor' ? 'navy' : 'orange'}
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!isConfigured}
            className="mt-3"
          >
            Buat Akun
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="font-bold text-navy hover:text-blue">
            Masuk
          </Link>
        </p>
      </Card>
    </AuthSplitLayout>
  );
};

const RoleOption: React.FC<{
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ selected, onClick, icon, title, description }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
      selected ? 'border-blue bg-soft-blue/40 ring-1 ring-blue' : 'border-border bg-white hover:border-slate-300'
    }`}
  >
    <div className="flex items-center justify-between mb-1.5">
      <span className={selected ? 'text-blue' : 'text-slate-400'}>{icon}</span>
      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-blue" />}
    </div>
    <span className="text-xs font-bold text-text-heading block">{title}</span>
    <span className="text-[11px] text-slate-500 block leading-tight">{description}</span>
  </button>
);
