import React from 'react';

export interface ChipProps {
  children: React.ReactNode;
  variant?: 'soft-blue' | 'white' | 'navy' | 'orange' | 'outline' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isSquare?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'soft-blue',
  size = 'md',
  className = '',
  isSquare = false,
  onClick,
  onRemove,
}) => {
  const variantStyles = {
    'soft-blue': 'bg-soft-blue text-blue border border-blue/10',
    'white': 'bg-white text-navy border border-border shadow-sm',
    'navy': 'bg-navy text-white',
    'orange': 'bg-orange-tint text-orange-dark border border-orange/20',
    'outline': 'bg-transparent text-slate-700 border border-border hover:border-slate-300',
    'slate': 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const squareSizeStyles = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const pillSizeStyles = {
    sm: 'text-xs px-2.5 py-1 rounded-full',
    md: 'text-sm px-3.5 py-1.5 rounded-full',
    lg: 'text-base px-4 py-2 rounded-full',
  };

  if (isSquare) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${squareSizeStyles[size]} ${variantStyles[variant]} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${pillSizeStyles[size]} ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-slate-400 hover:text-slate-700 focus:outline-none"
          aria-label="Remove filter"
        >
          ×
        </button>
      )}
    </div>
  );
};

