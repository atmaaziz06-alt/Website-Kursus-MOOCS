import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Award, Users, BookOpen } from 'lucide-react';
import { media } from '../../config/media';

export interface AuthSplitLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children, mode }) => {
  const isLogin = mode === 'login';
  const bgImage = isLogin ? media.auth.loginPanel : media.auth.registerPanel;

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Tombol kembali ke beranda / Logo */}
        <div className="mb-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 px-3 items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100">
              <img src="/eduspace-logo.png" alt="Logo EduSpace" className="h-6 w-auto object-contain" />
            </div>
            <span className="font-bold text-navy text-lg">EduSpace</span>
          </Link>
        </div>

        {/* Card Form Login/Register */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};
