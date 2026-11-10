import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 select-none ${className}`}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`dots-${idx}`} className="w-8 text-center text-slate-400 font-bold select-none">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => onPageChange(Number(page))}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
              isCurrent
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white border border-border text-slate-700 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
