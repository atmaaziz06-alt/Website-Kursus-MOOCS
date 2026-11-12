import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { User, UserRole } from '../types';
import { getErrorMessage } from '../lib/errors';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { setRememberSession } from '../lib/sessionStorage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<UserRole>;
  register: (
    email: string,
    password: string,
    fullName: string,
    wantsInstructor: boolean,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isUserRole = (value: string): value is UserRole =>
  value === 'participant' || value === 'instructor' || value === 'admin';

const titleByRole: Record<UserRole, string> = {
  participant: 'Peserta',
  instructor: 'Pengajar',
  admin: 'Admin',
};

const configurationMessage =
  'Supabase belum dikonfigurasi. Salin .env.example menjadi .env.local, isi URL dan anon key Supabase, lalu jalankan ulang aplikasi.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('participant');
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem('eduspace_role');
    localStorage.removeItem('eduspace_authenticated');
    const client = supabase;
    if (!client) {
      setIsLoading(false);
      return;
    }

    let active = true;
    let requestId = 0;

    const loadProfile = async (session: Session | null) => {
      const currentRequest = ++requestId;
      if (!session) {
        if (!active || currentRequest !== requestId) return;
        setUser(null);
        setRole('participant');
        setAuthError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error } = await client
        .from('profiles')
        .select('full_name, role, is_active, avatar_path')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active || currentRequest !== requestId) return;
      if (error) {
        setUser(null);
        setAuthError(getErrorMessage(error));
        setIsLoading(false);
        return;
      }
      if (!data || !data.is_active || !isUserRole(data.role)) {
        setUser(null);
        setRole('participant');
        setAuthError(data ? 'Akun ini sedang dinonaktifkan.' : 'Profil akun tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      setRole(data.role);
      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        name: data.full_name,
        role: data.role,
        avatarId: data.avatar_path ?? session.user.id,
        title: titleByRole[data.role],
      });
      setAuthError(null);
      setIsLoading(false);
    };

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void loadProfile(session);
      }, 0);
    });

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError(getErrorMessage(error));
        setIsLoading(false);
        return;
      }
      void loadProfile(data.session);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    if (!supabase) throw new Error(configurationMessage);
    setRememberSession(rememberMe);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(getErrorMessage(error));
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError) throw new Error(getErrorMessage(profileError));
    if (!profile || !profile.is_active || !isUserRole(profile.role)) {
      await supabase.auth.signOut();
      throw new Error('Profil akun tidak aktif atau belum disiapkan oleh administrator.');
    }
    return profile.role;
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    wantsInstructor: boolean,
  ) => {
    if (!supabase) throw new Error(configurationMessage);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, wants_instructor: wantsInstructor },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw new Error(getErrorMessage(error));
    return !data.session;
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(getErrorMessage(error));
  };

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error(configurationMessage);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(getErrorMessage(error));
  };

  const updatePassword = async (password: string) => {
    if (!supabase) throw new Error(configurationMessage);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(getErrorMessage(error));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: user !== null,
        isLoading,
        isConfigured: isSupabaseConfigured,
        authError,
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
