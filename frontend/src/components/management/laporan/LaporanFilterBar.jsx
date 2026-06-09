import clsx from 'clsx';

import { LAPORAN_STATUS_OPTIONS } from '../../../lib/laporanUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';

export function LaporanFilterBar({ filters, theme = 'light', onFilterChange }) {
  const isDark = theme === 'dark';

  return (
    <section
      className={clsx(
        'grid gap-5 rounded-xl p-5 md:grid-cols-[1fr_1fr]',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <label className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9298]">
          <AppIcon name="magnifyingGlass" />
        </span>

        <input
          type="search"
          className={clsx(
            'h-12 w-full rounded-xl border px-4 pl-14 text-sm font-medium outline-none transition',
            isDark
              ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] placeholder:text-[#F0EDE4]/70 hover:border-[#F0EDE4]'
              : 'border-[#d5dde8] bg-[#f4f5f7] text-[#43505a] placeholder:text-[#8b9298] hover:border-[#5f95df]'
          )}
          placeholder="Cari NISN, NIS, atau lainnya..."
          value={filters.keyword}
          onInput={(event) => onFilterChange('keyword', event.currentTarget.value)}
        />
      </label>

      <AppSelect
        aria-label="Filter Status"
        icon="toggleOn"
        theme={theme}
        value={filters.status}
        onInput={(event) => onFilterChange('status', event.currentTarget.value)}
      >
        {LAPORAN_STATUS_OPTIONS.map((item) => (
          <option key={item.value || 'all'} value={item.value}>
            {item.label}
          </option>
        ))}
      </AppSelect>
    </section>
  );
}
