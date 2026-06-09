import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';

export function DashboardTopbar({ theme = 'light', onToggleTheme }) {
  return (
    <header
      className={clsx(
        'fixed left-65 right-0 top-0 z-10 flex h-21.5 items-center justify-between px-7',
        theme === 'dark' ? 'bg-[#141b23] text-[#f4f1ec]' : 'bg-white text-[#43505a]'
      )}
    >
      <label
        className={clsx(
          'flex h-9 w-105 items-center gap-3 rounded-lg px-4',
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

      <div className="flex items-center gap-5">
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

          <div>
            <p className="m-0 text-base font-medium">Administrator Utama</p>
            <p className="m-0 text-sm text-[#89929a]">Admin Operator</p>
          </div>

          <AppIcon name="angleDown" className="text-xs text-[#89929a]" />
        </div>
      </div>
    </header>
  );
}
