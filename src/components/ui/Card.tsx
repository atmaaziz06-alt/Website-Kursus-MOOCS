import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'white' | 'tint' | 'navy' | 'flat';
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  className = '',
  hoverable = false,
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white border border-border shadow-soft',
    tint: 'bg-soft-blue/30 border border-blue/15',
    navy: 'bg-navy text-white border border-navy-dark shadow-soft-md',
    flat: 'bg-white border border-border',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-md hover:border-blue/30 cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

