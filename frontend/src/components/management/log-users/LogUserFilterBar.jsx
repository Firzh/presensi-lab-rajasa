import clsx from 'clsx';

import { LOG_USER_FILTER_OPTIONS } from '../../../lib/adminUsersUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';

export function LogUserFilterBar({ filters, theme = 'light', onChange }) {
  const isDark = theme === 'dark';

  function updateFilter(key, value) {
    onChange?.({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section
      className={clsx(
        'grid grid-cols-1 gap-4 rounded-xl p-4 sm:p-5 lg:grid-cols-[1fr_1fr] lg:gap-5',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
      aria-label="Filter log users"
    >
      <label className="relative">
        <span
          className={clsx(
            'absolute left-4 top-1/2 -translate-y-1/2 border-r pr-4 text-xl',
            isDark ? 'border-[#f4f1ec]/50 text-[#f4f1ec]' : 'border-[#8b9298] text-[#43505a]'
          )}
        >
          <AppIcon name="magnifyingGlass" />
        </span>
        <input
          type="search"
          className={clsx(
            'h-12 w-full rounded-lg border-0 pl-18 pr-4 text-sm font-medium outline-none transition focus:ring-2',
            isDark
              ? 'bg-[#56616d] text-[#f4f1ec] placeholder:text-[#f4f1ec]/70 hover:bg-[#64717d] focus:ring-[#f4f1ec]/20'
              : 'bg-[#f1f2f5] text-[#43505a] placeholder:text-[#8b9298] hover:bg-[#e5e9ef] focus:ring-[#7ea4d4]/25'
          )}
          placeholder="Cari Username, Nama Lengkap, atau lainnya..."
          value={filters.keyword}
          onInput={(event) => updateFilter('keyword', event.currentTarget.value)}
        />
      </label>

      <AppSelect
        icon="toggleOn"
        theme={theme}
        value={filters.filter}
        onInput={(event) => updateFilter('filter', event.currentTarget.value)}
        className="min-w-0"
      >
        {LOG_USER_FILTER_OPTIONS.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </AppSelect>
    </section>
  );
}
