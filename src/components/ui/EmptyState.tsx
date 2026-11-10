import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-soft-blue flex items-center justify-center text-blue mb-4">
        {icon || <BookOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-text-heading mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          {primaryAction && (
            <Button variant="orange" size="md" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

