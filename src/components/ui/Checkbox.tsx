import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  checked,
  onChange,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label htmlFor={checkboxId} className={`inline-flex items-start gap-2.5 cursor-pointer select-none group ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <div className="relative flex items-center mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 ${
          checked 
            ? 'bg-blue border-blue text-white' 
            : 'bg-white border-border group-hover:border-slate-400'
        } ${className}`}>
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>
      {(label || description) && (
        <div className="text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

