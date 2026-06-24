import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';

export function SiswaFilterBar({ filters, options, theme = 'light', onChange }) {
  const inputClass = clsx(
    'h-12 w-full rounded-xl border px-4 text-sm font-medium outline-none transition',
    theme === 'dark'
      ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] placeholder:text-[#F0EDE4]/70 focus:border-[#F0EDE4] focus:ring-2 focus:ring-[#F0EDE4]/20'
      : 'border-[#d5dde8] bg-white text-[#43505a] placeholder:text-[#8b9298] focus:border-[#7ea4d4] focus:ring-2 focus:ring-[#7ea4d4]/20'
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
        'grid grid-cols-1 gap-4 rounded-xl p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[1.2fr_1fr_1fr_1fr] xl:gap-5',
        theme === 'dark' ? 'bg-[#313b45]' : 'bg-white'
      )}
      aria-label="Filter data siswa"
    >
      <label className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0EDE4]">
          <AppIcon name="magnifyingGlass" />
        </span>
        <input
          type="search"
          className={clsx(inputClass, 'pl-14')}
          placeholder="Cari NISN, NIS, atau nama..."
          value={filters.keyword}
          onInput={(event) => updateFilter('keyword', event.currentTarget.value)}
        />
      </label>

      <AppSelect
        icon="building"
        theme={theme}
        value={filters.jurusan_id}
        onInput={(event) => updateFilter('jurusan_id', event.currentTarget.value)}
      >
        <option value="">Semua Jurusan</option>
        {(options?.jurusan ?? []).map((jurusan) => (
          <option key={jurusan.jurusan_id} value={jurusan.jurusan_id}>
            {jurusan.kode_jurusan}
          </option>
        ))}
      </AppSelect>

      <AppSelect
        icon="graduationCap"
        theme={theme}
        value={filters.rombel_id}
        onInput={(event) => updateFilter('rombel_id', event.currentTarget.value)}
      >
        <option value="">Semua Kelas</option>
        {(options?.rombel ?? []).map((rombel) => (
          <option key={rombel.rombel_id} value={rombel.rombel_id}>
            {rombel.label}
          </option>
        ))}
      </AppSelect>

      <AppSelect
        icon="circleCheck"
        theme={theme}
        value={filters.status}
        onInput={(event) => updateFilter('status', event.currentTarget.value)}
      >
        <option value="">Semua Status</option>
        {(options?.statuses ?? []).map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </AppSelect>
    </section>
  );
}
