import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { Card, Input, Button, Alert, Checkbox } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const role = await login(email.trim(), password, rememberMe);
      const routeState = location.state as { from?: string } | null;
      const safeReturnTo = routeState?.from?.startsWith('/') && !routeState.from.startsWith('//')
        ? routeState.from
        : getDashboardPath(role);
      navigate(safeReturnTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal masuk. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout mode="login">
      <Card className="p-8 sm:p-10 shadow-soft-lg border-border">
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue block mb-1">
            Akses Anggota
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading tracking-tight mb-1.5">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Masuk menggunakan email dan kata sandi akunmu
          </p>
        </div>

        {!isConfigured && (
          <Alert type="warning" className="mb-5">
            Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local.
          </Alert>
        )}
        {errorMessage && (
          <Alert type="error" className="mb-5" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alamat Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@contoh.com"
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          <Input
            label="Kata Sandi"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <Checkbox
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              label="Ingat saya"
            />
            <Link to="/forgot-password" className="font-semibold text-blue hover:underline">
              Lupa kata sandi?
            </Link>
          </div>

          <Button
            type="submit"
            variant="navy"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!isConfigured}
            className="mt-2"
          >
            Masuk
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Belum memiliki akun?{' '}
          <Link to="/register" className="font-bold text-navy hover:text-blue">
            Daftar
          </Link>
        </p>
      </Card>
    </AuthSplitLayout>
  );
};

const getDashboardPath = (role: UserRole): string =>
  role === 'instructor' ? '/instructor' : role === 'admin' ? '/admin' : '/student';
