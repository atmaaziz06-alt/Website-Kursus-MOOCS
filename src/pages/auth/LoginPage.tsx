import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { Card, Input, Button, Alert, Checkbox } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { useCourses } from '../../context/CourseContext';
import { mockCourses } from '../../data/mockData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, role: currentRole } = useAuth();
  const { enrollInCourse } = useCourses();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const demoAccounts: Record<UserRole, { email: string; label: string; route: string }> = {
    participant: {
      email: 'dian.paramitha@eduspace.ac.id',
      label: 'Participant',
      route: '/student',
    },
    instructor: {
      email: 'john.smith@eduspace.ac.id',
      label: 'Instructor',
      route: '/instructor',
    },
    admin: {
      email: 'admin@eduspace.ac.id',
      label: 'Admin',
      route: '/admin',
    },
  };
  const [email, setEmail] = useState(demoAccounts[currentRole].email);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Simulate login validation
    setTimeout(() => {
      setIsLoading(false);
      const account = demoAccounts[selectedRole];
      if (email.trim().toLowerCase() !== account.email || password !== 'password123') {
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
      } else {
        login(selectedRole);
        const routeState = location.state as { from?: string; enrollCourse?: string } | null;
        const courseToEnroll = selectedRole === 'participant'
          ? mockCourses.find((course) => course.slug === routeState?.enrollCourse)
          : undefined;
        if (courseToEnroll) {
          enrollInCourse(courseToEnroll);
          navigate('/student/courses', {
            replace: true,
            state: { enrolledCourse: courseToEnroll.title },
          });
          return;
        }

        const returnTo = routeState?.from;
        const safeReturnTo = returnTo?.startsWith('/') && !returnTo.startsWith('//')
          ? returnTo
          : account.route;
        navigate(safeReturnTo, {
          replace: true,
          state: routeState?.enrollCourse
            ? { enrollmentRoleError: true }
            : undefined,
        });
      }
    }, 400);
  };

  const selectDemoRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <AuthSplitLayout mode="login">
      <Card className="p-8 sm:p-10 shadow-soft-lg border-border">
        {/* Header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue block mb-1">
            Member Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading tracking-tight mb-1.5">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Login as participant, instructor, or admin
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert type="error" className="mb-6" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Form */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-text-heading mb-2 uppercase tracking-wide">
            Login as
          </label>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Choose account role">
            {(['participant', 'instructor', 'admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={selectedRole === role}
                onClick={() => selectDemoRole(role)}
                className={`rounded-lg px-2 py-2 text-xs font-bold transition-colors ${
                  selectedRole === role
                    ? 'bg-blue text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-soft-blue hover:text-blue'
                }`}
              >
                {demoAccounts[role].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Demo account: <strong>{demoAccounts[selectedRole].email}</strong> · Password: <strong>password123</strong>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label="Remember me"
            />
            <a href="#forgot" className="text-xs font-semibold text-blue hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="navy"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            Login
          </Button>
        </form>

        {/* Social divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Google & GitHub Outline Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setErrorMessage('Google sign-in is not configured in this demo. Use one of the demo accounts below.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
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
              setErrorMessage('GitHub sign-in is not configured in this demo. Use one of the demo accounts below.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Don't have an account */}
        <p className="text-center text-xs text-slate-500 mb-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-navy hover:text-blue">
            Register
          </Link>
        </p>

      </Card>
    </AuthSplitLayout>
  );
};
