import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { Alert, Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Tautan reset tidak dapat dikirim.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout mode="login">
      <Card className="p-8 sm:p-10 shadow-soft-lg border-border">
        <h1 className="text-2xl font-extrabold text-text-heading mb-2">Lupa kata sandi?</h1>
        <p className="text-sm text-slate-500 mb-6">
          Masukkan email akunmu. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
        </p>
        {errorMessage && <Alert type="error" className="mb-5">{errorMessage}</Alert>}
        {sent && (
          <Alert type="success" className="mb-5">
            Jika email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan folder spam.
          </Alert>
        )}
        {!isConfigured && (
          <Alert type="warning" className="mb-5">
            Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local.
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alamat Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />
          <Button type="submit" fullWidth isLoading={isLoading} disabled={!isConfigured}>
            Kirim tautan pemulihan
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-bold text-navy hover:text-blue">Kembali ke masuk</Link>
        </p>
      </Card>
    </AuthSplitLayout>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, isConfigured } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (password.length < 8) {
      setErrorMessage('Kata sandi harus terdiri dari minimal 8 karakter.');
      return;
    }
    if (password !== confirmation) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setIsLoading(true);
    try {
      await updatePassword(password);
      navigate('/login', { replace: true, state: { passwordUpdated: true } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Kata sandi tidak dapat diperbarui.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout mode="login">
      <Card className="p-8 sm:p-10 shadow-soft-lg border-border">
        <h1 className="text-2xl font-extrabold text-text-heading mb-2">Atur ulang kata sandi</h1>
        <p className="text-sm text-slate-500 mb-6">Buat kata sandi baru untuk akun EduSpace-mu.</p>
        {errorMessage && <Alert type="error" className="mb-5">{errorMessage}</Alert>}
        {!isConfigured && (
          <Alert type="warning" className="mb-5">
            Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local.
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kata Sandi Baru"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            required
          />
          <Input
            label="Konfirmasi Kata Sandi"
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            required
          />
          <Button type="submit" fullWidth isLoading={isLoading} disabled={!isConfigured}>
            Simpan kata sandi baru
          </Button>
        </form>
      </Card>
    </AuthSplitLayout>
  );
};
