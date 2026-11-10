import React from 'react';
import { Mail, Phone } from 'lucide-react';

export const TopContactBar: React.FC = () => {
  return (
    <div className="bg-navy text-white text-xs py-2 px-4 sm:px-8 border-b border-navy-dark select-none">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Contact Info */}
        <div className="flex items-center gap-4 text-slate-200">
          <a
            href="mailto:info@eduspace.com"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-blue-tint" />
            <span>info@eduspace.com</span>
          </a>
          <span className="text-navy-dark opacity-80">|</span>
          <a
            href="tel:+12345678900"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-tint" />
            <span>+1 234 567 8900</span>
          </a>
        </div>

        <span className="text-slate-300">Belajar untuk semua</span>
      </div>
    </div>
  );
};
