import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';

export function DashboardTopbar({ theme = 'light', onToggleTheme }) {
  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-30 flex min-h-18 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:left-65 lg:right-0 lg:h-21.5 lg:flex-nowrap lg:px-7 lg:py-0',
        theme === 'dark' ? 'bg-[#141b23] text-[#f4f1ec]' : 'bg-white text-[#43505a]'
      )}
    >
      <label
        className={clsx(
          'order-2 flex h-10 w-full items-center gap-3 rounded-lg px-4 sm:order-1 sm:w-72 lg:w-105',
          theme === 'dark' ? 'bg-[#303b46] text-[#d8dee5]' : 'bg-[#f1f2f5] text-[#6b747c]'
        )}
      >
        <AppIcon name="magnifyingGlass" />
        <input
          type="search"
          placeholder="Cari..."
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-current"
        />
      </label>

      <div className="order-1 flex items-center gap-3 sm:order-2 sm:gap-5">
        <button type="button" className="text-xl" onClick={onToggleTheme} aria-label="Ubah tema">
          <AppIcon name="circleHalfStroke" />
        </button>

        <button type="button" className="text-base" aria-label="Notifikasi">
          <AppIcon name="bell" />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#cfe1f4] font-extrabold text-[#43505a]">
            A
          </div>

          <div className="hidden sm:block">
            <p className="m-0 text-base font-medium">Administrator Utama</p>
            <p className="m-0 text-sm text-[#89929a]">Admin Operator</p>
          </div>

          <AppIcon name="angleDown" className="hidden text-xs text-[#89929a] sm:block" />
        </div>
      </div>
    </header>
  );
}
