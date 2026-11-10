import React from 'react';

export type ButtonVariant = 'navy' | 'orange' | 'outline' | 'ghost' | 'blue' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'navy',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    navy: 'bg-navy text-white hover:bg-navy-dark focus-visible:ring-navy shadow-sm hover:shadow',
    orange: 'bg-orange text-white hover:bg-orange-dark focus-visible:ring-orange shadow-sm hover:shadow',
    blue: 'bg-blue text-white hover:bg-blue-dark focus-visible:ring-blue shadow-sm hover:shadow',
    outline: 'bg-white text-navy border border-border hover:bg-app hover:border-slate-300 focus-visible:ring-blue',
    secondary: 'bg-white text-slate-700 border border-border hover:bg-slate-50 hover:text-navy focus-visible:ring-blue',
    ghost: 'bg-transparent text-slate-600 hover:text-navy hover:bg-soft-blue/50 focus-visible:ring-blue',
    danger: 'bg-red text-white hover:bg-red-700 focus-visible:ring-red',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

