import React from 'react';
import { Link } from 'react-router-dom';

export const PlaceholderPage: React.FC<{ title: string; subtitle?: string; backUrl?: string }> = ({
  title,
  subtitle = 'Modul ini sudah disiapkan dan siap untuk dikembangkan.',
  backUrl = '/',
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-soft-blue flex items-center justify-center text-blue font-bold text-xl mb-4">
        ES
      </div>
      <h2 className="text-2xl font-bold text-text-heading mb-2">{title}</h2>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">{subtitle}</p>
      <Link
        to={backUrl}
        className="text-xs font-bold text-white bg-navy hover:bg-navy-dark px-4 py-2.5 rounded-xl transition-colors"
      >
        ← Kembali
      </Link>
    </div>
  );
};
