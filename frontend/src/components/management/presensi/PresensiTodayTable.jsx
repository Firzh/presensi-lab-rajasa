import clsx from 'clsx';

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

function getVisiblePages(currentPage, totalPages) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safeCurrentPage = Math.min(Math.max(1, Number(currentPage) || 1), safeTotalPages);
  const startPage = Math.max(1, safeCurrentPage - 2);
  const endPage = Math.min(safeTotalPages, safeCurrentPage + 2);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
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
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <section className={clsx('w-full min-w-0 max-w-full overflow-hidden rounded-xl p-4 sm:p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
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
          <select
            className={clsx(
              'h-10 rounded-md border px-3 text-sm font-bold outline-none',
              isDark
                ? 'border-[#1d262e] bg-[#25303a] text-[#f4f1ec]'
                : 'border-[#d7dee7] bg-white text-[#43505a]'
            )}
            value={selectedRombelId}
            onChange={(event) => onRombelChange?.(event.currentTarget.value)}
          >
            <option value="">Semua rombel</option>
            {rombelOptions.map((rombel) => (
              <option key={rombel.rombel_id} value={rombel.rombel_id}>
                {rombel.label_rombel}
              </option>
            ))}
          </select>

          <span className="rounded-md bg-[#a9c9f4]/30 px-3 py-2 text-xs font-extrabold text-[#4f6b8b]">
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

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md bg-[#a9c9f4]/30 px-3 py-2 text-xs font-extrabold text-[#4f6b8b] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            Prev
          </button>

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              className={clsx(
                'rounded-md px-3 py-2 text-xs font-extrabold',
                page === currentPage
                  ? 'bg-[#456da1] text-white'
                  : 'bg-[#a9c9f4]/30 text-[#4f6b8b]'
              )}
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="rounded-md bg-[#a9c9f4]/30 px-3 py-2 text-xs font-extrabold text-[#4f6b8b] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}