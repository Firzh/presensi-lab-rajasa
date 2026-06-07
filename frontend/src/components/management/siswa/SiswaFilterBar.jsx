import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

export function SiswaFilterBar({ filters, theme = 'light', onChange }) {
  const inputClass = clsx(
    'h-12 w-full rounded-md border-0 px-4 text-sm font-medium outline-none appearance-none',
    theme === 'dark'
      ? 'bg-[#56616d] text-[#f4f1ec] placeholder:text-[#d6dce2]'
      : 'bg-[#f1f2f5] text-[#43505a] placeholder:text-[#8b9298]'
  );

  function updateFilter(key, value) {
    onChange?.({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section
      className={clsx(
        'grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-5 rounded-xl p-5',
        theme === 'dark' ? 'bg-[#313b45]' : 'bg-white'
      )}
      aria-label="Filter data siswa"
    >
      <label className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#62707a]">
          <AppIcon name="magnifyingGlass" />
        </span>
        <input
          type="search"
          className={clsx(inputClass, 'pl-14 pr-12')}
          placeholder="Cari NISN, NIS, atau nama..."
          value={filters.keyword}
          onInput={(event) => updateFilter('keyword', event.currentTarget.value)}
        />
      </label>

      <label className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#62707a]">
          <AppIcon name="building" />
        </span>
        <select
          className={clsx(inputClass, 'pl-14 pr-12')}
          value={filters.jurusan}
          onInput={(event) => updateFilter('jurusan', event.currentTarget.value)}
        >
          <option value="">Semua Jurusan</option>
          <option value="TKJ">TKJ</option>
          <option value="RPL">RPL</option>
        </select>
      </label>

      <label className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#62707a]">
          <AppIcon name="graduationCap" />
        </span>
        <select
          className={clsx(inputClass, 'pl-14 pr-12')}
          value={filters.kelas}
          onInput={(event) => updateFilter('kelas', event.currentTarget.value)}
        >
          <option value="">Semua Kelas</option>
          <option value="X-1">X-1</option>
          <option value="X-2">X-2</option>
          <option value="XI-1">XI-1</option>
        </select>
      </label>

      <label className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#62707a]">
          <AppIcon name="circleCheck" />
        </span>
        <select
          className={clsx(inputClass, 'pl-14 pr-12')}
          value={filters.status}
          onInput={(event) => updateFilter('status', event.currentTarget.value)}
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </label>
    </section>
  );
}
