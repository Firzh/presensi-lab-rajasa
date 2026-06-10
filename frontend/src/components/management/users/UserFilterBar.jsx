import { useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { ADMIN_USER_FILTER_OPTIONS } from '../../../lib/adminUsersUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';

function getSelectedLabel(selectedValues) {
  if (selectedValues.length === 0) {
    return 'Pilih Filter';
  }

  const selectedOptions = ADMIN_USER_FILTER_OPTIONS.filter((option) =>
    selectedValues.includes(option.value)
  );

  if (selectedOptions.length === 1) {
    return selectedOptions[0].label;
  }

  return `${selectedOptions.length} filter dipilih`;
}

export function UserFilterBar({ filters, theme = 'light', onChange }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isDark = theme === 'dark';
  const selectedValues = useMemo(() => {
    if (Array.isArray(filters.selectedFilters)) {
      return filters.selectedFilters;
    }

    return filters.filter ? [filters.filter] : [];
  }, [filters.filter, filters.selectedFilters]);

  function updateFilter(key, value) {
    onChange?.({
      ...filters,
      [key]: value,
    });
  }

  function toggleSelectedFilter(value) {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    onChange?.({
      ...filters,
      selectedFilters: nextValues,
      filter: nextValues[0] ?? '',
    });
  }

  function clearSelectedFilters() {
    onChange?.({
      ...filters,
      selectedFilters: [],
      filter: '',
    });
  }

  return (
    <section
      className={clsx(
        'grid grid-cols-1 gap-4 rounded-xl p-4 sm:p-5 lg:grid-cols-[1fr_1fr] lg:gap-5',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
      aria-label="Filter data users"
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
          value={filters.keyword ?? ''}
          onInput={(event) => updateFilter('keyword', event.currentTarget.value)}
        />
      </label>

      <div className="relative">
        <button
          type="button"
          className={clsx(
            'flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-medium transition',
            isDark
              ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
              : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
          )}
          aria-expanded={isFilterOpen}
          onClick={() => setIsFilterOpen((current) => !current)}
        >
          <span>{getSelectedLabel(selectedValues)}</span>
          <AppIcon name="angleDown" />
        </button>

        {isFilterOpen ? (
          <div
            className={clsx(
              'absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border shadow-lg',
              isDark ? 'border-[#64717d] bg-[#56616d]' : 'border-[#d5dde8] bg-white'
            )}
          >
            <button
              type="button"
              className={clsx(
                'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold transition',
                selectedValues.length === 0
                  ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                  : isDark
                    ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                    : 'text-[#43505a] hover:bg-[#eef1f5]'
              )}
              onClick={clearSelectedFilters}
            >
              <span>Semua non-siswa</span>
              {selectedValues.length === 0 ? <span>✓</span> : null}
            </button>

            {ADMIN_USER_FILTER_OPTIONS.map((option) => {
              const selected = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  className={clsx(
                    'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold transition',
                    selected
                      ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                      : isDark
                        ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                        : 'text-[#43505a] hover:bg-[#eef1f5]'
                  )}
                  onClick={() => toggleSelectedFilter(option.value)}
                >
                  <span>{option.label}</span>
                  {selected ? <span>✓</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
