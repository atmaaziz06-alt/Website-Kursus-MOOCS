import React from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  count?: number | string;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pill' | 'segmented' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className = '',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-6 border-b border-border ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                isActive
                  ? 'text-navy border-b-2 border-orange font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-soft-blue text-blue' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100/80 rounded-xl border border-border/80 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 select-none ${
              isActive
                ? 'bg-white text-navy shadow-sm'
                : 'text-slate-600 hover:text-navy hover:bg-white/50'
            } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-soft-blue text-blue font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

