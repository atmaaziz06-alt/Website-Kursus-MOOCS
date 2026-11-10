import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from '../ui/SocialIcons';

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

        {/* Right: Social Media */}
        <div className="flex items-center gap-3 text-slate-200">
          <span className="text-slate-300 font-medium">Ikuti Kami:</span>
          <div className="flex items-center gap-2">
            <a
              href="#social"
              className="w-5 h-5 rounded-full flex items-center justify-center hover:text-white hover:bg-navy-dark transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="#social"
              className="w-5 h-5 rounded-full flex items-center justify-center hover:text-white hover:bg-navy-dark transition-colors"
              aria-label="Twitter"
            >
              <TwitterIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="#social"
              className="w-5 h-5 rounded-full flex items-center justify-center hover:text-white hover:bg-navy-dark transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="#social"
              className="w-5 h-5 rounded-full flex items-center justify-center hover:text-white hover:bg-navy-dark transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
