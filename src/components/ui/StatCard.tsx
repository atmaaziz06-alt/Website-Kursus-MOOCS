import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: 'soft-blue' | 'orange' | 'green' | 'navy';
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconVariant = 'soft-blue',
  badge,
  trend,
  className = '',
}) => {
  const iconBgStyles = {
    'soft-blue': 'bg-soft-blue text-blue',
    'orange': 'bg-orange-tint text-orange-dark',
    'green': 'bg-green-tint text-green',
    'navy': 'bg-navy/10 text-navy',
  };

  return (
    <Card className={`p-5 relative ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {label}
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-text-heading tracking-tight">
            {value}
          </div>
        </div>

        {icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgStyles[iconVariant]}`}>
            {icon}
          </div>
        )}
      </div>

      {(subtext || trend || badge) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-green' : 'text-orange-dark'
              }`}
            >
              {trend.value}
            </span>
          )}
          {badge}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </Card>
  );
};

