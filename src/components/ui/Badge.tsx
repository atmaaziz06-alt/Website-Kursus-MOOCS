import React from 'react';

export type BadgeVariant = 
  | 'active'
  | 'draft'
  | 'in-review'
  | 'preview-free'
  | 'technology'
  | 'business'
  | 'design'
  | 'development'
  | 'orange'
  | 'navy'
  | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full uppercase tracking-wider transition-colors duration-150';

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-1.5',
  };

  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor?: string }> = {
    'active': { bg: 'bg-green-tint border border-green/20', text: 'text-green', dotColor: 'bg-green' },
    'draft': { bg: 'bg-slate-100 border border-slate-200', text: 'text-slate-600', dotColor: 'bg-slate-400' },
    'in-review': { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', dotColor: 'bg-amber-500' },
    'preview-free': { bg: 'bg-soft-blue border border-blue/20', text: 'text-blue', dotColor: 'bg-blue' },
    'technology': { bg: 'bg-blue/10 border border-blue/20', text: 'text-blue', dotColor: 'bg-blue' },
    'business': { bg: 'bg-amber-50 border border-orange/20', text: 'text-orange', dotColor: 'bg-orange' },
    'design': { bg: 'bg-indigo-50 border border-indigo-200', text: 'text-indigo-600', dotColor: 'bg-indigo-600' },
    'development': { bg: 'bg-orange-tint border border-orange/20', text: 'text-orange', dotColor: 'bg-orange' },
    'orange': { bg: 'bg-orange-tint border border-orange/30', text: 'text-orange-dark', dotColor: 'bg-orange' },
    'navy': { bg: 'bg-navy/10 border border-navy/20', text: 'text-navy', dotColor: 'bg-navy' },
    'neutral': { bg: 'bg-slate-100 text-slate-700 border border-slate-200', text: 'text-slate-700', dotColor: 'bg-slate-500' },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${style.bg} ${style.text} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor || 'bg-current'}`} />
      )}
      {children}
    </span>
  );
};

