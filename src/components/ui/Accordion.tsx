import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(() => {
    return items.filter((item) => item.defaultOpen).map((item) => item.id);
  });

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-border rounded-xl bg-white overflow-hidden transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors duration-150 select-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 pr-4 flex-1">
                <div className="flex-1">
                  <div className="text-sm font-bold text-text-heading flex items-center gap-2">
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div className="text-xs text-slate-500 mt-0.5">{item.subtitle}</div>
                  )}
                </div>
                {item.badge && <div>{item.badge}</div>}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'transform rotate-180 text-blue' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-border/50 bg-white">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

