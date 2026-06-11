import { useState } from 'preact/hooks';
import clsx from 'clsx';

import { UserPagination } from '../users/UserPagination.jsx';
import { AppIcon } from '../../ui/AppIcon.jsx';

function getRombelOptionLabel(rombel) {
  return rombel.label_rombel || rombel.nama_rombel || rombel.nama_kelas || `Rombel ${rombel.rombel_id}`;
}

function RombelSingleSelect({ theme, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';
  const selectedOption = options.find((rombel) => String(rombel.rombel_id) === String(value));
  const selectedLabel = selectedOption ? getRombelOptionLabel(selectedOption) : 'Semua rombel';

  function handleSelect(nextValue) {
    onChange?.(nextValue);
    setIsOpen(false);
  }

  return (
    <div className="relative w-full sm:w-56">
      <button
        type="button"
        className={clsx(
          'flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-medium transition',
          isDark
            ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
            : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
        )}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{selectedLabel}</span>
        <AppIcon name="angleDown" />
      </button>

      {isOpen ? (
        <div
          className={clsx(
            'absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border shadow-lg',
            isDark ? 'border-[#64717d] bg-[#56616d]' : 'border-[#d5dde8] bg-white'
          )}
        >
          <button
            type="button"
            className={clsx(
              'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold transition',
              value === ''
                ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                : isDark
                  ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                  : 'text-[#43505a] hover:bg-[#eef1f5]'
            )}
            onClick={() => handleSelect('')}
          >
            <span>Semua rombel</span>
            {value === '' ? <span>✓</span> : null}
          </button>

          {options.map((rombel) => {
            const optionValue = String(rombel.rombel_id);
            const selected = String(value) === optionValue;

            return (
              <button
                key={rombel.rombel_id}
                type="button"
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold transition',
                  selected
                    ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                    : isDark
                      ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                      : 'text-[#43505a] hover:bg-[#eef1f5]'
                )}
                onClick={() => handleSelect(optionValue)}
              >
                <span className="truncate">{getRombelOptionLabel(rombel)}</span>
                {selected ? <span>✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ value }) {
  const normalized = String(value || '-').toLowerCase();

  const className =
    normalized === 'hadir'
      ? 'bg-green-500/10 text-green-400'
      : normalized === 'alpha'
        ? 'bg-red-500/10 text-red-400'
        : normalized === 'warning'
          ? 'bg-yellow-500/10 text-yellow-400'
          : normalized === 'terlambat'
            ? 'bg-orange-500/10 text-orange-400'
            : 'bg-slate-500/10 text-slate-400';

  return (
    <span className={clsx('rounded-md px-3 py-1 text-xs font-extrabold', className)}>
      {normalized}
    </span>
  );
}

export function PresensiTodayTable({
  rows,
  totalRows = 0,
  rombelOptions = [],
  selectedRombelId = '',
  currentPage = 1,
  totalPages = 1,
  theme = 'light',
  onRombelChange,
  onPageChange,
}) {
  const isDark = theme === 'dark';
  const items = rows || [];

  return (
    <section className={clsx('w-full min-w-0 max-w-full overflow-visible rounded-xl p-4 sm:p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-5 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h2
            className={clsx(
              'm-0 text-xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Presensi Hari Ini
          </h2>
          <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
            Referensi audit presensi masuk dari scan.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <RombelSingleSelect
            theme={theme}
            options={rombelOptions}
            value={selectedRombelId}
            onChange={onRombelChange}
          />

          <span
            className={clsx(
              'rounded-md px-3 py-2 text-xs font-extrabold',
              isDark
                ? 'bg-[#a9c9f4] text-[#13202d] shadow-sm'
                : 'bg-[#a9c9f4]/30 text-[#4f6b8b]'
            )}
          >
            {totalRows} Data
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className={isDark ? 'bg-[#1d262e] text-[#cfd8e3]' : 'bg-[#eef1f5] text-[#6f7882]'}>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Sesi</th>
              <th className="px-3 py-3">Scan Log</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">NISN</th>
              <th className="px-3 py-3">Kelas</th>
              <th className="px-3 py-3">Tanggal</th>
              <th className="px-3 py-3">Jam</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Mode</th>
              <th className="px-3 py-3">Scan At</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center font-bold text-[#8b9298]" colSpan={11}>
                  Belum ada presensi hari ini.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.presensi_id}
                  className={clsx(
                    'border-b',
                    isDark ? 'border-[#1d262e] text-[#cfd8e3]' : 'border-[#e5e9ef] text-[#6f7882]'
                  )}
                >
                  <td className="px-3 py-3">{row.presensi_id}</td>
                  <td className="px-3 py-3">{row.presensi_sesi_id || '-'}</td>
                  <td className="px-3 py-3">{row.scan_log_id || '-'}</td>
                  <td className="px-3 py-3 font-bold">
                    {row.siswa?.nama_lengkap || row.nama_lengkap || '-'}
                  </td>
                  <td className="px-3 py-3">{row.siswa?.nisn || row.nisn || '-'}</td>
                  <td className="px-3 py-3">
                    {row.rombel?.label_rombel || row.siswa?.kelas_aktif || row.kelas_aktif || '-'}
                  </td>
                  <td className="px-3 py-3">{row.tanggal || '-'}</td>
                  <td className="px-3 py-3">
                    {row.jam?.jam_ke ? `Jam ${row.jam.jam_ke}` : row.jam_id || '-'}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge value={row.status} />
                  </td>
                  <td className="px-3 py-3">{row.mode_presensi || '-'}</td>
                  <td className="px-3 py-3">{row.scanned_at || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        theme={theme}
        onPageChange={onPageChange}
      />
    </section>
  );
}