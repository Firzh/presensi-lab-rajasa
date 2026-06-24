import clsx from 'clsx';
import { useEffect, useState } from 'preact/hooks';
import { LAPORAN_STATUS_OPTIONS } from '../../../lib/laporanUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';
import { apiFetch } from '../../../lib/apiClient.js';

export function LaporanFilterBar({ filters, theme = 'light', onFilterChange, onApply }) {
  const isDark = theme === 'dark';
  const [rombelOptions, setRombelOptions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    apiFetch('/api/rombel/options')
      .then((res) => {
        if (!isMounted || !res.ok || !res.data?.success) {
          return;
        }

        const payload = res.data.data;
        const options = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.rombel)
            ? payload.rombel
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload?.rows)
                ? payload.rows
                : [];

        setRombelOptions(options);
      })
      .catch(() => {
        if (isMounted) {
          setRombelOptions([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const safeRombelOptions = Array.isArray(rombelOptions) ? rombelOptions : [];

  return (
    <section
      className={clsx(
        'grid gap-5 rounded-xl p-5 lg:grid-cols-5 md:grid-cols-2',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <label className="relative flex flex-col gap-1">
        <span className="text-sm font-bold text-[#8b9298]">Tanggal Mulai</span>
        <input
          type="date"
          className={clsx(
            'h-12 w-full rounded-xl border px-4 text-sm font-medium outline-none transition',
            isDark
              ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4]'
              : 'border-[#d5dde8] bg-[#f4f5f7] text-[#43505a] hover:border-[#5f95df]'
          )}
          style={isDark ? { colorScheme: 'dark' } : {}}
          value={filters.date_from}
          onInput={(event) => onFilterChange('date_from', event.currentTarget.value)}
        />
      </label>

      <label className="relative flex flex-col gap-1">
        <span className="text-sm font-bold text-[#8b9298]">Tanggal Akhir</span>
        <input
          type="date"
          className={clsx(
            'h-12 w-full rounded-xl border px-4 text-sm font-medium outline-none transition',
            isDark
              ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4]'
              : 'border-[#d5dde8] bg-[#f4f5f7] text-[#43505a] hover:border-[#5f95df]'
          )}
          style={isDark ? { colorScheme: 'dark' } : {}}
          value={filters.date_to}
          onInput={(event) => onFilterChange('date_to', event.currentTarget.value)}
        />
      </label>

      <label className="relative flex flex-col gap-1">
        <span className="text-sm font-bold text-[#8b9298]">Rombel</span>
        <AppSelect
          aria-label="Filter Rombel"
          icon="users"
          theme={theme}
          value={filters.rombel_id}
          onInput={(event) => onFilterChange('rombel_id', event.currentTarget.value)}
        >
          <option value="">Semua Rombel</option>
          {safeRombelOptions.map((item) => (
            <option key={item.rombel_id} value={item.rombel_id}>
              {item.label_rombel || item.label || `Rombel ${item.rombel_id}`}
            </option>
          ))}
        </AppSelect>
      </label>

      <label className="relative flex flex-col gap-1">
        <span className="text-sm font-bold text-[#8b9298]">Status</span>
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
      </label>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onApply}
          className={clsx(
            'flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition',
            isDark
              ? 'bg-[#4f8fe7] text-white hover:bg-[#3876c9]'
              : 'bg-[#4f8fe7] text-white hover:bg-[#3876c9]'
          )}
        >
          <AppIcon name="magnifyingGlass" />
          Terapkan Filter
        </button>
      </div>

      <div className="md:col-span-2 lg:col-span-5 relative mt-2">
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
          placeholder="Cari NISN, Nama, atau lainnya (Pencarian Lokal)..."
          value={filters.keyword}
          onInput={(event) => onFilterChange('keyword', event.currentTarget.value)}
        />
      </div>
    </section>
  );
}
