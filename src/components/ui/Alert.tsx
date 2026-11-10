import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    success: {
      container: 'bg-green-tint border border-green/20 text-green-900',
      icon: <CheckCircle2 className="w-5 h-5 text-green shrink-0 mt-0.5" />,
      titleColor: 'text-green-900',
    },
    error: {
      container: 'bg-red-tint border border-red/20 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />,
      titleColor: 'text-red-900',
    },
    warning: {
      container: 'bg-amber-50 border border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-900',
    },
    info: {
      container: 'bg-soft-blue/40 border border-blue/20 text-blue-950',
      icon: <Info className="w-5 h-5 text-blue shrink-0 mt-0.5" />,
      titleColor: 'text-blue-950',
    },
  };

  const current = styles[type];

  return (
    <div className={`p-4 rounded-xl flex items-start gap-3 relative ${current.container} ${className}`}>
      {current.icon}
      <div className="flex-1 text-sm">
        {title && <h5 className={`font-bold mb-0.5 ${current.titleColor}`}>{title}</h5>}
        <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
          aria-label="Tutup pemberitahuan"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
