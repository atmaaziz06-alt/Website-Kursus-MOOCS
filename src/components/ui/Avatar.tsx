import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  // Consistent background color based on name
  const getBgColor = (n: string) => {
    const colors = [
      'bg-blue text-white',
      'bg-navy text-white',
      'bg-indigo-600 text-white',
      'bg-amber-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover shrink-0 border border-white/80 shadow-sm ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full font-bold flex items-center justify-center shrink-0 border border-white/80 shadow-sm select-none ${sizeStyles[size]} ${getBgColor(
        name
      )} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

