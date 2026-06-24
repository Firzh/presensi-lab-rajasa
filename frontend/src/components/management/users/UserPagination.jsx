import clsx from 'clsx';

import { getVisiblePages } from '../../../lib/adminUsersUtils.js';

export function UserPagination({ currentPage = 1, totalPages = 1, theme = 'light', onPageChange }) {
  const isDark = theme === 'dark';

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={clsx(
        'mt-6 flex flex-wrap justify-center gap-3 text-base font-bold sm:gap-4',
        isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
      )}
    >
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        disabled={currentPage === 1}
        className="transition hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
      >
        ‹
      </button>

      {getVisiblePages(currentPage, totalPages).map((page) => (
        <button
          key={page}
          type="button"
          className={clsx(
            'min-w-7 rounded-md px-2 transition hover:scale-105',
            page === currentPage
              ? isDark
                ? 'bg-[#f4f1ec] text-[#1d262e]'
                : 'bg-[#d8dee5] text-[#43505a]'
              : 'opacity-70 hover:opacity-100'
          )}
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="Halaman berikutnya"
        disabled={currentPage === totalPages}
        className="transition hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
      >
        ›
      </button>
    </div>
  );
}
